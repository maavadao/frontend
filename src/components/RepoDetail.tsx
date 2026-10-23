import Link from "next/link";
import { Avatar } from "@/components/Avatar";
import { Icon } from "@/components/Icon";
import { CommentActions, CommentForm, ListStatus, StarRating } from "@/components/RepoSocial";
import { StarHistory } from "@/components/StarHistory";
import { awardsFor, type CommunitySummary } from "@/lib/awards";
import { developerPath, getRepoContributors } from "@/lib/developers";
import { formatCount } from "@/lib/registry";
import { getRepo, getStarHistory, repoStatus, timeAgo } from "@/lib/repos";
import { getClaims } from "@/lib/supabase/server";

const number = new Intl.NumberFormat("en-GB");
const date = (iso: string) => new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

type Comment = { id: number; username: string; github_login: string | null; body: string; created_at: string; edited_at: string | null; user_id: string };

const STATUS_DOT: Record<string, string> = {
  Active: "bg-[#34c759]",
  Maintained: "bg-[#0a84ff]",
  Quiet: "bg-[#8e8e93]",
  Archived: "bg-[#8e8e93]",
};

function Section({ title, children, aside }: { title: string; children: React.ReactNode; aside?: React.ReactNode }) {
  return (
    <section className="mt-10">
      <div className="mb-4 flex items-baseline justify-between gap-3">
        <h2 className="text-headline">{title}</h2>
        {aside}
      </div>
      {children}
    </section>
  );
}

async function community(slug: string) {
  const { supabase, claims } = await getClaims();
  const [summary, comments, mine] = await Promise.all([
    supabase.rpc("repo_summary", { slug }).maybeSingle(),
    supabase
      .from("repo_comments")
      .select("id, username, github_login, body, created_at, edited_at, user_id")
      .eq("repo_slug", slug)
      .order("created_at", { ascending: false })
      .limit(50),
    claims
      ? Promise.all([
          supabase.from("repo_ratings").select("score").eq("repo_slug", slug).eq("user_id", claims.sub).maybeSingle(),
          supabase.from("repo_lists").select("status").eq("repo_slug", slug).eq("user_id", claims.sub).maybeSingle(),
        ])
      : null,
  ]);
  return {
    summary: (summary.data as CommunitySummary | null) ?? null,
    comments: (comments.data as Comment[] | null) ?? [],
    userId: claims?.sub ?? null,
    myScore: (mine?.[0].data?.score as number | undefined) ?? null,
    myStatus: (mine?.[1].data?.status as string | undefined) ?? null,
  };
}

/** Everything about one repo: facts, status, awards, star history, contributors and the community's ratings and comments. */
export async function RepoDetail({ slug }: { slug: string }) {
  const found = await getRepo(slug);
  if (!found) return null;
  const { repo, category, rank, total, categoryRank, categoryTotal } = found;
  const [history, contributors, social] = await Promise.all([getStarHistory(slug), getRepoContributors(slug), community(slug).catch(() => null)]);
  const status = repoStatus(repo);
  const awards = awardsFor({ repo, rank, total, categoryName: category?.name, categoryRank, history, community: social?.summary ?? null });
  const ownerRepo = repo.repository.replace(/^https:\/\/[^/]+\//, "");
  const signedIn = !!social?.userId;
  const s = social?.summary;

  const stats: [string, string, string?][] = [
    ["Stars", repo.stars != null ? number.format(repo.stars) : "–", `#${number.format(rank)} of ${number.format(total)}`],
    ["Forks", repo.forks != null ? number.format(repo.forks) : "–"],
    ["Open issues", repo.open_issues != null ? number.format(repo.open_issues) : "–"],
    ["Watchers", repo.watchers != null ? number.format(repo.watchers) : "–"],
    ["Latest release", repo.release ? repo.release[0] : "None yet", repo.release ? date(repo.release[1]) : undefined],
    ["Last activity", repo.pushed_at ? (timeAgo(repo.pushed_at) ?? "–") : "–"],
    ["Created", repo.created_at ? date(repo.created_at) : "–"],
    ["Licence", repo.license && repo.license !== "NOASSERTION" ? repo.license : "Not stated", repo.language],
  ];

  const historyNote = history.length
    ? `Recorded by maavaDao every day since ${date(new Date(history[0][0] * 86_400_000).toISOString())}.`
    : "";

  return (
    <article>
      <header>
        <p className="text-caption font-medium tracking-[0.06em] text-fg-2 uppercase">
          {category?.name ?? repo.category} · #{categoryRank} of {number.format(categoryTotal)}
        </p>
        <h1 className="mt-1 pr-12 font-display text-display [overflow-wrap:anywhere]">{repo.name}</h1>
        <p className="mt-1 text-callout text-fg-2 [overflow-wrap:anywhere]">{ownerRepo}</p>
        {status && (
          <p className="mt-3 inline-flex items-center gap-2 rounded-full bg-bg-alt px-3 py-1 text-footnote">
            <span aria-hidden="true" className={`h-2 w-2 rounded-full ${STATUS_DOT[status.label]}`} />
            <span className="font-medium">{status.label}</span>
            <span className="text-fg-2">· {status.detail}</span>
          </p>
        )}
        <p className="mt-4 text-lede text-pretty [overflow-wrap:anywhere]">{repo.description}</p>
        {repo.tags && repo.tags.length > 0 && (
          <ul className="mt-4 flex flex-wrap gap-2">
            {repo.tags.map((t) => (
              <li key={t}>
                <Link href={`/repos?q=${encodeURIComponent(t)}`} className="rounded-full bg-bg-alt px-3 py-1 text-footnote text-fg-2 hover:text-fg">
                  {t}
                </Link>
              </li>
            ))}
          </ul>
        )}
        <div className="mt-6 flex flex-wrap gap-3">
          <a
            href={repo.repository}
            target="_blank"
            rel="noreferrer"
            className="press inline-flex min-h-11 items-center rounded-full bg-cta px-5 text-body font-medium text-white hover:bg-cta-hover"
          >
            View on GitHub
          </a>
          {[
            ["Website", repo.website],
            ["Docs", repo.docs],
          ].map(
            ([label, url]) =>
              url && (
                <a
                  key={label}
                  href={url}
                  target="_blank"
                  rel="noreferrer nofollow"
                  className="press inline-flex min-h-11 items-center rounded-full bg-bg-alt px-5 text-body font-medium text-fg hover:bg-bg"
                >
                  {label}
                </a>
              ),
          )}
        </div>
      </header>

      <section aria-label="Community rating" className="mt-8 grid gap-4 rounded-[24px] bg-bg-alt p-4 sm:grid-cols-[auto_1fr] sm:items-center sm:gap-8 sm:p-6">
        <div className="flex items-center gap-4 sm:flex-col sm:items-start sm:gap-1">
          <p className="font-display text-figure leading-none tabular-nums">{s?.rating != null ? s.rating.toFixed(1) : "–"}</p>
          <p className="text-footnote text-fg-2">
            {s?.ratings ? `${number.format(s.ratings)} rating${s.ratings === 1 ? "" : "s"}` : "No ratings yet"}
          </p>
        </div>
        <div className="grid gap-3">
          <StarRating slug={slug} mine={social?.myScore ?? null} signedIn={signedIn} />
          <ListStatus slug={slug} mine={social?.myStatus ?? null} signedIn={signedIn} />
          {s && s.using_count + s.want_count + s.used_count > 0 && (
            <p className="px-1 text-footnote text-fg-2">
              {[
                s.using_count && `${number.format(s.using_count)} using`,
                s.want_count && `${number.format(s.want_count)} want to try`,
                s.used_count && `${number.format(s.used_count)} used before`,
              ]
                .filter(Boolean)
                .join(" · ")}
            </p>
          )}
        </div>
      </section>

      {awards.length > 0 && (
        <Section title="Awards">
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 [&>li]:min-w-0">
            {awards.map((a) => (
              <li key={a.title} className="flex items-center gap-3 rounded-[20px] bg-bg-alt p-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-surface text-accent-text">
                  <Icon name={a.icon} className="h-6 w-6" />
                </span>
                <span className="min-w-0">
                  <span className="block text-body font-medium">{a.title}</span>
                  <span className="block text-footnote text-fg-2">{a.detail}</span>
                </span>
              </li>
            ))}
          </ul>
        </Section>
      )}

      <Section title="Stats">
        <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {stats.map(([label, value, sub]) => (
            <div key={label} className="min-w-0 rounded-[20px] bg-bg-alt p-4">
              <dt className="text-footnote text-fg-2">{label}</dt>
              <dd className="mt-1 truncate text-headline tabular-nums">{value}</dd>
              {sub && <dd className="truncate text-caption text-fg-2">{sub}</dd>}
            </div>
          ))}
        </dl>
      </Section>

      <Section title="Star history" aside={repo.stars != null && <span className="text-footnote text-fg-2">{formatCount(repo.stars)} today</span>}>
        <StarHistory points={history} note={historyNote} />
      </Section>

      <Section
        title="Top contributors"
        aside={
          <a href={`${repo.repository}/graphs/contributors`} target="_blank" rel="noreferrer" className="text-footnote text-link hover:underline">
            All on GitHub
          </a>
        }
      >
        {contributors.covered ? (
          <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {contributors.people.slice(0, 12).map((p) => (
              <li key={p.login} className="min-w-0">
                <Link href={developerPath(p.login)} className="flex min-h-14 items-center gap-3 rounded-2xl px-2 py-1.5 hover:bg-bg-alt">
                  <Avatar id={p.id} login={p.login} name={p.login} size={36} />
                  <span className="min-w-0 flex-1 truncate text-body">{p.login}</span>
                  <span className="shrink-0 text-footnote text-fg-2 tabular-nums">{number.format(p.commits)} commits</span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="rounded-[20px] bg-bg-alt p-5 text-body text-fg-2">
            We don&rsquo;t have contributors for this repo yet. See this repo&rsquo;s contributors on GitHub.
          </p>
        )}
      </Section>

      <Section title="Comments" aside={<span className="text-footnote text-fg-2">{number.format(s?.comments ?? 0)}</span>}>
        {signedIn ? (
          <CommentForm slug={slug} />
        ) : (
          <p className="rounded-[20px] bg-bg-alt p-5 text-body text-fg-2">
            <Link className="text-link hover:underline" href={`/login?next=${encodeURIComponent(`/repos/${slug}`)}`}>
              Sign in
            </Link>{" "}
            to rate this repo, add it to your list and join the conversation.
          </p>
        )}
        {social && social.comments.length > 0 ? (
          <ul className="mt-6 divide-y divide-line">
            {social.comments.map((c) => (
              <li key={c.id} className="flex gap-3 py-4">
                <Avatar login={c.github_login} name={c.username} size={36} />
                <div className="min-w-0 flex-1">
                  <p className="text-footnote">
                    <span className="font-medium">{c.username}</span>{" "}
                    <span className="text-fg-2">
                      · {timeAgo(c.created_at)}
                      {c.edited_at ? " · edited" : ""}
                    </span>
                  </p>
                  <p className="mt-1 text-body whitespace-pre-line [overflow-wrap:anywhere]">{c.body}</p>
                  <div className="-ml-2">
                    <CommentActions slug={slug} id={c.id} own={c.user_id === social.userId} signedIn={signedIn} />
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-6 text-center text-body text-fg-2">No comments yet. Start the conversation.</p>
        )}
      </Section>
    </article>
  );
}
