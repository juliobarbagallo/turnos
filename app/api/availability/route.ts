import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAvailabilitySlots } from "@/lib/get-availability-slots";

/**
 * GET /api/availability?professional_id=uuid&service_id=uuid&date=YYYY-MM-DD
 *
 * Requiere SUPABASE_SERVICE_ROLE_KEY en el servidor (Vercel / .env.local).
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const professionalId = searchParams.get("professional_id");
  const serviceId = searchParams.get("service_id");
  const dateStr = searchParams.get("date");

  if (!professionalId || !serviceId || !dateStr) {
    return NextResponse.json(
      {
        error:
          "Faltan parámetros: professional_id, service_id, date (YYYY-MM-DD)",
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

  const result = await getAvailabilitySlots(
    admin,
    professionalId,
    serviceId,
    dateStr
  );

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json({
    slots: result.slots,
    date: result.date,
    duration_minutes: result.duration_minutes,
    step_minutes: result.step_minutes,
  });
}
