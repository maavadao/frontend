import type { Metadata } from "next";
import Link from "next/link";
import { Avatar } from "@/components/Avatar";
import { Pager } from "@/components/Pager";
import { Reveal } from "@/components/Reveal";
import { SearchField } from "@/components/SearchField";
import {
  DEV_SORTS,
  OPT_OUT_URL,
  developerPath,
  findContributors,
  getContributors,
  getMembers,
  roleLabel,
  type Contributor,
  type DevSort,
  type Member,
} from "@/lib/developers";
import { REPOS_REPO, getReposIndex } from "@/lib/repos";

export const metadata: Metadata = {
  title: "Developers",
  description:
    "The people building open-source AI: maavaDao members, and the contributors behind open-source AI repositories.",
};

const PAGE_SIZE = 40;
const number = new Intl.NumberFormat("en-GB");

type Params = { q: string; sort: DevSort; page: number };

function first(v: string | string[] | undefined): string {
  return (Array.isArray(v) ? v[0] : v) ?? "";
}

function href({ q, sort, page }: Params): string {
  const p = new URLSearchParams();
  if (q) p.set("q", q);
  if (sort !== "projects") p.set("sort", sort);
  if (page > 1) p.set("page", String(page));
  const s = p.toString();
  return s ? `/developers?${s}#contributors` : "/developers#contributors";
}

function MemberCard({ member, repos }: { member: Member; repos: string[] }) {
  const name = member.display_name || member.username;
  const handle = member.github_login || member.username;
  return (
    <Link
      href={developerPath(handle)}
      className="press group flex h-full flex-col rounded-[24px] bg-surface p-5 sm:rounded-[28px] sm:p-7 motion-safe:hover:-translate-y-1 hover:shadow-[0_20px_50px_-20px_rgb(0_0_0/0.25)]"
    >
      <div className="flex items-center gap-4">
        <Avatar login={member.github_login} name={name} size={56} />
        <div className="min-w-0">
          <h3 className="truncate text-headline">{name}</h3>
          <p className="truncate text-footnote text-fg-2">
            @{handle} · {roleLabel(member.role)}
          </p>
        </div>
      </div>
      {member.bio && <p className="mt-4 line-clamp-3 text-body text-pretty text-fg-2">{member.bio}</p>}
      <p className="mt-auto pt-5 text-footnote text-fg-2">
        {repos.length ? `Contributes to ${repos.slice(0, 3).join(", ")}${repos.length > 3 ? ` and ${repos.length - 3} more` : ""}` : "maavaDao member"}
      </p>
    </Link>
  );
}

function ContributorRow({ person, repoNames }: { person: Contributor; repoNames: Map<string, string> }) {
  const names = person.repos.map(([slug]) => repoNames.get(slug) ?? slug);
  return (
    <Link
      href={developerPath(person.login)}
      className="flex min-h-16 items-center gap-4 px-4 py-3 transition-colors duration-200 hover:bg-bg-alt/60 sm:px-5"
    >
      <Avatar id={person.id} login={person.login} name={person.login} size={40} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-body font-medium">{person.login}</p>
        <p className="truncate text-footnote text-fg-2">
          {names.slice(0, 3).join(" · ")}
          {names.length > 3 ? ` · +${names.length - 3}` : ""}
        </p>
      </div>
      <div className="hidden shrink-0 text-right sm:block">
        <p className="text-callout tabular-nums">{number.format(person.total)}</p>
        <p className="text-caption text-fg-2">commits</p>
      </div>
      <span aria-hidden="true" className="shrink-0 text-fg-2">
        ›
      </span>
    </Link>
  );
}

export default async function DevelopersPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const sp = await searchParams;
  const [contributors, members, repos] = await Promise.all([getContributors(), getMembers(), getReposIndex()]);
  const repoNames = new Map((repos?.repos ?? []).map((r) => [r.slug, r.name]));
  const memberLogins = new Set(members.flatMap((m) => (m.github_login ? [m.github_login.toLowerCase()] : [])));
  const byLogin = new Map(
    (contributors?.developers ?? []).filter((d) => memberLogins.has(d.login.toLowerCase())).map((d) => [d.login.toLowerCase(), d]),
  );

  const rawSort = first(sp.sort);
  const params: Params = {
    q: first(sp.q).trim().slice(0, 100),
    sort: rawSort in DEV_SORTS ? (rawSort as DevSort) : "projects",
    page: Math.max(1, Number.parseInt(first(sp.page), 10) || 1),
  };
  const hits = contributors ? findContributors(contributors.developers, repoNames, params) : [];
  const pages = Math.max(1, Math.ceil(hits.length / PAGE_SIZE));
  const page = Math.min(params.page, pages);
  const shown = hits.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <main className="bg-bg-alt px-4 pt-28 pb-20 sm:px-6 sm:pt-32 sm:pb-28 lg:pb-36">
      <div className="mx-auto max-w-[1100px]">
        <Reveal className="mx-auto max-w-[760px] text-center">
          <p className="text-callout font-semibold text-fg-2 sm:text-body">Developers</p>
          <h1 className="mt-2 font-display text-display text-balance">The people building open-source AI.</h1>
          <p className="mt-5 text-lede text-pretty text-fg-2">
            maavaDao members who build with us, and{" "}
            {contributors ? `${number.format(contributors.count)} developers` : "the developers"} behind open-source AI
            repositories. Build an agent together, get rewarded for your work, and help children in need: 60% of what it earns goes to its contributors and 40% to children&rsquo;s education.
          </p>
        </Reveal>

        <Reveal delay={100} className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/developers/join"
            className="press rounded-full bg-cta px-6 py-3 text-body font-medium text-white hover:bg-cta-hover"
          >
            Join the directory
          </Link>
          <Link
            href="/agents"
            className="press rounded-full bg-surface px-6 py-3 text-body font-medium text-fg hover:bg-bg"
          >
            Build Community Agents
          </Link>
        </Reveal>

        <section aria-labelledby="members" className="mt-16 sm:mt-24">
          <Reveal>
            <h2 id="members" className="text-title">
              maavaDao members
            </h2>
            <p className="mt-2 text-body text-fg-2">Developers who joined maavaDao and chose to be listed.</p>
          </Reveal>
          {members.length === 0 ? (
            <Reveal delay={80} className="mt-6 rounded-[28px] bg-surface p-10 text-center sm:p-14">
              <p className="text-headline">Be the first member listed.</p>
              <p className="mt-2 text-body text-fg-2">
                Sign in with GitHub and{" "}
                <Link className="text-link hover:underline" href="/developers/join">
                  add yourself
                </Link>
                . Your contributions to open-source AI appear on your profile.
              </p>
            </Reveal>
          ) : (
            <Reveal delay={80} as="ul" className="mt-6 gallery sm:grid sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
              {members.map((m) => {
                const c = m.github_login ? byLogin.get(m.github_login.toLowerCase()) : undefined;
                return (
                  <li key={m.username}>
                    <MemberCard member={m} repos={(c?.repos ?? []).map(([slug]) => repoNames.get(slug) ?? slug)} />
                  </li>
                );
              })}
            </Reveal>
          )}
        </section>

        <section aria-labelledby="contributors" className="mt-16 scroll-mt-24 sm:mt-24">
          <Reveal>
            <h2 id="contributors" className="text-title">
              Contributors to open-source AI
            </h2>
            <p className="mt-2 text-body text-pretty text-fg-2">
              The top contributors to {contributors ? number.format(contributors.repos_covered) : "thousands of"}
              repos in our{" "}
              <Link className="text-link hover:underline" href="/repos">
                open-source AI directory
              </Link>
              , from public GitHub data.
            </p>
          </Reveal>

          {!contributors ? (
            <Reveal delay={80} className="mt-6 rounded-[28px] bg-surface p-10 text-center sm:p-14">
              <p className="text-headline">This list is being built.</p>
              <p className="mt-2 text-body text-fg-2">It refreshes daily from GitHub. Check back shortly.</p>
            </Reveal>
          ) : (
            <Reveal delay={80}>
              <div className="mt-6 mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <SearchField
                  action="/developers"
                  q={params.q}
                  keep={{ sort: params.sort === "projects" ? "" : params.sort }}
                  label="Search by GitHub login or repo"
                />
                <div role="group" aria-label="Sort" className="flex w-full shrink-0 gap-1 rounded-full bg-surface p-1 sm:w-fit">
                  {(Object.keys(DEV_SORTS) as DevSort[]).map((s) => (
                    <Link
                      key={s}
                      href={href({ ...params, sort: s, page: 1 })}
                      scroll={false}
                      aria-current={params.sort === s ? "true" : undefined}
                      className={`press flex min-h-9 flex-1 items-center justify-center rounded-full px-4 text-callout whitespace-nowrap sm:flex-none ${
                        params.sort === s ? "bg-fg text-bg" : "text-fg-2 hover:text-fg"
                      }`}
                    >
                      {DEV_SORTS[s]}
                    </Link>
                  ))}
                </div>
              </div>

              <p className="mb-4 text-callout text-fg-2" aria-live="polite">
                <span className="font-semibold text-fg">{number.format(hits.length)}</span>{" "}
                {hits.length === 1 ? "developer" : "developers"}
                {params.q ? ` matching “${params.q}”` : ""}
              </p>

              {shown.length === 0 ? (
                <p className="rounded-[28px] bg-surface p-10 text-center text-body text-fg-2 sm:p-14">
                  No matches. Try a GitHub login or a repo name.
                </p>
              ) : (
                <ul
                  key={`${params.q}-${params.sort}-${page}`}
                  className="animate-fade divide-y divide-line overflow-hidden rounded-[24px] bg-surface sm:rounded-[28px]"
                >
                  {shown.map((p) => (
                    <li key={p.login}>
                      <ContributorRow person={p} repoNames={repoNames} />
                    </li>
                  ))}
                </ul>
              )}

              <Pager page={page} pages={pages} href={(n) => href({ ...params, page: n })} />
            </Reveal>
          )}

          <p className="mt-12 text-center text-footnote text-pretty text-fg-2 sm:mt-16">
            Contributor lists show only public GitHub data: login, avatar and commits per repo. Don&rsquo;t want to be
            listed?{" "}
            <a className="text-link hover:underline" href={OPT_OUT_URL}>
              Ask to be removed
            </a>{" "}
            and you&rsquo;re gone on the next build.{" "}
            <a className="text-link hover:underline" href={`${REPOS_REPO}#readme`}>
              How this list is made
            </a>
          </p>
        </section>
      </div>
    </main>
  );
}
