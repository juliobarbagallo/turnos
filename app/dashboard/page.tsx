import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { CopyPublicBookingLink } from "@/components/CopyPublicBookingLink";

export const metadata = {
  title: "Dashboard - SuperTurnos",
  description: "Panel de administración",
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role")
    .eq("id", user.id)
    .single();

  const role = profile?.role ?? "customer";
  const isAdmin = role === "admin";

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-50">
        Bienvenido
      </h2>
      <p className="text-slate-600 dark:text-slate-400">
        {isAdmin
          ? "Como profesional, podés gestionar tus servicios y agenda."
          : "Como cliente, podés ver tus reservas y hacer nuevas."}
      </p>
      {isAdmin && (
        <div className="space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-50">
              Link público de reservas
            </h3>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              Compartilo con clientes para que elijan turno sin iniciar sesión.
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Link
                href={`/reservar/${user.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-500"
              >
                Abrir vista cliente
              </Link>
              <CopyPublicBookingLink path={`/reservar/${user.id}`} />
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/dashboard/servicios"
              className="rounded-lg bg-slate-900 px-4 py-2 font-medium text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
            >
              Gestionar servicios
            </Link>
            <Link
              href="/dashboard/horarios"
              className="rounded-lg border border-slate-300 px-4 py-2 font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Horarios de atención
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
