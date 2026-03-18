import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ServiceForm } from "@/components/ServiceForm";

export const metadata = {
  title: "Nuevo Servicio - SuperTurnos",
  description: "Crear un nuevo servicio",
};

export default async function NuevoServicioPage() {
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

  if (profile?.role !== "admin") redirect("/dashboard");

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/dashboard/servicios"
          className="text-sm text-slate-600 hover:underline dark:text-slate-400"
        >
          ← Volver a servicios
        </Link>
        <h2 className="mt-2 text-2xl font-semibold text-slate-900 dark:text-slate-50">
          Nuevo servicio
        </h2>
      </div>
      <div className="max-w-md rounded-lg border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900">
        <ServiceForm />
      </div>
    </div>
  );
}
