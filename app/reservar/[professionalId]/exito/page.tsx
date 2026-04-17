import Link from "next/link";
import { notFound } from "next/navigation";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const metadata = {
  title: "Pago recibido - SuperTurnos",
  description: "Tu seña fue procesada",
};

export default async function ReservaExitoPage({
  params,
  searchParams,
}: {
  params: Promise<{ professionalId: string }>;
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { professionalId } = await params;
  const { session_id: sessionId } = await searchParams;

  if (!professionalId || !UUID_RE.test(professionalId)) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-slate-100 px-4 py-10 dark:from-emerald-950/30 dark:to-slate-950">
      <div className="mx-auto max-w-md space-y-6 text-center">
        <div className="rounded-2xl border border-emerald-200 bg-white px-6 py-8 shadow-sm dark:border-emerald-900 dark:bg-slate-900">
          <p className="text-lg font-semibold text-emerald-800 dark:text-emerald-200">
            ¡Gracias! Pago recibido
          </p>
          <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
            Stripe confirma el pago; el turno pasa a <strong>confirmado</strong> en
            segundos. Si Stripe tiene activados los recibos por email, el cliente
            los recibe ahí.
          </p>
          {sessionId && (
            <p className="mt-4 break-all font-mono text-xs text-slate-400">
              Sesión: {sessionId}
            </p>
          )}
        </div>
        <Link
          href={`/reservar/${professionalId}`}
          className="inline-block rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-medium text-white dark:bg-slate-100 dark:text-slate-900"
        >
          Volver a reservar
        </Link>
      </div>
    </div>
  );
}
