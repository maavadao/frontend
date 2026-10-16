// The maavaDao registry (github.com/maavadao/marketplace-registry): AI tools and agents listed by the community.

export const REGISTRY_INDEX_URL =
  process.env.REGISTRY_INDEX_URL || "https://maavadao.github.io/marketplace-registry/index.json";
export const COMMUNITY_AGENTS_INDEX_URL =
  process.env.COMMUNITY_AGENTS_INDEX_URL || "https://maavadao.github.io/community-agents/index.json";
export const COMMUNITY_AGENTS_REPO = "https://github.com/maavadao/community-agents";
export const REGISTRY_REPO = "https://github.com/maavadao/marketplace-registry";

export const AUDIENCES = ["education", "individuals", "business"] as const;
export type Audience = (typeof AUDIENCES)[number];

export type PriceKind = "free" | "paid" | "contact" | "unknown";

export interface Plan {
  price: PriceKind;
  amount?: number;
  currency?: string;
  period?: "month" | "year" | "one-time" | "per-use";
  usage?: string;
}

export type Pricing = Record<Audience, Plan>;

export interface RegistryStats {
  stars: number;
  forks: number;
  language: string | null;
  pushed_at: string;
  archived: boolean;
  stars_gained: number | null;
  since: string | null;
}

export interface RegistryListing {
  slug: string;
  kind: "tool" | "agent";
  name: string;
  summary: string;
  description?: string;
  category: string;
  tags?: string[];
  links: { repository?: string; website?: string; docs?: string };
  license?: string;
  skill_level?: "beginner" | "intermediate" | "advanced";
  pricing: Pricing;
  agent?: { runtime: string; audience: string; languages: string[]; data_collected?: string };
  maintainer?: { name?: string; github: string };
  safety?: { reviewed?: boolean; reviewed_on?: string };
  added: string;
  stats?: RegistryStats;
}

export interface RegistryIndex {
  generated_at: string;
  categories: Record<string, string>;
  audiences: Record<string, string>;
  counts: { tools: number; agents: number };
  listings: RegistryListing[];
}

/** The published index, cached for an hour. Returns null if it can't be fetched. */
export async function getRegistryIndex(): Promise<RegistryIndex | null> {
  try {
    const res = await fetch(REGISTRY_INDEX_URL, { next: { revalidate: 3600 } });
    if (!res.ok) return null;
    return (await res.json()) as RegistryIndex;
  } catch {
    return null;
  }
}

/** Agents built in the community-agents repo, from its own published index. */
export async function getCommunityAgents(): Promise<RegistryListing[]> {
  try {
    const res = await fetch(COMMUNITY_AGENTS_INDEX_URL, { next: { revalidate: 3600 } });
    if (!res.ok) return [];
    return ((await res.json()) as RegistryIndex).listings ?? [];
  } catch {
    return [];
  }
}

export function listingSourceUrl(listing: RegistryListing): string {
  return `${REGISTRY_REPO}/blob/main/${listing.kind === "agent" ? "agents" : "tools"}/${listing.slug}.yaml`;
}

/** The best link to send someone to for a listing: its repository, website, or the registry source. */
export function listingHref(listing: RegistryListing): string {
  return listing.links.repository || listing.links.website || listingSourceUrl(listing);
}

/** 1234 → "1.2k", 274530 → "275k". */
export function formatCount(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(n >= 100_000 ? 0 : 1).replace(/\.0$/, "")}k`;
  return String(n);
}

const PERIOD_LABELS: Record<NonNullable<Plan["period"]>, string> = {
  month: "/ month",
  year: "/ year",
  "one-time": "one-time",
  "per-use": "per use",
};

/** "Free", "$19 / month", "Contact the developer", "Not published". */
export function formatPlan(plan: Plan | undefined): string {
  if (!plan) return "Not published";
  switch (plan.price) {
    case "free":
      return "Free";
    case "contact":
      return "Contact the developer";
    case "unknown":
      return "Not published";
    case "paid": {
      if (plan.amount == null) return "Paid";
      const money = new Intl.NumberFormat("en-GB", {
        style: "currency",
        currency: plan.currency || "USD",
        maximumFractionDigits: plan.amount % 1 === 0 ? 0 : 2,
      }).format(plan.amount);
      return plan.period ? `${money} ${PERIOD_LABELS[plan.period]}` : money;
    }
  }
}

/** Free-for-everyone, or a short "Free for education · $19 / month for business". */
export function pricingSummary(pricing: Pricing | undefined): string {
  if (!pricing) return "Pricing not published";
  const labels = AUDIENCES.map((a) => formatPlan(pricing[a]));
  if (labels.every((l) => l === "Free")) return "Free for everyone";
  if (labels.every((l) => l === "Not published")) return "Pricing not published";
  const business = formatPlan(pricing.business);
  return pricing.education?.price === "free" ? `Free for education · ${business} for business` : `${business} for business`;
}
