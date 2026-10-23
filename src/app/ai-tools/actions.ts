"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getToolsIndex } from "@/lib/tools";
import { getClaims } from "@/lib/supabase/server";

/** The signed-in member acting on a tool that exists. Sends people without an account or profile to sign in first. */
async function member(slug: string | null, next: string) {
  if (slug) {
    const index = await getToolsIndex();
    if (!index?.tools.some((t) => t.slug === slug)) throw new Error("Unknown tool");
  }
  const { supabase, claims } = await getClaims();
  const to = encodeURIComponent(next);
  if (!claims) redirect(`/login?next=${to}`);
  const { data: profile } = await supabase.from("profiles").select("id").eq("id", claims.sub).maybeSingle();
  if (!profile) redirect(`/onboarding?next=${to}`);
  return { supabase, userId: claims.sub };
}

/** Rate 1–5 stars; rating the same score again removes the rating. */
export async function rateTool(slug: string, score: number) {
  if (!Number.isInteger(score) || score < 1 || score > 5) return;
  const { supabase, userId } = await member(slug, `/ai-tools/${slug}`);
  const { data: current } = await supabase.from("tool_ratings").select("score").eq("tool_slug", slug).eq("user_id", userId).maybeSingle();
  if (current?.score === score) await supabase.from("tool_ratings").delete().eq("tool_slug", slug).eq("user_id", userId);
  else await supabase.from("tool_ratings").upsert({ tool_slug: slug, user_id: userId, score });
  revalidatePath(`/ai-tools/${slug}`);
}

export type SuggestState = { error?: string; sent?: boolean };

/** A member suggests a tool for the directory; the team reads it and adds it. */
export async function suggestTool(_prev: SuggestState, form: FormData): Promise<SuggestState> {
  const website = String(form.get("website") ?? "").trim();
  const note = String(form.get("note") ?? "").trim().slice(0, 500);
  if (!/^https:\/\/\S+$/.test(website) || website.length > 300) return { error: "Enter the tool's web address, starting with https://" };
  const { supabase, userId } = await member(null, "/ai-tools#suggest");
  const { error } = await supabase.from("tool_suggestions").insert({ user_id: userId, website, note: note || null });
  if (error) return { error: error.message.includes("suggested a lot") ? error.message : "We couldn't send that. Please try again." };
  return { sent: true };
}
