"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

const PRODUCTION_URL = "https://super-turnos.vercel.app";

function getBaseUrl(): string {
  return process.env.NODE_ENV === "production" ? PRODUCTION_URL : "http://localhost:3000";
}

export async function signInWithMagicLink(formData: FormData) {
  const supabase = await createClient();
  const email = formData.get("email") as string;
  const baseUrl = getBaseUrl();

  if (!email) {
    return { error: "Email requerido" };
  }

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${baseUrl}/auth/callback?next=/dashboard`,
    },
  });

  if (error) {
    return { error: error.message };
  }

  return { success: true, message: "Revisá tu email para el link de acceso" };
}

export async function signInWithPassword(formData: FormData) {
  const supabase = await createClient();
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Email y contraseña requeridos" };
  }

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    if (error.message.includes("Invalid login credentials")) {
      return {
        error:
          "Email o contraseña incorrectos. Si te registraste con Magic Link, no tenés contraseña: usá 'Recuperar contraseña' para crear una.",
      };
    }
    return { error: error.message };
  }

  redirect("/dashboard");
}

export async function signInWithGoogle(role?: "admin" | "customer") {
  const supabase = await createClient();
  const baseUrl = getBaseUrl();
  const redirectTo =
    role === "admin"
      ? `${baseUrl}/auth/callback?next=/dashboard&role=admin`
      : `${baseUrl}/auth/callback?next=/dashboard`;
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo },
  });
  if (error) return { error: error.message };
  if (data.url) redirect(data.url);
  return { error: "Error al iniciar sesión con Google" };
}

export async function resetPassword(formData: FormData) {
  const supabase = await createClient();
  const email = formData.get("email") as string;

  if (!email) {
    return { error: "Email requerido" };
  }

  const baseUrl = getBaseUrl();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${baseUrl}/auth/callback?next=/recuperar-password`,
  });

  if (error) {
    return { error: error.message };
  }

  return {
    success: true,
    message:
      "Si ese email está registrado, te enviamos un link para crear una contraseña. Revisá tu correo (y spam).",
  };
}

export async function signUp(formData: FormData) {
  const supabase = await createClient();
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const fullName = formData.get("full_name") as string;
  const role = (formData.get("role") as string) || "customer";

  if (!email || !password) {
    return { error: "Email y contraseña requeridos" };
  }

  const baseUrl = getBaseUrl();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName || email, role },
      emailRedirectTo: `${baseUrl}/auth/callback?next=/dashboard`,
    },
  });

  if (error) {
    if (error.message.includes("already registered") || error.message.includes("already exists")) {
      return {
        error: "Ese email ya está registrado. Probá iniciar sesión en su lugar.",
      };
    }
    return { error: error.message };
  }

  // Si el usuario fue auto-confirmado (trigger en DB), iniciar sesión de inmediato
  if (data.user) {
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (!signInError) {
      redirect("/dashboard");
    }
  }

  return {
    success: true,
    message:
      "Revisá tu email para confirmar la cuenta. Si no llega, probá iniciar sesión con tu contraseña.",
  };
}

export async function updatePassword(formData: FormData) {
  const supabase = await createClient();
  const password = formData.get("password") as string;

  if (!password || password.length < 6) {
    return { error: "La contraseña debe tener al menos 6 caracteres" };
  }

  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
