"use server";

import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { getClaims } from "@/lib/supabase/server";
import { COMMUNITY_WALL_TAG } from "@/lib/community-wall";
import { validateReferral, validateSupporter, type ReferralErrors, type SupporterErrors } from "@/lib/supporters";

const PATH = "/get-involved";

/** The signed-in member. Sends people without an account or profile to join first. */
async function member() {
  const { supabase, claims } = await getClaims();
  const next = encodeURIComponent(PATH);
  if (!claims) redirect(`/signup?next=${next}`);
  const { data: profile } = await supabase.from("profiles").select("id").eq("id", claims.sub).maybeSingle();
  if (!profile) redirect(`/onboarding?next=${next}`);
  return { supabase, userId: claims.sub };
}

export type SupporterState = { errors: SupporterErrors; saved?: number };

export async function saveSupporter(_prev: SupporterState, form: FormData): Promise<SupporterState> {
  const d = {
    ways: form.getAll("way").map(String),
    availability: String(form.get("availability") ?? ""),
    skills: String(form.get("skills") ?? "").trim(),
    message: String(form.get("message") ?? "").trim(),
  };
  const showOnWall = form.get("wall") === "on";
  const errors = validateSupporter(d);
  if (Object.keys(errors).length) return { errors };
  const { supabase, userId } = await member();
  const { error } = await supabase.from("supporters").upsert({
    user_id: userId,
    ways: d.ways,
    availability: d.availability || null,
    skills: d.skills || null,
    message: d.message || null,
  });
  if (error) return { errors: { form: "We couldn't save that. Please try again." } };
  await supabase.from("profiles").update({ show_on_wall: showOnWall }).eq("id", userId);
  updateTag(COMMUNITY_WALL_TAG);
  revalidatePath(PATH);
  return { errors: {}, saved: Date.now() };
}

export type ReferralState = { errors: ReferralErrors; sent?: number };

export async function sendReferral(_prev: ReferralState, form: FormData): Promise<ReferralState> {
  const d = {
    kind: String(form.get("kind") ?? ""),
    name: String(form.get("name") ?? "").trim(),
    place: String(form.get("place") ?? "").trim(),
    country: String(form.get("country") ?? ""),
    contact: String(form.get("contact") ?? "").trim(),
    consent: form.get("consent") === "on",
    note: String(form.get("note") ?? "").trim(),
  };
  const errors = validateReferral(d);
  if (Object.keys(errors).length) return { errors };
  const { supabase, userId } = await member();
  const { error } = await supabase.from("referrals").insert({
    user_id: userId,
    kind: d.kind,
    name: d.name,
    place: d.place,
    country: d.country,
    contact: d.contact || null,
    contact_consent: d.consent,
    note: d.note || null,
  });
  if (error)
    return { errors: { form: error.message.includes("a lot today") ? error.message : "We couldn't send that. Please try again." } };
  revalidatePath(PATH);
  return { errors: {}, sent: Date.now() };
}

export async function withdrawReferral(id: number) {
  const { supabase, userId } = await member();
  await supabase.from("referrals").delete().eq("id", id).eq("user_id", userId);
  revalidatePath(PATH);
}
