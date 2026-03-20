import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { SignOutButton } from "@/components/SignOutButton";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <header className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
          <Link
            href="/dashboard"
            className="text-xl font-bold text-slate-900 dark:text-slate-50"
          >
            SuperTurnos
          </Link>
          <nav className="flex items-center gap-4">
            {isAdmin && (
              <>
                <Link
                  href="/dashboard/servicios"
                  className="text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-50"
                >
                  Servicios
                </Link>
                <Link
                  href="/dashboard/horarios"
                  className="text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-50"
                >
                  Horarios
                </Link>
              </>
            )}
            <span className="text-sm text-slate-600 dark:text-slate-400">
              {profile?.full_name || user.email}
              <span className="ml-2 rounded bg-slate-200 px-2 py-0.5 text-xs dark:bg-slate-700">
                {isAdmin ? "Profesional" : "Cliente"}
              </span>
            </span>
            <SignOutButton />
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8">{children}</main>
    </div>
  );
}
