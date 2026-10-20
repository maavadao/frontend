"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getReposIndex } from "@/lib/repos";
import { getClaims } from "@/lib/supabase/server";

const LIST_STATUSES = ["using", "want", "used"] as const;

/** The signed-in member acting on a repo that exists. Sends people without an account or profile to sign in first. */
async function member(slug: string) {
  const index = await getReposIndex();
  if (!index?.repos.some((r) => r.slug === slug)) throw new Error("Unknown repo");
  const { supabase, claims } = await getClaims();
  const next = encodeURIComponent(`/repos/${slug}`);
  if (!claims) redirect(`/login?next=${next}`);
  const { data: profile } = await supabase.from("profiles").select("id").eq("id", claims.sub).maybeSingle();
  if (!profile) redirect(`/onboarding?next=${next}`);
  return { supabase, userId: claims.sub };
}

function refresh(slug: string) {
  revalidatePath(`/repos/${slug}`);
}

/** Rate 1–5 stars; rating the same score again removes the rating. */
export async function rateRepo(slug: string, score: number) {
  if (!Number.isInteger(score) || score < 1 || score > 5) return;
  const { supabase, userId } = await member(slug);
  const { data: current } = await supabase.from("repo_ratings").select("score").eq("repo_slug", slug).eq("user_id", userId).maybeSingle();
  if (current?.score === score) await supabase.from("repo_ratings").delete().eq("repo_slug", slug).eq("user_id", userId);
  else await supabase.from("repo_ratings").upsert({ repo_slug: slug, user_id: userId, score });
  refresh(slug);
}

/** Put the repo on the member's list as using / want to try / used before; the same status again takes it off. */
export async function setListStatus(slug: string, status: string) {
  if (!LIST_STATUSES.includes(status as (typeof LIST_STATUSES)[number])) return;
  const { supabase, userId } = await member(slug);
  const { data: current } = await supabase.from("repo_lists").select("status").eq("repo_slug", slug).eq("user_id", userId).maybeSingle();
  if (current?.status === status) await supabase.from("repo_lists").delete().eq("repo_slug", slug).eq("user_id", userId);
  else await supabase.from("repo_lists").upsert({ repo_slug: slug, user_id: userId, status });
  refresh(slug);
}

export type CommentState = { error?: string; posted?: number };

export async function postComment(slug: string, _prev: CommentState, form: FormData): Promise<CommentState> {
  const body = String(form.get("body") ?? "").trim();
  if (!body) return { error: "Write something first." };
  if (body.length > 2000) return { error: "Keep it under 2,000 characters." };
  const { supabase, userId } = await member(slug);
  // username and github_login are filled in by the database.
  const { error } = await supabase.from("repo_comments").insert({ repo_slug: slug, user_id: userId, username: "", body });
  if (error) return { error: error.message.includes("posted a lot") ? error.message : "We couldn't post that. Please try again." };
  refresh(slug);
  return { posted: Date.now() };
}

export async function deleteComment(slug: string, id: number) {
  const { supabase, userId } = await member(slug);
  await supabase.from("repo_comments").delete().eq("id", id).eq("user_id", userId);
  refresh(slug);
}

/** Report a comment. Three reports from different members hide it. */
export async function reportComment(slug: string, id: number) {
  const { supabase, userId } = await member(slug);
  await supabase.from("repo_comment_reports").upsert({ comment_id: id, user_id: userId }, { ignoreDuplicates: true });
  refresh(slug);
}
