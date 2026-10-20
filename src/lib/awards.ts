import type { IconName } from "@/components/Icon";
import type { DirectoryRepo, HistoryPoint } from "@/lib/repos";

export type Award = { title: string; detail: string; icon: IconName };

export type CommunitySummary = {
  rating: number | null;
  ratings: number;
  using_count: number;
  want_count: number;
  used_count: number;
  comments: number;
};

const number = new Intl.NumberFormat("en-GB");
const DAY = 86_400_000;

/** Stars gained over the last `days`, from the star history, or null if it doesn't reach back that far. */
export function starsGained(points: HistoryPoint[], days: number, today = Math.floor(Date.now() / DAY)): number | null {
  if (points.length < 2) return null;
  const now = points[points.length - 1];
  const before = [...points].reverse().find(([d]) => d <= today - days);
  return before ? now[1] - before[1] : null;
}

/** Badges a repo has earned, most notable first. All come from data anyone can check. */
export function awardsFor({
  repo,
  rank,
  total,
  categoryName,
  categoryRank,
  history,
  community,
}: {
  repo: DirectoryRepo;
  rank: number;
  total: number;
  categoryName?: string;
  categoryRank: number;
  history: HistoryPoint[];
  community: CommunitySummary | null;
}): Award[] {
  const awards: Award[] = [];
  if (repo.stars != null && rank <= Math.max(1, Math.floor(total / 100)))
    awards.push({ title: "Top 1%", detail: `#${number.format(rank)} most starred of ${number.format(total)}`, icon: "star" });
  if (categoryName && categoryRank <= 10)
    awards.push({
      title: categoryRank <= 3 ? `#${categoryRank} in ${categoryName}` : `Top 10 in ${categoryName}`,
      detail: "By stars in its category",
      icon: "flag",
    });
  const gained = starsGained(history, 30);
  if (gained != null && repo.stars && gained >= Math.max(500, repo.stars * 0.05))
    awards.push({ title: "Rising star", detail: `+${number.format(gained)} stars in 30 days`, icon: "signal" });
  if (community && community.rating != null && community.ratings >= 5 && community.rating >= 4.5)
    awards.push({ title: "Community favourite", detail: `Rated ${community.rating} by ${community.ratings} members`, icon: "heart" });
  if (community && community.comments >= 10)
    awards.push({ title: "Talked about", detail: `${community.comments} comments from members`, icon: "people" });
  if (!repo.archived && repo.pushed_at && Date.now() - Date.parse(repo.pushed_at) <= 7 * DAY)
    awards.push({ title: "Updated this week", detail: "Changes pushed in the last 7 days", icon: "code" });
  if (
    !repo.archived &&
    repo.created_at &&
    Date.now() - Date.parse(repo.created_at) >= 5 * 365 * DAY &&
    repo.pushed_at &&
    Date.now() - Date.parse(repo.pushed_at) <= 180 * DAY
  )
    awards.push({ title: "Built to last", detail: "Five years old and still maintained", icon: "shield" });
  if (repo.skill_level === "beginner") awards.push({ title: "Beginner friendly", detail: "A good place to start", icon: "school" });
  if (repo.runs_locally) awards.push({ title: "Runs locally", detail: "On your own machine or server", icon: "lock" });
  return awards;
}
