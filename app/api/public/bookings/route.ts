import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  getAvailabilitySlots,
  slotUtcRange,
} from "@/lib/get-availability-slots";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type Body = {
  professional_id?: string;
  service_id?: string;
  date?: string;
  slot?: string;
};

/**
 * POST /api/public/bookings
 * Crea un turno confirmado (service role; RLS no permite INSERT anónimo).
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
