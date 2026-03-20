"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getBusinessHours, upsertBusinessHours } from "@/app/actions/business-hours";
import {
  BUSINESS_DAY_NAMES,
  type BusinessHourRow,
} from "@/lib/business-hours";

type TimeRange = { day_of_week: number; start_time: string; end_time: string };

function formatTimeForInput(t: string): string {
  if (!t) return "09:00";
  const parts = String(t).split(":");
  return `${parts[0]?.padStart(2, "0") || "09"}:${parts[1]?.padStart(2, "0") || "00"}`;
}

export function BusinessHoursForm() {
  const router = useRouter();
  const [ranges, setRanges] = useState<TimeRange[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getBusinessHours().then(({ data, error: err }) => {
      setLoading(false);
      if (err) setError(err);
      else if (data?.length) {
        setRanges(
          data.map((h: BusinessHourRow) => ({
            day_of_week: h.day_of_week,
            start_time: formatTimeForInput(h.start_time),
            end_time: formatTimeForInput(h.end_time),
          }))
        );
      }
    });
  }, []);

  function addRange(dayOfWeek: number) {
    setRanges((prev) => [
      ...prev,
      { day_of_week: dayOfWeek, start_time: "09:00", end_time: "18:00" },
    ]);
  }

  function removeRange(index: number) {
    setRanges((prev) => prev.filter((_, i) => i !== index));
  }

  function updateRange(index: number, field: keyof TimeRange, value: number | string) {
    setRanges((prev) =>
      prev.map((r, i) => (i === index ? { ...r, [field]: value } : r))
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    const result = await upsertBusinessHours(ranges);
    setSaving(false);
    if (result.error) setError(result.error);
    else {
      router.refresh();
    }
  }

  if (loading) {
    return (
      <div className="text-slate-500 dark:text-slate-400">Cargando...</div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      )}

      <div className="space-y-4">
        {BUSINESS_DAY_NAMES.map((dayName, dayOfWeek) => {
          const dayRanges = ranges
            .map((r, i) => (r.day_of_week === dayOfWeek ? { r, i } : null))
            .filter((x): x is { r: TimeRange; i: number } => x !== null);
          return (
            <div
              key={dayOfWeek}
              className="rounded-lg border border-slate-200 p-4 dark:border-slate-700"
            >
              <div className="mb-3 flex items-center justify-between">
                <span className="font-medium text-slate-900 dark:text-slate-50">
                  {dayName}
                </span>
                <button
                  type="button"
                  onClick={() => addRange(dayOfWeek)}
                  className="text-sm text-slate-600 hover:underline dark:text-slate-400"
                >
                  + Agregar horario
                </button>
              </div>
              {dayRanges.length === 0 ? (
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Cerrado
                </p>
              ) : (
                <div className="space-y-2">
                  {dayRanges.map(({ r, i }) => (
                    <div key={i} className="flex items-center gap-2">
                      <input
                        type="time"
                        value={r.start_time}
                        onChange={(e) =>
                          updateRange(i, "start_time", e.target.value)
                        }
                        className="rounded border border-slate-300 px-2 py-1 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                      />
                      <span className="text-slate-500">a</span>
                      <input
                        type="time"
                        value={r.end_time}
                        onChange={(e) =>
                          updateRange(i, "end_time", e.target.value)
                        }
                        className="rounded border border-slate-300 px-2 py-1 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                      />
                      <button
                        type="button"
                        onClick={() => removeRange(i)}
                        className="text-sm text-red-600 hover:underline dark:text-red-400"
                      >
                        Quitar
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <button
        type="submit"
        disabled={saving}
        className="rounded-lg bg-slate-900 px-4 py-2 font-medium text-white hover:bg-slate-800 disabled:opacity-50 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
      >
        {saving ? "Guardando..." : "Guardar horarios"}
      </button>
    </form>
  );
}
