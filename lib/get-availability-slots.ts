import type { SupabaseClient } from "@supabase/supabase-js";
import {
  SLOT_STEP_MINUTES,
  buildSlots,
  parseTimeToMinutes,
  subtractBusyFromWindows,
  utcDayOfWeek,
  utcDayStartMs,
  type TimeWindow,
} from "@/lib/availability";

export type AvailabilityOk = {
  ok: true;
  slots: string[];
  date: string;
  duration_minutes: number;
  step_minutes: number;
};

export type AvailabilityErr = {
  ok: false;
  error: string;
  status: number;
};

export type AvailabilityResult = AvailabilityOk | AvailabilityErr;

/**
 * Misma lógica que GET /api/availability (UTC día + business_hours).
 */
export async function getAvailabilitySlots(
  admin: SupabaseClient,
  professionalId: string,
  serviceId: string,
  dateStr: string
): Promise<AvailabilityResult> {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return { ok: false, error: "date debe ser YYYY-MM-DD", status: 400 };
  }

  const dow = utcDayOfWeek(dateStr);
  if (dow < 0) {
    return { ok: false, error: "Fecha inválida", status: 400 };
  }

  const { data: service, error: serviceErr } = await admin
    .from("services")
    .select("id, user_id, duration_minutes")
    .eq("id", serviceId)
    .single();

  if (serviceErr || !service) {
    return { ok: false, error: "Servicio no encontrado", status: 404 };
  }

  if (service.user_id !== professionalId) {
    return {
      ok: false,
      error: "El servicio no pertenece a ese profesional",
      status: 400,
    };
  }

  const durationMin = service.duration_minutes as number;
  if (durationMin < 1) {
    return { ok: false, error: "Duración inválida", status: 400 };
  }

  const { data: hoursRows, error: hoursErr } = await admin
    .from("business_hours")
    .select("start_time, end_time")
    .eq("user_id", professionalId)
    .eq("day_of_week", dow)
    .order("start_time", { ascending: true });

  if (hoursErr) {
    return { ok: false, error: hoursErr.message, status: 500 };
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
    return { ok: false, error: apptErr.message, status: 500 };
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
    return {
      ok: true,
      slots: [],
      date: dateStr,
      duration_minutes: durationMin,
      step_minutes: SLOT_STEP_MINUTES,
    };
  }

  const slots = buildSlots(
    freeWindows,
    durationMin,
    SLOT_STEP_MINUTES,
    minStartMin
  );

  return {
    ok: true,
    slots,
    date: dateStr,
    duration_minutes: durationMin,
    step_minutes: SLOT_STEP_MINUTES,
  };
}

/** Inicio/fin ISO del slot en el día UTC `dateStr`. */
export function slotUtcRange(
  dateStr: string,
  slotHHMM: string,
  durationMinutes: number
): { start_at: string; end_at: string } | null {
  const m = /^(\d{1,2}):(\d{2})$/.exec(slotHHMM.trim());
  if (!m) return null;
  const hh = parseInt(m[1], 10);
  const mm = parseInt(m[2], 10);
  if (hh > 23 || mm > 59) return null;
  const dayStartMs = utcDayStartMs(dateStr);
  const startMs = dayStartMs + (hh * 60 + mm) * 60_000;
  const endMs = startMs + durationMinutes * 60_000;
  return {
    start_at: new Date(startMs).toISOString(),
    end_at: new Date(endMs).toISOString(),
  };
}
