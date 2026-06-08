import { Browser } from "@capacitor/browser";
import { Capacitor } from "@capacitor/core";
import { supabase, hasSupabaseEnv } from "../lib/supabase";

const APP_SCHEME = "com.fixturedigital.app2026://login-callback";

function getRedirectTo() {
  return Capacitor.isNativePlatform() ? APP_SCHEME : window.location.origin;
}

export function isAnonymousUser(user) {
  return Boolean(user?.is_anonymous);
}

export function isRealAuthenticatedUser(user) {
  return Boolean(user && !isAnonymousUser(user));
}

export async function getCurrentSession() {
  if (!hasSupabaseEnv || !supabase) {
    return { session: null, user: null };
  }

  const {
    data: { session },
  } = await supabase.auth.getSession();

  return {
    session,
    user: session?.user ?? null,
  };
}

export function subscribeToAuthChanges(callback) {
  if (!hasSupabaseEnv || !supabase) {
    return () => {};
  }

  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((_event, session) => {
    callback({
      session,
      user: session?.user ?? null,
    });
  });

  return () => subscription.unsubscribe();
}

async function signInWithOAuthNative(provider) {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: APP_SCHEME,
      skipBrowserRedirect: true,
    },
  });
  if (error) return { error };
  if (data?.url) await Browser.open({ url: data.url });
  return { data };
}

export async function signInWithGoogle() {
  if (!supabase) {
    throw new Error("Supabase is not configured");
  }

  if (Capacitor.isNativePlatform()) {
    return signInWithOAuthNative("google");
  }

  return supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: getRedirectTo() },
  });
}

export async function signInWithEmailOtp(email) {
  if (!supabase) {
    throw new Error("Supabase is not configured");
  }

  return supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: getRedirectTo(),
    },
  });
}

export async function signInWithPassword(email, password) {
  if (!supabase) {
    throw new Error("Supabase is not configured");
  }

  return supabase.auth.signInWithPassword({ email, password });
}

export async function signInWithFacebook() {
  if (!supabase) {
    throw new Error("Supabase is not configured");
  }

  if (Capacitor.isNativePlatform()) {
    return signInWithOAuthNative("facebook");
  }

  return supabase.auth.signInWithOAuth({
    provider: "facebook",
    options: { redirectTo: getRedirectTo() },
  });
}

export async function signInWithPhone(phone) {
  if (!supabase) {
    throw new Error("Supabase is not configured");
  }

  return supabase.auth.signInWithOtp({ phone });
}

export async function verifyPhoneOtp(phone, token) {
  if (!supabase) {
    throw new Error("Supabase is not configured");
  }

  return supabase.auth.verifyOtp({ phone, token, type: "sms" });
}

export async function signOutUser() {
  if (!supabase) {
    return;
  }

  try {
    window.localStorage.removeItem("fixture-digital-2026-predictions");
  } catch (err) {
    console.warn("Failed to remove local predictions on sign out:", err);
  }

  return supabase.auth.signOut();
}
