import Link from "next/link";
import { AuthForm } from "@/components/AuthForm";

export const metadata = {
  title: "Ingresar - SuperTurnos",
  description: "Iniciar sesión en SuperTurnos",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string; error?: string }>;
}) {
  const params = await searchParams;
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 dark:bg-slate-950">
      <div className="w-full max-w-sm space-y-8 rounded-xl bg-white p-8 shadow-lg dark:bg-slate-900">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">
            SuperTurnos
          </h1>
          <p className="mt-2 text-slate-600 dark:text-slate-400">
            Ingresá a tu cuenta
          </p>
        </div>

        <AuthForm mode="login" initialError={params.error} />

        <p className="text-center text-sm text-slate-500">
          ¿No tenés cuenta?{" "}
          <Link
            href="/registro"
            className="font-medium text-slate-900 hover:underline dark:text-slate-50"
          >
            Registrarse
          </Link>
        </p>
      </div>

      <Link
        href="/"
        className="mt-6 text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-400"
      >
        Volver al inicio
      </Link>
    </div>
  );
}
