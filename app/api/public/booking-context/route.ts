import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * GET /api/public/booking-context?professional_id=uuid
 * Datos mínimos para la página de reserva (sin auth).
 */
export async function GET(request: Request) {
  const professionalId = new URL(request.url).searchParams.get(
    "professional_id"
  );

  if (!professionalId || !UUID_RE.test(professionalId)) {
    return NextResponse.json(
      { error: "professional_id inválido" },
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

  const [{ data: profile }, { data: services, error: servicesErr }] =
    await Promise.all([
      admin
        .from("profiles")
        .select("full_name")
        .eq("id", professionalId)
        .maybeSingle(),
      admin
        .from("services")
        .select("id, name, duration_minutes, price")
        .eq("user_id", professionalId)
        .order("created_at", { ascending: false }),
    ]);

  if (servicesErr) {
    return NextResponse.json({ error: servicesErr.message }, { status: 500 });
  }

  const list = services ?? [];
  if (list.length === 0) {
    return NextResponse.json(
      { error: "Este profesional aún no tiene servicios publicados" },
      { status: 404 }
    );
  }

  return NextResponse.json({
    professional: {
      id: professionalId,
      full_name: profile?.full_name ?? null,
    },
    services: list,
  });
}
