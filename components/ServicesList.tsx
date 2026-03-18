import { getServices } from "@/app/actions/services";
import { DeleteServiceButton } from "./DeleteServiceButton";
import Link from "next/link";

export async function ServicesList() {
  const { data: services, error } = await getServices();

  if (error) {
    return (
      <div className="rounded-lg bg-red-50 p-4 text-red-700 dark:bg-red-900/20 dark:text-red-400">
        {error}
      </div>
    );
  }

  if (services.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-slate-300 p-8 text-center text-slate-500 dark:border-slate-600 dark:text-slate-400">
        <p className="font-medium">Aún no tenés servicios</p>
        <p className="mt-1 text-sm">
          Creá tu primer servicio para que los clientes puedan reservar turnos.
        </p>
        <Link
          href="/dashboard/servicios/nuevo"
          className="mt-4 inline-block rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
        >
          Crear servicio
        </Link>
      </div>
    );
  }

  return (
    <ul className="divide-y divide-slate-200 dark:divide-slate-700">
      {services.map((s) => (
        <li
          key={s.id}
          className="flex items-center justify-between py-4 first:pt-0 last:pb-0"
        >
          <div className="min-w-0 flex-1">
            <Link
              href={`/dashboard/servicios/${s.id}/editar`}
              className="font-medium text-slate-900 hover:underline dark:text-slate-50"
            >
              {s.name}
            </Link>
            <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
              {s.duration_minutes} min · ${Number(s.price).toLocaleString("es-AR")}
              {s.deposit_amount > 0 && (
                <> · Seña ${Number(s.deposit_amount).toLocaleString("es-AR")}</>
              )}
            </p>
          </div>
          <div className="ml-4 flex items-center gap-4">
            <Link
              href={`/dashboard/servicios/${s.id}/editar`}
              className="text-sm text-slate-600 hover:underline dark:text-slate-400"
            >
              Editar
            </Link>
            <DeleteServiceButton serviceId={s.id} serviceName={s.name} />
          </div>
        </li>
      ))}
    </ul>
  );
}
