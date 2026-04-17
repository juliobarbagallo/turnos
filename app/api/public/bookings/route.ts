import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  getAvailabilitySlots,
  slotUtcRange,
} from "@/lib/get-availability-slots";
import { getStripe } from "@/lib/stripe-server";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type Body = {
  professional_id?: string;
  service_id?: string;
  date?: string;
  slot?: string;
};

function siteOrigin(request: Request): string {
  const env = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  if (env) return env;
  return new URL(request.url).origin;
}

/**
 * POST /api/public/bookings
 * - Seña (`deposit_amount` > 0): crea `pending_payment` + Stripe Checkout → `checkout_url`.
 * - Sin seña: crea `confirmed` al instante.
 */
export async function POST(request: Request) {
  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const { professional_id: professionalId, service_id: serviceId, date, slot } =
    body;

  if (
    !professionalId ||
    !serviceId ||
    !date ||
    !slot ||
    !UUID_RE.test(professionalId) ||
    !UUID_RE.test(serviceId)
  ) {
    return NextResponse.json(
      {
        error:
          "Faltan o son inválidos: professional_id, service_id, date (YYYY-MM-DD), slot (HH:MM)",
      },
      { status: 400 }
    );
  }

  const admin = createAdminClient();
  if (!admin) {
    return NextResponse.json(
      {
        error:
          "Servidor sin SUPABASE_SERVICE_ROLE_KEY; configurar en .env.local o Vercel",
      },
      { status: 503 }
    );
  }

  const avail = await getAvailabilitySlots(admin, professionalId, serviceId, date);
  if (!avail.ok) {
    return NextResponse.json({ error: avail.error }, { status: avail.status });
  }

  if (!avail.slots.includes(slot.trim())) {
    return NextResponse.json(
      { error: "Ese horario ya no está disponible" },
      { status: 409 }
    );
  }

  const range = slotUtcRange(date, slot, avail.duration_minutes);
  if (!range) {
    return NextResponse.json({ error: "slot inválido" }, { status: 400 });
  }

  const startMs = new Date(range.start_at).getTime();
  if (startMs < Date.now()) {
    return NextResponse.json(
      { error: "No se pueden reservar horarios en el pasado" },
      { status: 400 }
    );
  }

  const { data: service, error: svcErr } = await admin
    .from("services")
    .select("id, user_id, name, deposit_amount")
    .eq("id", serviceId)
    .single();

  if (svcErr || !service) {
    return NextResponse.json({ error: "Servicio no encontrado" }, { status: 404 });
  }

  if (service.user_id !== professionalId) {
    return NextResponse.json(
      { error: "El servicio no pertenece a ese profesional" },
      { status: 400 }
    );
  }

  const deposit = Number(service.deposit_amount);
  const needsPayment = Number.isFinite(deposit) && deposit > 0;

  if (needsPayment) {
    const stripe = getStripe();
    if (!stripe) {
      return NextResponse.json(
        {
          error:
            "Este servicio requiere seña pero Stripe no está configurado (STRIPE_SECRET_KEY)",
        },
        { status: 503 }
      );
    }

    const { data: inserted, error: insertErr } = await admin
      .from("appointments")
      .insert({
        professional_id: professionalId,
        service_id: serviceId,
        start_at: range.start_at,
        end_at: range.end_at,
        status: "pending_payment",
      })
      .select("id")
      .single();

    if (insertErr) {
      if (insertErr.code === "23505") {
        return NextResponse.json(
          { error: "Ese horario acaba de ser reservado" },
          { status: 409 }
        );
      }
      if (insertErr.code === "23514") {
        return NextResponse.json(
          {
            error:
              "La base de datos no reconoce el estado pending_payment. Ejecutá la migración TT-7 en Supabase.",
          },
          { status: 503 }
        );
      }
      return NextResponse.json({ error: insertErr.message }, { status: 500 });
    }

    const origin = siteOrigin(request);
    const serviceName = String(service.name ?? "Seña / reserva");
    const unitAmount = Math.round(deposit * 100);
    if (unitAmount < 1) {
      await admin.from("appointments").delete().eq("id", inserted.id);
      return NextResponse.json(
        { error: "Monto de seña inválido" },
        { status: 400 }
      );
    }

    try {
      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        line_items: [
          {
            quantity: 1,
            price_data: {
              currency: "ars",
              unit_amount: unitAmount,
              product_data: {
                name: `${serviceName} — seña`,
                description: `Turno ${date} ${slot.trim()} UTC`,
              },
            },
          },
        ],
        success_url: `${origin}/reservar/${professionalId}/exito?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/reservar/${professionalId}?cancelled=1`,
        metadata: {
          appointment_id: inserted.id,
        },
      });

      if (!session.url) {
        await admin.from("appointments").delete().eq("id", inserted.id);
        return NextResponse.json(
          { error: "Stripe no devolvió URL de checkout" },
          { status: 500 }
        );
      }

      await admin
        .from("appointments")
        .update({ stripe_checkout_session_id: session.id })
        .eq("id", inserted.id);

      return NextResponse.json({
        checkout_url: session.url,
        appointment_id: inserted.id,
        message: "Redirigiendo al pago de la seña",
      });
    } catch (e) {
      await admin.from("appointments").delete().eq("id", inserted.id);
      const msg = e instanceof Error ? e.message : "Error de Stripe";
      return NextResponse.json({ error: msg }, { status: 502 });
    }
  }

  const { data: inserted, error: insertErr } = await admin
    .from("appointments")
    .insert({
      professional_id: professionalId,
      service_id: serviceId,
      start_at: range.start_at,
      end_at: range.end_at,
      status: "confirmed",
    })
    .select("id, start_at, end_at")
    .single();

  if (insertErr) {
    if (insertErr.code === "23505") {
      return NextResponse.json(
        { error: "Ese horario acaba de ser reservado" },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: insertErr.message }, { status: 500 });
  }

  return NextResponse.json({
    appointment: inserted,
    message: "Reserva confirmada",
  });
}
