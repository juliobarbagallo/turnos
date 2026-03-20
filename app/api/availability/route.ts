import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  SLOT_STEP_MINUTES,
  buildSlots,
  parseTimeToMinutes,
  subtractBusyFromWindows,
  utcDayOfWeek,
  utcDayStartMs,
  type TimeWindow,
} from "@/lib/availability";

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

  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return NextResponse.json(
      { error: "date debe ser YYYY-MM-DD" },
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

  const dow = utcDayOfWeek(dateStr);
  if (dow < 0) {
    return NextResponse.json({ error: "Fecha inválida" }, { status: 400 });
  }

  const { data: service, error: serviceErr } = await admin
    .from("services")
    .select("id, user_id, duration_minutes")
    .eq("id", serviceId)
    .single();

  if (serviceErr || !service) {
    return NextResponse.json({ error: "Servicio no encontrado" }, { status: 404 });
  }

  if (service.user_id !== professionalId) {
    return NextResponse.json(
      { error: "El servicio no pertenece a ese profesional" },
      { status: 400 }
    );
  }

  const durationMin = service.duration_minutes as number;
  if (durationMin < 1) {
    return NextResponse.json({ error: "Duración inválida" }, { status: 400 });
  }

  const { data: hoursRows, error: hoursErr } = await admin
    .from("business_hours")
    .select("start_time, end_time")
    .eq("user_id", professionalId)
    .eq("day_of_week", dow)
    .order("start_time", { ascending: true });

  if (hoursErr) {
    return NextResponse.json({ error: hoursErr.message }, { status: 500 });
  }

  const windows: TimeWindow[] = (hoursRows || []).map((row) => ({
    startMin: parseTimeToMinutes(String(row.start_time)),
    endMin: parseTimeToMinutes(String(row.end_time)),
  }));

  const dayStartMs = utcDayStartMs(dateStr);
  const dayEndMs = dayStartMs + 24 * 60 * 60 * 1000;

  const { data: appts, error: apptErr } = await admin
    .from("appointments")
    .select("start_at, end_at")
    .eq("professional_id", professionalId)
    .in("status", ["confirmed", "pending"])
    .lt("start_at", new Date(dayEndMs).toISOString())
    .gt("end_at", new Date(dayStartMs).toISOString());

  if (apptErr) {
    return NextResponse.json({ error: apptErr.message }, { status: 500 });
  }

  const busyMs = (appts || []).map((a) => ({
    start: new Date(a.start_at as string).getTime(),
    end: new Date(a.end_at as string).getTime(),
  }));

  const freeWindows = subtractBusyFromWindows(windows, busyMs, dayStartMs);

  const now = new Date();
  const todayStr = now.toISOString().slice(0, 10);
  let minStartMin = 0;
  if (dateStr === todayStr) {
    const elapsed = Math.floor((now.getTime() - dayStartMs) / 60000);
    minStartMin = Math.max(0, elapsed);
  } else if (dateStr < todayStr) {
    return NextResponse.json({ slots: [], date: dateStr, duration_minutes: durationMin });
  }

  const slots = buildSlots(freeWindows, durationMin, SLOT_STEP_MINUTES, minStartMin);

  return NextResponse.json({
    slots,
    date: dateStr,
    duration_minutes: durationMin,
    step_minutes: SLOT_STEP_MINUTES,
  });
}
