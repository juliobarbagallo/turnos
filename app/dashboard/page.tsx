import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

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
        <div className="flex gap-3">
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
      )}
    </div>
  );
}
