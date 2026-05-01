import { supabase, hasSupabaseEnv } from "../lib/supabase";

function shouldRetryWithoutLocaleFields(error) {
  const message = error?.message ?? "";

  return (
    message.includes("preferred_language") ||
    message.includes("timezone") ||
    message.includes("schema cache")
  );
}

async function upsertProfileRow(payload) {
  const { data, error } = await supabase
    .from("profiles")
    .upsert(payload, { onConflict: "id" })
    .select("*")
    .single();

  if (error && shouldRetryWithoutLocaleFields(error)) {
    const fallbackPayload = { ...payload };
    delete fallbackPayload.preferred_language;
    delete fallbackPayload.timezone;

    const fallbackResult = await supabase
      .from("profiles")
      .upsert(fallbackPayload, { onConflict: "id" })
      .select("*")
      .single();

    if (fallbackResult.error) {
      throw fallbackResult.error;
    }

    return fallbackResult.data;
  }

  if (error) {
    throw error;
  }

  return data;
}

export async function loadProfile(userId) {
  if (!hasSupabaseEnv || !supabase || !userId) {
    return null;
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}

export async function upsertProfile({ id, fullName, email, reminderOptIn, preferredLanguage, timeZone, avatarUrl = null }) {
  if (!hasSupabaseEnv || !supabase) {
    throw new Error("Supabase is not configured");
  }

  const payload = {
    id,
    full_name: fullName,
    email,
    favorite_team: null,
    avatar_url: avatarUrl,
    reminder_opt_in: reminderOptIn,
    preferred_language: preferredLanguage,
    timezone: timeZone,
  };

  return upsertProfileRow(payload);
}

export async function updateProfilePreferences({
  id,
  fullName,
  favoriteTeam,
  avatarUrl,
  reminderOptIn,
  email,
  preferredLanguage,
  timeZone,
}) {
  if (!hasSupabaseEnv || !supabase) {
    throw new Error("Supabase is not configured");
  }

  const payload = {
    id,
    full_name: fullName,
    favorite_team: favoriteTeam,
    avatar_url: avatarUrl,
    reminder_opt_in: reminderOptIn,
    email,
    preferred_language: preferredLanguage,
    timezone: timeZone,
  };

  return upsertProfileRow(payload);
}
