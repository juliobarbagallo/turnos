import Link from "next/link";
import { ResetPasswordForm } from "@/components/ResetPasswordForm";

export const metadata = {
  title: "Recuperar contraseña - SuperTurnos",
  description: "Solicitar link para crear o restablecer contraseña",
};

export default function SolicitarRecuperacionPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 dark:bg-slate-950">
      <div className="w-full max-w-sm space-y-8 rounded-xl bg-white p-8 shadow-lg dark:bg-slate-900">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">
            Recuperar contraseña
          </h1>
          <p className="mt-2 text-slate-600 dark:text-slate-400">
            Ingresá tu email y te enviamos un link para crear una contraseña
          </p>
        </div>

        <ResetPasswordForm />

        <p className="text-center text-sm text-slate-500">
          <Link
            href="/login"
            className="font-medium text-slate-900 hover:underline dark:text-slate-50"
          >
            Volver a ingresar
          </Link>
        </p>
      </div>
    </div>
  );
}
