import { createClient } from "@supabase/supabase-js";

/**
 * Cliente con service role: solo en servidor (API routes).
 * Necesario para leer horarios + turnos y calcular disponibilidad sin sesión del profesional.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
