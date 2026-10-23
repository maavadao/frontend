// The AI tools directory (github.com/maavadao/ai-tools-directory): one TOML file per tool, published as
// a single index.json on GitHub Pages. Ratings (the trust score) come from maavaDao members in Supabase.

import { createClient } from "@/lib/supabase/server";
import { memoJson } from "@/lib/repos";

export const TOOLS_PAGES = process.env.TOOLS_PAGES_URL || "https://maavadao.github.io/ai-tools-directory";
export const TOOLS_REPO = "https://github.com/maavadao/ai-tools-directory";

export type Pricing = "free" | "freemium" | "paid" | "contact";

export interface Tool {
  slug: string;
  name: string;
  description: string;
  category: string;
  website: string;
  company?: string;
  tags?: string[];
  pricing?: Pricing;
  /** Cheapest paid plan, per month, in `currency`. Written by a person from the tool's pricing page. */
  starting_price?: number;
  currency?: string;
  free_trial?: boolean;
  pricing_url?: string;
  /** When a person last checked the prices above against pricing_url. */
  pricing_checked?: string;
  /** When the daily run last read pricing_url (flags only). */
  pricing_seen?: string;
  /** The pricing page mentions a free plan (read by the daily run, not checked by a person). */
  free_plan?: boolean;
  open_source?: boolean;
  repository?: string;
  platforms?: string[];
  education_discount?: boolean;
  added: string;
  /** The tool's own social preview image. */
  image?: string;
}

export interface ToolCategory {
  name: string;
  description: string;
  count: number;
}

export interface ToolsIndex {
  generated_at: string;
  count: number;
  categories: Record<string, ToolCategory>;
  tools: Tool[];
}

/** The published tools index, or null if it can't be fetched. */
export const getToolsIndex = memoJson<ToolsIndex>(`${TOOLS_PAGES}/index.json`);

export async function getTool(slug: string) {
  const index = await getToolsIndex();
  const tool = index?.tools.find((t) => t.slug === slug);
  return index && tool ? { tool, category: index.categories[tool.category] } : null;
}

export function toolSourceUrl(tool: Tool): string {
  const shard = /^[a-z]/.test(tool.slug) ? tool.slug[0] : "0-9";
  return `${TOOLS_REPO}/blob/main/tools/${shard}/${tool.slug}.toml`;
}

export interface ToolRating {
  rating: number;
  ratings: number;
}

/** Average rating and count for every rated tool, by slug. Empty if Supabase isn't reachable. */
export async function getToolRatings(): Promise<Map<string, ToolRating>> {
  try {
    const supabase = await createClient();
    const { data } = await supabase.rpc("tool_ratings_all");
    return new Map(
      ((data as { tool_slug: string; rating: number; ratings: number }[] | null) ?? []).map((r) => [
        r.tool_slug,
        { rating: Number(r.rating), ratings: Number(r.ratings) },
      ]),
    );
  } catch {
    return new Map();
  }
}

const MONEY: Record<string, string> = { USD: "$", EUR: "€", GBP: "£" };

/** "Free", "Free plan", "From $12/mo", "Contact sales", or null when we don't know yet. */
export function priceLabel(t: Tool): string | null {
  if (t.pricing === "free") return "Free";
  if (t.pricing === "contact") return "Contact sales";
  if (t.starting_price != null) {
    const symbol = MONEY[t.currency ?? "USD"] ?? `${t.currency} `;
    const price = `${symbol}${Number.isInteger(t.starting_price) ? t.starting_price : t.starting_price.toFixed(2)}`;
    return t.pricing === "freemium" ? `Free plan · from ${price}/mo` : `From ${price}/mo`;
  }
  if (t.pricing === "freemium") return "Free plan";
  if (t.pricing === "paid") return "Paid";
  if (t.free_plan) return "Free plan";
  if (t.free_trial) return "Free trial";
  return null;
}

export const PRICE_FILTERS = { free: "Free", freemium: "Free plan", paid: "Paid" } as const;
export type PriceFilter = keyof typeof PRICE_FILTERS;

function matchesPrice(t: Tool, f: PriceFilter): boolean {
  if (f === "free") return t.pricing === "free";
  if (f === "freemium") return t.pricing === "freemium" || (!t.pricing && !!t.free_plan);
  return t.pricing === "paid" || (t.pricing === "freemium" && t.starting_price != null);
}

export const TOOL_SORTS = { rated: "Top rated", new: "New", name: "A–Z" } as const;
export type ToolSort = keyof typeof TOOL_SORTS;

/** Filter by category, price and a free-text query (all words must match), then sort. */
export function findTools(
  tools: Tool[],
  ratings: Map<string, ToolRating>,
  { q, category, price, sort }: { q: string; category: string; price: PriceFilter | ""; sort: ToolSort },
): Tool[] {
  const words = q.toLowerCase().split(/\s+/).filter(Boolean);
  const hits = tools.filter((t) => {
    if (category && t.category !== category) return false;
    if (price && !matchesPrice(t, price)) return false;
    if (!words.length) return true;
    const hay = `${t.name} ${t.company ?? ""} ${t.description} ${(t.tags ?? []).join(" ")}`.toLowerCase();
    return words.every((w) => hay.includes(w));
  });
  const byName = (a: Tool, b: Tool) => a.name.localeCompare(b.name, "en", { sensitivity: "base" });
  if (sort === "new") hits.sort((a, b) => b.added.localeCompare(a.added) || byName(a, b));
  else if (sort === "rated")
    hits.sort((a, b) => {
      const ra = ratings.get(a.slug);
      const rb = ratings.get(b.slug);
      // Rated tools first by score then by how many people rated; the rest alphabetically.
      return (rb?.rating ?? 0) - (ra?.rating ?? 0) || (rb?.ratings ?? 0) - (ra?.ratings ?? 0) || byName(a, b);
    });
  else hits.sort(byName);
  if (words.length && sort === "rated") {
    const named = (t: Tool) => (words.every((w) => t.name.toLowerCase().includes(w)) ? 1 : 0);
    hits.sort((a, b) => named(b) - named(a));
  }
  return hits;
}
