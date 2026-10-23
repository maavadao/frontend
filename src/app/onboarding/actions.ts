"use server";

import { redirect } from "next/navigation";
import { getClaims } from "@/lib/supabase/server";
import { supporterRoles, validateProfile, type ProfileErrors, type Role } from "@/lib/profile";
import { safeNext } from "@/lib/urls";

export type OnboardingState = {
  errors: ProfileErrors;
  values?: { username: string; country: string; role: string; terms: boolean; wall: boolean };
};

export async function completeOnboarding(_prev: OnboardingState, form: FormData): Promise<OnboardingState> {
  const username = String(form.get("username") ?? "").trim().toLowerCase();
  const country = String(form.get("country") ?? "");
  const role = String(form.get("role") ?? "");
  const terms = String(form.get("terms") ?? "");
  const wall = form.get("wall") === "on";
  // React resets the form after an action; send the values back so a failed save keeps them.
  const values = { username, country, role, terms: terms === "on", wall };
  const errors = validateProfile({ username, country, role, terms });
  if (Object.keys(errors).length) return { errors, values };

  const { supabase, claims } = await getClaims();
  if (!claims) redirect("/login");

  const { error } = await supabase.from("profiles").insert({ id: claims.sub, username, country, role, show_on_wall: wall });
  if (error?.code === "23505") {
    // Unique violation: either the username is taken or this member already has a profile.
    const { data: mine } = await supabase.from("profiles").select("id").eq("id", claims.sub).maybeSingle();
    if (!mine) return { errors: { username: "That username is taken. Try another." }, values };
  } else if (error) {
    return { errors: { form: "We couldn't save your profile. Please try again." }, values };
  }

  // Volunteers, students, educators and other supporters carry on to the get-involved form,
  // unless they were already on their way somewhere.
  const next = safeNext(String(form.get("next") ?? ""));
  const supporter = supporterRoles.includes(role as Role);
  if (supporter && next === "/") redirect("/get-involved?welcome=1");
  if (next.startsWith("/get-involved")) redirect(`${next}${next.includes("?") ? "&" : "?"}welcome=1`);
  redirect(next);
}
