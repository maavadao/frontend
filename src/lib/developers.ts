// The developer community: maavaDao members who opted in to the directory (Supabase table
// developer_directory), and contributors to the most-starred open-source AI repos (contributors.json,
// published by github.com/maavadao/open-source-ai-repos from public GitHub data, with an opt-out).

import { createClient } from "@/lib/supabase/server";
import { REPOS_PAGES, REPOS_REPO, memoJson } from "@/lib/repos";

export interface Contributor {
  login: string;
  /** GitHub user id, for the avatar. */
  id: number;
  total: number;
  /** [repo slug, commits], most commits first. */
  repos: [string, number][];
}

export interface ContributorsIndex {
  generated_at: string;
  repos_covered: number;
  count: number;
  developers: Contributor[];
}

export interface Member {
  username: string;
  role: string;
  country: string | null;
  github_login: string | null;
  display_name: string | null;
  bio: string | null;
  website: string | null;
  joined_at: string;
}

export const OPT_OUT_URL = `${REPOS_REPO}/issues/new?template=remove-me.yml`;

/** Contributors from the published file, or null if it can't be fetched. */
export const getContributors = memoJson<ContributorsIndex>(`${REPOS_PAGES}/contributors.json`);

const MEMBER_FIELDS = "username, role, country, github_login, display_name, bio, website, joined_at";

/** Members listed in the directory, newest first. Empty if Supabase isn't reachable. */
export async function getMembers(): Promise<Member[]> {
  try {
    const supabase = await createClient();
    const { data } = await supabase.from("developer_directory").select(MEMBER_FIELDS).order("joined_at", { ascending: false });
    return (data as Member[] | null) ?? [];
  } catch {
    return [];
  }
}

/** GitHub logins and maavaDao usernames: letters, digits, hyphens and underscores. */
export const HANDLE_RE = /^[A-Za-z0-9_-]{1,39}$/;

/** One listed member by GitHub login or maavaDao username, or null. */
export async function getMember(handle: string): Promise<Member | null> {
  // The handle goes into a PostgREST filter, so only plain handles get that far.
  if (!HANDLE_RE.test(handle)) return null;
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("developer_directory")
      .select(MEMBER_FIELDS)
      .or(`github_login.ilike.${handle.replace(/_/g, "\\_")},username.eq.${handle.toLowerCase()}`)
      .limit(1)
      .maybeSingle();
    return (data as Member | null) ?? null;
  } catch {
    return null;
  }
}

/** The address of a developer's page: their GitHub login if they have one, else their username. */
export function developerPath(handle: string): string {
  return `/developers/${encodeURIComponent(handle)}`;
}

/** GitHub avatar by user id (contributors) or login (members). next/image picks the size. */
export function avatarUrl(who: { id?: number; login?: string | null }): string {
  return `https://avatars.githubusercontent.com/${who.id ? `u/${who.id}` : encodeURIComponent(who.login ?? "")}`;
}

const ROLE_LABELS: Record<string, string> = {
  student: "Student",
  developer: "AI developer",
  contributor: "Open-source contributor",
  educator: "Educator",
  organisation: "Organisation",
  funder: "Funder or partner",
};

export function roleLabel(id: string): string {
  return ROLE_LABELS[id] ?? id;
}

export const DEV_SORTS = { projects: "Projects", commits: "Commits", name: "A–Z" } as const;
export type DevSort = keyof typeof DEV_SORTS;

/**
 * Filter contributors by a query matching their login or a repo they contribute to (by slug or
 * name), then sort. The file is already sorted by projects, then commits.
 */
export function findContributors(
  people: Contributor[],
  repoNames: Map<string, string>,
  { q, sort }: { q: string; sort: DevSort },
): Contributor[] {
  const words = q.toLowerCase().split(/\s+/).filter(Boolean);
  const hits = words.length
    ? people.filter((p) => {
        const hay = `${p.login} ${p.repos.map(([slug]) => `${slug} ${repoNames.get(slug) ?? ""}`).join(" ")}`.toLowerCase();
        return words.every((w) => hay.includes(w));
      })
    : [...people];
  if (sort === "commits") hits.sort((a, b) => b.total - a.total);
  if (sort === "name") hits.sort((a, b) => a.login.localeCompare(b.login, "en", { sensitivity: "base" }));
  return hits;
}
