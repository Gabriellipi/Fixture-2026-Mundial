import { supabase, hasSupabaseEnv } from "../lib/supabase";

export async function uploadAvatar(userId, file) {
  if (!hasSupabaseEnv || !supabase) {
    throw new Error("Supabase is not configured");
  }

  if (!file) {
    return null;
  }

  const extension = file.name.split(".").pop()?.toLowerCase() ?? "png";
  const filePath = `${userId}/${Date.now()}.${extension}`;

  const { error: uploadError } = await supabase.storage.from("avatars").upload(filePath, file, {
    cacheControl: "3600",
    upsert: true,
  });

  if (uploadError) {
    throw uploadError;
  }

  const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);
  return data.publicUrl;
}
