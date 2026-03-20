"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { nextUtcDatesFromToday } from "@/lib/utc-dates";

type Service = {
  id: string;
  name: string;
  duration_minutes: number;
  price: number;
};

type Context = {
  professional: { id: string; full_name: string | null };
  services: Service[];
};

type Props = { professionalId: string };

function formatUtcDateLabel(isoDate: string): string {
  const [y, m, d] = isoDate.split("-").map(Number);
  const dt = new Date(Date.UTC(y, (m ?? 1) - 1, d ?? 1));
  return dt.toLocaleDateString("es-AR", {
    weekday: "short",
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  });
}

export function BookingFlow({ professionalId }: Props) {
  const [ctx, setCtx] = useState<Context | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(
    null
  );
  const dates = useMemo(() => nextUtcDatesFromToday(14), []);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [slots, setSlots] = useState<string[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotsError, setSlotsError] = useState<string | null>(null);
  const [pickedSlot, setPickedSlot] = useState<string | null>(null);
  const [booking, setBooking] = useState(false);
  const [done, setDone] = useState(false);
  const [bookError, setBookError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoadError(null);
      const r = await fetch(
        `/api/public/booking-context?professional_id=${encodeURIComponent(professionalId)}`
      );
      const j = await r.json().catch(() => ({}));
      if (cancelled) return;
      if (!r.ok) {
        setLoadError(j.error ?? "No se pudo cargar");
        return;
      }
      setCtx(j as Context);
      const first = (j as Context).services[0]?.id ?? null;
      setSelectedServiceId(first);
      setSelectedDate(dates[0] ?? null);
    })();
    return () => {
      cancelled = true;
    };
  }, [professionalId, dates]);

  const fetchSlots = useCallback(
    async (serviceId: string, date: string) => {
      setSlotsLoading(true);
      setSlotsError(null);
      setSlots([]);
      setPickedSlot(null);
      const u = new URL("/api/availability", window.location.origin);
      u.searchParams.set("professional_id", professionalId);
      u.searchParams.set("service_id", serviceId);
      u.searchParams.set("date", date);
      const r = await fetch(u.toString());
      const j = await r.json().catch(() => ({}));
      setSlotsLoading(false);
      if (!r.ok) {
        setSlotsError(j.error ?? "Error al cargar horarios");
        return;
      }
      setSlots(Array.isArray(j.slots) ? j.slots : []);
    },
    [professionalId]
  );

  useEffect(() => {
    if (!selectedServiceId || !selectedDate) return;
    fetchSlots(selectedServiceId, selectedDate);
  }, [selectedServiceId, selectedDate, fetchSlots]);

  const selectedService = ctx?.services.find((s) => s.id === selectedServiceId);

  async function confirmBooking() {
    if (!selectedServiceId || !selectedDate || !pickedSlot) return;
    setBooking(true);
    setBookError(null);
    const r = await fetch("/api/public/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        professional_id: professionalId,
        service_id: selectedServiceId,
        date: selectedDate,
        slot: pickedSlot,
      }),
    });
    const j = await r.json().catch(() => ({}));
    setBooking(false);
    if (!r.ok) {
      setBookError(j.error ?? "No se pudo reservar");
      return;
    }
    setDone(true);
    setPickedSlot(null);
    fetchSlots(selectedServiceId, selectedDate);
  }

  if (loadError) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">
        {loadError}
      </div>
    );
  }

  if (!ctx) {
    return (
      <div className="flex justify-center py-12 text-slate-500">
        <span className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-slate-700 dark:border-slate-600 dark:border-t-slate-200" />
      </div>
    );
  }

  const title = ctx.professional.full_name?.trim() || "Reservar turno";

  if (done) {
    return (
      <div className="space-y-4 text-center">
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-6 dark:border-emerald-900 dark:bg-emerald-950/30">
          <p className="text-lg font-semibold text-emerald-900 dark:text-emerald-100">
            ¡Listo!
          </p>
          <p className="mt-1 text-sm text-emerald-800 dark:text-emerald-200/90">
            Tu reserva quedó confirmada.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setDone(false)}
          className="w-full rounded-xl bg-slate-900 py-3 text-sm font-medium text-white dark:bg-slate-100 dark:text-slate-900"
        >
          Reservar otro turno
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-50 sm:text-2xl">
          {title}
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Elegí servicio, día y hora. Horarios en UTC (misma base que tu agenda).
        </p>
      </header>

      {/* Servicio */}
      <section className="space-y-2">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Servicio
        </h2>
        <div className="flex flex-wrap gap-2">
          {ctx.services.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setSelectedServiceId(s.id)}
              className={`min-h-[44px] rounded-full px-4 py-2 text-sm font-medium transition ${
                selectedServiceId === s.id
                  ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
                  : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
              }`}
            >
              {s.name}
              <span className="ml-1 opacity-70">
                · {s.duration_minutes} min
              </span>
            </button>
          ))}
        </div>
        {selectedService && selectedService.price > 0 && (
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Precio referencia:{" "}
            <span className="font-medium">
              {selectedService.price.toLocaleString("es-AR", {
                style: "currency",
                currency: "ARS",
                maximumFractionDigits: 0,
              })}
            </span>
          </p>
        )}
      </section>

      {/* Fechas */}
      <section className="space-y-2">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Día
        </h2>
        <div className="-mx-1 flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
          {dates.map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => setSelectedDate(d)}
              className={`shrink-0 min-h-[44px] min-w-[4.5rem] rounded-xl px-3 py-2 text-center text-sm transition ${
                selectedDate === d
                  ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
                  : "border border-slate-200 bg-white text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
              }`}
            >
              <span className="block text-[10px] uppercase opacity-80">
                {d.slice(8, 10)}/{d.slice(5, 7)}
              </span>
              <span className="block truncate text-xs font-medium">
                {formatUtcDateLabel(d)}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* Horarios */}
      <section className="space-y-2">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Hora inicio (UTC)
        </h2>
        {slotsLoading && (
          <p className="text-sm text-slate-500">Cargando horarios…</p>
        )}
        {slotsError && (
          <p className="text-sm text-red-600 dark:text-red-400">{slotsError}</p>
        )}
        {!slotsLoading && !slotsError && slots.length === 0 && (
          <p className="text-sm text-slate-500">
            No hay turnos libres ese día para este servicio.
          </p>
        )}
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {slots.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setPickedSlot(t)}
              className={`min-h-[44px] rounded-lg text-sm font-medium transition ${
                pickedSlot === t
                  ? "bg-amber-500 text-white ring-2 ring-amber-300 ring-offset-2 dark:ring-offset-slate-950"
                  : "border border-slate-200 bg-white text-slate-800 hover:border-slate-400 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </section>

      {pickedSlot && (
        <div className="sticky bottom-0 -mx-1 space-y-2 border-t border-slate-200 bg-gradient-to-t from-slate-50 pt-4 dark:border-slate-800 dark:from-slate-950">
          <p className="text-center text-sm text-slate-600 dark:text-slate-300">
            {selectedService?.name} · {selectedDate} · {pickedSlot} UTC
          </p>
          {bookError && (
            <p className="text-center text-sm text-red-600 dark:text-red-400">
              {bookError}
            </p>
          )}
          <button
            type="button"
            disabled={booking}
            onClick={confirmBooking}
            className="w-full min-h-[48px] rounded-xl bg-slate-900 py-3 text-base font-semibold text-white disabled:opacity-60 dark:bg-emerald-600 dark:hover:bg-emerald-500"
          >
            {booking ? "Reservando…" : "Confirmar reserva"}
          </button>
        </div>
      )}
    </div>
  );
}
