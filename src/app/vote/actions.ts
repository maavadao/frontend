"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getClaims } from "@/lib/supabase/server";

/** The signed-in member. Sends people without an account or profile to sign in first. */
async function member() {
  const { supabase, claims } = await getClaims();
  const next = encodeURIComponent("/vote");
  if (!claims) redirect(`/login?next=${next}`);
  const { data: profile } = await supabase.from("profiles").select("id").eq("id", claims.sub).maybeSingle();
  if (!profile) redirect(`/onboarding?next=${next}`);
  return { supabase, userId: claims.sub };
}

/** Vote for an idea; voting again takes the vote back. */
export async function toggleVote(id: number) {
  const { supabase, userId } = await member();
  const { data: current } = await supabase.from("project_idea_votes").select("idea_id").eq("idea_id", id).eq("user_id", userId).maybeSingle();
  if (current) await supabase.from("project_idea_votes").delete().eq("idea_id", id).eq("user_id", userId);
  else await supabase.from("project_idea_votes").insert({ idea_id: id, user_id: userId });
  revalidatePath("/vote");
}

export type IdeaState = { error?: string; posted?: number };

export async function postIdea(_prev: IdeaState, form: FormData): Promise<IdeaState> {
  const title = String(form.get("title") ?? "").trim();
  const body = String(form.get("body") ?? "").trim();
  if (title.length < 5) return { error: "Give your idea a title of at least 5 characters." };
  if (title.length > 120) return { error: "Keep the title under 120 characters." };
  if (body.length < 20) return { error: "Describe your idea in at least 20 characters." };
  if (body.length > 2000) return { error: "Keep the description under 2,000 characters." };
  const { supabase, userId } = await member();
  // username and github_login are filled in by the database.
  const { error } = await supabase.from("project_ideas").insert({ user_id: userId, username: "", title, body });
  if (error) return { error: error.message.includes("lot of ideas") ? error.message : "We couldn't post that. Please try again." };
  revalidatePath("/vote");
  return { posted: Date.now() };
}

export async function deleteIdea(id: number) {
  const { supabase, userId } = await member();
  await supabase.from("project_ideas").delete().eq("id", id).eq("user_id", userId);
  revalidatePath("/vote");
}

/** Report an idea. Three reports from different members hide it. */
export async function reportIdea(id: number) {
  const { supabase, userId } = await member();
  await supabase.from("project_idea_reports").upsert({ idea_id: id, user_id: userId }, { ignoreDuplicates: true });
  revalidatePath("/vote");
}
