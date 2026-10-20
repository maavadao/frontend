// The open-source AI repos directory (github.com/maavadao/open-source-ai-repos): one TOML file per
// repo, published as a single index.json on GitHub Pages.

export const REPOS_PAGES = process.env.REPOS_PAGES_URL || "https://maavadao.github.io/open-source-ai-repos";
export const REPOS_INDEX_URL = `${REPOS_PAGES}/index.json`;
export const REPOS_REPO = "https://github.com/maavadao/open-source-ai-repos";

export interface DirectoryRepo {
  slug: string;
  name: string;
  description: string;
  category: string;
  tags?: string[];
  repository: string;
  website?: string;
  docs?: string;
  license?: string;
  language?: string;
  skill_level?: "beginner" | "intermediate" | "advanced";
  runs_locally?: boolean;
  added: string;
  stars?: number;
  forks?: number;
  open_issues?: number;
  watchers?: number;
  pushed_at?: string;
  created_at?: string;
  /** [tag, published_at] of the latest release. */
  release?: [string, string];
  archived?: boolean;
}

export interface DirectoryCategory {
  name: string;
  description: string;
  count: number;
}

export interface ReposIndex {
  generated_at: string;
  count: number;
  categories: Record<string, DirectoryCategory>;
  repos: DirectoryRepo[];
}

/**
 * Fetch a published JSON file and keep it in memory for an hour. The files are a few MB, over the
 * 2 MB limit of Next's fetch cache. A failed fetch isn't cached, so the next request tries again.
 */
export function memoJson<T>(url: string, ttl = 60 * 60 * 1000): () => Promise<T | null> {
  let cached: { at: number; data: Promise<T | null> } | null = null;
  async function load(): Promise<T | null> {
    try {
      const res = await fetch(url, { cache: "no-store" });
      return res.ok ? ((await res.json()) as T) : null;
    } catch {
      return null;
    }
  }
  return async () => {
    if (!cached || Date.now() - cached.at > ttl) cached = { at: Date.now(), data: load() };
    const data = await cached.data;
    if (!data) cached = null;
    return data;
  };
}

/** The published repos index, or null if it can't be fetched. */
export const getReposIndex = memoJson<ReposIndex>(REPOS_INDEX_URL);

/** One repo and its rank among all repos and within its category (by stars), or null. */
export async function getRepo(slug: string) {
  const index = await getReposIndex();
  const repo = index?.repos.find((r) => r.slug === slug);
  if (!index || !repo) return null;
  const rank = index.repos.indexOf(repo) + 1;
  const inCategory = index.repos.filter((r) => r.category === repo.category);
  return {
    repo,
    category: index.categories[repo.category],
    rank,
    total: index.repos.length,
    categoryRank: inCategory.indexOf(repo) + 1,
    categoryTotal: inCategory.length,
  };
}

/** [day since 1970-01-01, stars] */
export type HistoryPoint = [number, number];
type HistoryShard = { generated_at: string; repos: Record<string, { p: HistoryPoint[] }> };

const historyShards = new Map<string, () => Promise<HistoryShard | null>>();

/** Star history for one repo, recorded daily by the directory's build since the repo was first tracked. */
export async function getStarHistory(slug: string): Promise<HistoryPoint[]> {
  const shard = /^[a-z]/.test(slug) ? slug[0] : "0-9";
  if (!historyShards.has(shard)) historyShards.set(shard, memoJson<HistoryShard>(`${REPOS_PAGES}/history/${shard}.json`));
  const data = await historyShards.get(shard)!();
  return data?.repos[slug]?.p ?? [];
}

export type RepoStatus = { label: "Active" | "Maintained" | "Quiet" | "Archived"; detail: string };

/** How alive a repo is, from its archived flag and last push. */
export function repoStatus(repo: DirectoryRepo, now = Date.now()): RepoStatus | null {
  if (repo.archived) return { label: "Archived", detail: "Read-only on GitHub" };
  if (!repo.pushed_at) return null;
  const days = (now - Date.parse(repo.pushed_at)) / 86_400_000;
  if (days <= 30) return { label: "Active", detail: `Updated ${timeAgo(repo.pushed_at, now)}` };
  if (days <= 180) return { label: "Maintained", detail: `Updated ${timeAgo(repo.pushed_at, now)}` };
  return { label: "Quiet", detail: `No changes since ${timeAgo(repo.pushed_at, now)}` };
}

export const SORTS = { stars: "Popular", recent: "Recent", name: "A–Z" } as const;
export type RepoSort = keyof typeof SORTS;

/** Filter by category and a free-text query (all words must match), then sort. */
export function findRepos(repos: DirectoryRepo[], { q, category, sort }: { q: string; category: string; sort: RepoSort }) {
  const words = q.toLowerCase().split(/\s+/).filter(Boolean);
  const hits = repos.filter((t) => {
    if (category && t.category !== category) return false;
    if (!words.length) return true;
    const hay = `${t.name} ${t.description} ${(t.tags ?? []).join(" ")} ${t.language ?? ""}`.toLowerCase();
    return words.every((w) => hay.includes(w));
  });
  if (words.length) {
    // Name matches first, then by stars.
    const named = (t: DirectoryRepo) => (words.every((w) => t.name.toLowerCase().includes(w)) ? 1 : 0);
    hits.sort((a, b) => named(b) - named(a) || (b.stars ?? 0) - (a.stars ?? 0));
  }
  if (sort === "recent") hits.sort((a, b) => (b.pushed_at ?? "").localeCompare(a.pushed_at ?? ""));
  if (sort === "name") hits.sort((a, b) => a.name.localeCompare(b.name, "en", { sensitivity: "base" }));
  // "stars" is the index's own order, unless a query re-ranked it.
  return hits;
}

export function repoSourceUrl(repo: DirectoryRepo): string {
  const shard = /^[a-z]/.test(repo.slug) ? repo.slug[0] : "0-9";
  return `${REPOS_REPO}/blob/main/repos/${shard}/${repo.slug}.toml`;
}

/** "today", "3 days ago", "2 months ago", "1 year ago". */
export function timeAgo(iso: string | undefined, now = Date.now()): string | null {
  if (!iso) return null;
  const days = Math.floor((now - Date.parse(iso)) / 86_400_000);
  if (Number.isNaN(days)) return null;
  if (days < 1) return "today";
  if (days < 30) return `${days} day${days === 1 ? "" : "s"} ago`;
  const months = Math.floor(days / 30.4);
  if (months < 12) return `${months} month${months === 1 ? "" : "s"} ago`;
  const years = Math.floor(days / 365);
  return `${years} year${years === 1 ? "" : "s"} ago`;
}
