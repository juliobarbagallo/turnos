import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { BusinessHoursForm } from "@/components/BusinessHoursForm";

export const metadata = {
  title: "Horarios de Atención - SuperTurnos",
  description: "Configurar horarios de atención del profesional",
};

export default async function HorariosPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    redirect("/dashboard");
  }

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/dashboard"
          className="text-sm text-slate-600 hover:underline dark:text-slate-400"
        >
          ← Volver al dashboard
        </Link>
        <h2 className="mt-2 text-2xl font-semibold text-slate-900 dark:text-slate-50">
          Horarios de Atención
        </h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Definí en qué días y horarios atendés. Podés agregar rangos partidos
          (ej: mañana y tarde).
        </p>
      </div>
      <div className="max-w-lg rounded-lg border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900">
        <BusinessHoursForm />
      </div>
    </div>
  );
}
