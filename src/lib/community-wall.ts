import { supabaseEnv } from "./supabase/env";

/** Saving the get-involved form refreshes the wall straight away with this tag. */
export const COMMUNITY_WALL_TAG = "community-wall";

export type WallPerson = { username: string; country: string; role: string; ways: string[]; joined: string; total: number };

/** Supporters who chose to appear on the home page (newest 48), and how many there are in all. */
export async function getCommunityWall(): Promise<{ people: WallPerson[]; total: number } | null> {
  try {
    const { url, key } = supabaseEnv();
    const res = await fetch(`${url}/rest/v1/rpc/community_wall`, {
      headers: { apikey: key },
      next: { revalidate: 600, tags: [COMMUNITY_WALL_TAG] },
    });
    if (!res.ok) return null;
    const people = (await res.json()) as WallPerson[];
    return { people, total: Number(people[0]?.total ?? 0) };
  } catch {
    return null;
  }
}
