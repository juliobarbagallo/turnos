"use client";

import { useState } from "react";
import { updatePassword } from "@/app/actions/auth";

export function UpdatePasswordForm() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(formData: FormData) {
    setError(null);
    const result = await updatePassword(formData);
    if (result.error) setError(result.error);
    else setSuccess(true);
  }

  if (success) {
    return (
      <div className="rounded-lg bg-emerald-50 p-4 text-center text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400">
        <p className="font-medium">Contraseña actualizada</p>
        <p className="mt-1 text-sm">
          Ya podés iniciar sesión con tu nueva contraseña.
        </p>
        <a
          href="/dashboard"
          className="mt-4 inline-block rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
        >
          Ir al dashboard
        </a>
      </div>
    );
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      )}

      <div>
        <label
          htmlFor="password"
          className="block text-sm font-medium text-slate-700 dark:text-slate-300"
        >
          Nueva contraseña
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={6}
          autoComplete="new-password"
          className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 placeholder-slate-400 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
          placeholder="Mínimo 6 caracteres"
        />
      </div>

      <button
        type="submit"
        className="w-full rounded-lg bg-slate-900 px-4 py-2 font-medium text-white transition-colors hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
      >
        Guardar contraseña
      </button>
    </form>
  );
}
