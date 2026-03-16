"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";

export function SupabaseStatus() {
  const [status, setStatus] = useState<"checking" | "connected" | "error" | "no-config">("checking");

  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!url || !key) {
      console.warn(
        "[SuperTurnos] Supabase no configurado. Agregá NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY en .env.local"
      );
      setStatus("no-config");
      return;
    }

    const supabase = createClient();
    supabase.auth
      .getSession()
      .then(({ error }) => {
        if (error) {
          console.error("[SuperTurnos] Error conexión Supabase:", error);
          setStatus("error");
        } else {
          console.log("[SuperTurnos] Conexión Supabase OK");
          setStatus("connected");
        }
      })
      .catch((err) => {
        console.error("[SuperTurnos] Error conexión Supabase:", err);
        setStatus("error");
      });
  }, []);

  if (status === "checking") return null;

  return (
    <div
      className="rounded-lg px-4 py-2 text-sm"
      role="status"
      aria-live="polite"
    >
      {status === "connected" && (
        <span className="text-emerald-600 dark:text-emerald-400">
          ✓ Supabase conectado
        </span>
      )}
      {status === "no-config" && (
        <span className="text-amber-600 dark:text-amber-400">
          Configurá .env.local para conectar Supabase
        </span>
      )}
      {status === "error" && (
        <span className="text-red-600 dark:text-red-400">
          Error de conexión Supabase
        </span>
      )}
    </div>
  );
}
