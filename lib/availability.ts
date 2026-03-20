/** Paso entre inicios de slot (minutos). */
export const SLOT_STEP_MINUTES = 15;

export type TimeWindow = { startMin: number; endMin: number };

/**
 * Convierte "HH:MM:SS" o "HH:MM" a minutos desde medianoche.
 */
export function parseTimeToMinutes(t: string): number {
  const parts = t.split(":");
  const h = parseInt(parts[0] || "0", 10);
  const m = parseInt(parts[1] || "0", 10);
  return h * 60 + m;
}

/**
 * Día de la semana 0=Dom … 6=Sáb para un YYYY-MM-DD en UTC calendario.
 */
export function utcDayOfWeek(dateStr: string): number {
  const [y, mo, d] = dateStr.split("-").map((x) => parseInt(x, 10));
  if (!y || !mo || !d) return -1;
  return new Date(Date.UTC(y, mo - 1, d)).getUTCDay();
}

/**
 * Inicio del día UTC en ms para dateStr YYYY-MM-DD.
 */
export function utcDayStartMs(dateStr: string): number {
  const [y, mo, d] = dateStr.split("-").map((x) => parseInt(x, 10));
  return Date.UTC(y, mo - 1, d, 0, 0, 0, 0);
}

/**
 * Resta intervalos ocupados [startMs, endMs] de ventanas en minutos del día.
 */
export function subtractBusyFromWindows(
  windows: TimeWindow[],
  busyMs: { start: number; end: number }[],
  dayStartMs: number
): TimeWindow[] {
  let result: TimeWindow[] = [...windows];
  for (const b of busyMs) {
    const bs = Math.floor((b.start - dayStartMs) / 60000);
    const be = Math.ceil((b.end - dayStartMs) / 60000);
    const next: TimeWindow[] = [];
    for (const w of result) {
      if (be <= w.startMin || bs >= w.endMin) {
        next.push(w);
        continue;
      }
      if (bs > w.startMin) next.push({ startMin: w.startMin, endMin: Math.min(bs, w.endMin) });
      if (be < w.endMin) next.push({ startMin: Math.max(be, w.startMin), endMin: w.endMin });
    }
    result = next.filter((w) => w.endMin > w.startMin);
  }
  return result;
}

/**
 * Genera slots HH:MM que caben en ventanas libres con duración durationMin.
 * - No cruza medianoche del día (ventanas ya están en minutos del día).
 * - minStartMin: primer minuto permitido (p.ej. "ahora" si es hoy).
 */
export function buildSlots(
  freeWindows: TimeWindow[],
  durationMin: number,
  stepMin: number,
  minStartMin: number
): string[] {
  const slots: string[] = [];
  for (const w of freeWindows) {
    const from = Math.max(w.startMin, Math.ceil(minStartMin / stepMin) * stepMin);
    for (let t = from; t + durationMin <= w.endMin; t += stepMin) {
      const h = Math.floor(t / 60);
      const m = t % 60;
      slots.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
    }
  }
  return slots;
}
