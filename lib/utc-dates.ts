/**
 * Próximos `count` días calendario en UTC (alineado con /api/availability).
 */
export function nextUtcDatesFromToday(count: number): string[] {
  const now = new Date();
  const y = now.getUTCFullYear();
  const mo = now.getUTCMonth();
  const d = now.getUTCDate();
  const out: string[] = [];
  for (let i = 0; i < count; i++) {
    const dt = new Date(Date.UTC(y, mo, d + i));
    out.push(dt.toISOString().slice(0, 10));
  }
  return out;
}
