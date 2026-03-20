"use server";

import { createClient } from "@/lib/supabase/server";
import type { BusinessHourRow } from "@/lib/business-hours";
import { revalidatePath } from "next/cache";

export async function getBusinessHours() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { data: [], error: "No autenticado" };

  const { data, error } = await supabase
    .from("business_hours")
    .select("*")
    .eq("user_id", user.id)
    .order("day_of_week", { ascending: true })
    .order("start_time", { ascending: true });

  if (error) return { data: [], error: error.message };
  return { data: data as BusinessHourRow[], error: null };
}

type TimeRange = { day_of_week: number; start_time: string; end_time: string };

export async function upsertBusinessHours(ranges: TimeRange[]) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado" };

  const validRanges = ranges.filter((r) => {
    if (r.day_of_week < 0 || r.day_of_week > 6) return false;
    const start = r.start_time.length === 5 ? r.start_time + ":00" : r.start_time;
    const end = r.end_time.length === 5 ? r.end_time + ":00" : r.end_time;
    return end > start;
  });

  const { error: deleteError } = await supabase
    .from("business_hours")
    .delete()
    .eq("user_id", user.id);

  if (deleteError) return { error: deleteError.message };

  if (validRanges.length > 0) {
    const { error: insertError } = await supabase.from("business_hours").insert(
      validRanges.map((r) => ({
        user_id: user.id,
        day_of_week: r.day_of_week,
        start_time: r.start_time.length === 5 ? r.start_time + ":00" : r.start_time,
        end_time: r.end_time.length === 5 ? r.end_time + ":00" : r.end_time,
      }))
    );
    if (insertError) return { error: insertError.message };
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/horarios");
  return { error: null };
}
