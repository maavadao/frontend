"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { NEXT_COOKIE } from "@/lib/auth";
import { originFromHeaders, safeNext } from "@/lib/urls";

/** `email` is set once a code is on its way; `typed` keeps what was entered when sending failed. */
export type EmailState = { email?: string; typed?: string; error?: string };

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Email a sign-in code and a one-tap link. New and returning members get the same email. */
export async function sendEmailCode(_prev: EmailState, form: FormData): Promise<EmailState> {
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  const next = safeNext(String(form.get("next") ?? ""));
  if (!emailPattern.test(email) || email.length > 254) return { typed: email, error: "Enter a valid email address." };

  const h = await headers();
  const origin = originFromHeaders(h) ?? h.get("origin") ?? "";
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { shouldCreateUser: true, emailRedirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}` },
  });
  if (error) {
    const message =
      error.status === 429
        ? "We've sent a few codes already. Please wait a minute, then try again."
        : /signups? not allowed|disabled/i.test(error.message)
          ? "Email sign-in isn't switched on yet. Please continue with Google or GitHub for now."
          : "We couldn't send the email. Please check the address and try again.";
    return { typed: email, error: message };
  }
  (await cookies()).set(NEXT_COOKIE, next, { httpOnly: true, sameSite: "lax", secure: origin.startsWith("https"), maxAge: 3600, path: "/" });
  return { email };
}

/** Check the code from the email, then carry on like any other sign-in. */
export async function verifyEmailCode(prev: EmailState, form: FormData): Promise<EmailState> {
  const email = prev.email ?? "";
  // Supabase's code length is a project setting (6 to 10 digits), so accept any of them.
  const token = String(form.get("code") ?? "").replace(/\D/g, "");
  const next = safeNext(String(form.get("next") ?? ""));
  if (token.length < 6 || token.length > 10) return { email, error: "Enter the code from the email." };

  const supabase = await createClient();
  const { data, error } = await supabase.auth.verifyOtp({ email, token, type: "email" });
  if (error || !data.user) return { email, error: "That code didn't work. Check it, or ask for a new one." };

  const { data: profile } = await supabase.from("profiles").select("id").eq("id", data.user.id).maybeSingle();
  redirect(profile ? next : `/onboarding?next=${encodeURIComponent(next)}`);
}
