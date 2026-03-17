import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { SignOutButton } from "@/components/SignOutButton";

export const metadata = {
  title: "Dashboard - SuperTurnos",
  description: "Panel de administración",
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role")
    .eq("id", user.id)
    .single();

  const role = profile?.role ?? "customer";
  const isAdmin = role === "admin";

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <header className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-50">
            SuperTurnos
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-600 dark:text-slate-400">
              {profile?.full_name || user.email}
              <span className="ml-2 rounded bg-slate-200 px-2 py-0.5 text-xs dark:bg-slate-700">
                {isAdmin ? "Profesional" : "Cliente"}
              </span>
            </span>
            <SignOutButton />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-50">
          Bienvenido
        </h2>
        <p className="mt-2 text-slate-600 dark:text-slate-400">
          {isAdmin
            ? "Como profesional, podés gestionar tus servicios y agenda."
            : "Como cliente, podés ver tus reservas y hacer nuevas."}
        </p>
        <p className="mt-4 text-sm text-slate-500">
          (Dashboard completo en próximos tickets)
        </p>
      </main>
    </div>
  );
}
