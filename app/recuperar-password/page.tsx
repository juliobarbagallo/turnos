import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { UpdatePasswordForm } from "@/components/UpdatePasswordForm";

export const metadata = {
  title: "Recuperar contraseña - SuperTurnos",
  description: "Crear o restablecer contraseña",
};

export default async function RecuperarPasswordPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 dark:bg-slate-950">
      <div className="w-full max-w-sm space-y-8 rounded-xl bg-white p-8 shadow-lg dark:bg-slate-900">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">
            Nueva contraseña
          </h1>
          <p className="mt-2 text-slate-600 dark:text-slate-400">
            Ingresá tu nueva contraseña para {user.email}
          </p>
        </div>

        <UpdatePasswordForm />
      </div>

      <Link
        href="/dashboard"
        className="mt-6 text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-400"
      >
        Ir al dashboard
      </Link>
    </div>
  );
}
