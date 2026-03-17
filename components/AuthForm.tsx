"use client";

import { useState } from "react";
import {
  signInWithMagicLink,
  signInWithPassword,
  signUp,
} from "@/app/actions/auth";

type Mode = "login" | "register";

export function AuthForm({
  mode,
  initialError,
}: {
  mode: Mode;
  initialError?: string | null;
}) {
  const [error, setError] = useState<string | null>(
    initialError === "auth" ? "Error de autenticación" : initialError || null
  );
  const [success, setSuccess] = useState<string | null>(null);
  const [useMagicLink, setUseMagicLink] = useState(false);

  async function handleSubmit(formData: FormData) {
    setError(null);
    setSuccess(null);

    if (mode === "login" && useMagicLink) {
      const result = await signInWithMagicLink(formData);
      if (result.error) setError(result.error);
      else if (result.success) setSuccess(result.message!);
      return;
    }

    if (mode === "login") {
      const result = await signInWithPassword(formData);
      if (result.error) setError(result.error);
      return;
    }

    if (mode === "register") {
      const result = await signUp(formData);
      if (result.error) setError(result.error);
      else if (result.success) setSuccess(result.message!);
      return;
    }
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400">
          {success}
        </div>
      )}

      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-slate-700 dark:text-slate-300"
        >
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 placeholder-slate-400 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
          placeholder="tu@email.com"
        />
      </div>

      {(!useMagicLink || mode === "register") && (
        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-slate-700 dark:text-slate-300"
          >
            Contraseña
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required={mode === "register" || !useMagicLink}
            autoComplete={mode === "register" ? "new-password" : "current-password"}
            className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 placeholder-slate-400 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
            placeholder="••••••••"
          />
        </div>
      )}

      {mode === "register" && (
        <>
          <div>
            <label
              htmlFor="full_name"
              className="block text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              Nombre completo
            </label>
            <input
              id="full_name"
              name="full_name"
              type="text"
              autoComplete="name"
              className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 placeholder-slate-400 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
              placeholder="Juan Pérez"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Tipo de cuenta
            </label>
            <div className="mt-2 flex gap-4">
              <label className="flex items-center gap-2">
                <input
                  name="role"
                  type="radio"
                  value="customer"
                  defaultChecked
                  className="h-4 w-4 border-slate-300 text-slate-600 focus:ring-slate-500"
                />
                <span className="text-sm">Cliente</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  name="role"
                  type="radio"
                  value="admin"
                  className="h-4 w-4 border-slate-300 text-slate-600 focus:ring-slate-500"
                />
                <span className="text-sm">Profesional</span>
              </label>
            </div>
          </div>
        </>
      )}

      {mode === "login" && (
        <div className="flex items-center gap-2">
          <input
            id="magic_link"
            type="checkbox"
            checked={useMagicLink}
            onChange={(e) => setUseMagicLink(e.target.checked)}
            className="h-4 w-4 rounded border-slate-300 text-slate-600 focus:ring-slate-500"
          />
          <label
            htmlFor="magic_link"
            className="text-sm text-slate-600 dark:text-slate-400"
          >
            Usar Magic Link (sin contraseña)
          </label>
        </div>
      )}

      <button
        type="submit"
        className="w-full rounded-lg bg-slate-900 px-4 py-2 font-medium text-white transition-colors hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
      >
        {mode === "login"
          ? useMagicLink
            ? "Enviar link"
            : "Ingresar"
          : "Registrarse"}
      </button>
    </form>
  );
}
