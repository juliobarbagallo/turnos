"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export type Service = {
  id: string;
  user_id: string;
  name: string;
  duration_minutes: number;
  price: number;
  deposit_amount: number;
  created_at: string;
  updated_at: string;
};

export async function getServices() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { data: [], error: "No autenticado" };

  const { data, error } = await supabase
    .from("services")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) return { data: [], error: error.message };
  return { data: data as Service[], error: null };
}

export async function createService(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado" };

  const name = formData.get("name") as string;
  const durationMinutes = parseInt(formData.get("duration_minutes") as string, 10);
  const price = parseFloat(formData.get("price") as string);
  const depositAmount = parseFloat((formData.get("deposit_amount") as string) || "0");

  if (!name?.trim()) return { error: "El nombre es obligatorio" };
  if (!durationMinutes || durationMinutes < 1)
    return { error: "La duración debe ser al menos 1 minuto" };
  if (price < 0) return { error: "El precio no puede ser negativo" };
  if (depositAmount < 0) return { error: "La seña no puede ser negativa" };

  const { error } = await supabase.from("services").insert({
    user_id: user.id,
    name: name.trim(),
    duration_minutes: durationMinutes,
    price,
    deposit_amount: depositAmount,
  });

  if (error) return { error: error.message };
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/servicios");
  return { error: null };
}

export async function updateService(id: string, formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado" };

  const name = formData.get("name") as string;
  const durationMinutes = parseInt(formData.get("duration_minutes") as string, 10);
  const price = parseFloat(formData.get("price") as string);
  const depositAmount = parseFloat((formData.get("deposit_amount") as string) || "0");

  if (!name?.trim()) return { error: "El nombre es obligatorio" };
  if (!durationMinutes || durationMinutes < 1)
    return { error: "La duración debe ser al menos 1 minuto" };
  if (price < 0) return { error: "El precio no puede ser negativo" };
  if (depositAmount < 0) return { error: "La seña no puede ser negativa" };

  const { error } = await supabase
    .from("services")
    .update({
      name: name.trim(),
      duration_minutes: durationMinutes,
      price,
      deposit_amount: depositAmount,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { error: error.message };
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/servicios");
  return { error: null };
}

export async function deleteService(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado" };

  const { error } = await supabase
    .from("services")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { error: error.message };
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/servicios");
  return { error: null };
}
