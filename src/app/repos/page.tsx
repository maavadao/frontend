import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@/components/Icon";
import { Reveal } from "@/components/Reveal";
import { Pager } from "@/components/Pager";
import { SearchField } from "@/components/SearchField";
import { formatCount } from "@/lib/registry";
import {
  SORTS,
  REPOS_REPO,
  findRepos,
  getReposIndex,
  timeAgo,
  type DirectoryRepo,
  type RepoSort,
} from "@/lib/repos";

export const metadata: Metadata = {
  title: "Open-source AI repos",
  description:
    "A community-maintained directory of open-source AI repositories for learning, teaching, research and building. Anyone can add a repo with a pull request.",
};

const PAGE_SIZE = 30;
const number = new Intl.NumberFormat("en-GB");

type Params = { q: string; category: string; sort: RepoSort; page: number };

function first(v: string | string[] | undefined): string {
  return (Array.isArray(v) ? v[0] : v) ?? "";
}

/** /repos URL for a set of filters, leaving out defaults so links stay short. */
function href({ q, category, sort, page }: Params): string {
  const p = new URLSearchParams();
  if (q) p.set("q", q);
  if (category) p.set("category", category);
  if (sort !== "stars") p.set("sort", sort);
  if (page > 1) p.set("page", String(page));
  const s = p.toString();
  return s ? `/repos?${s}` : "/repos";
}

function RepoCard({ repo, category }: { repo: DirectoryRepo; category?: string }) {
  const updated = timeAgo(repo.pushed_at);
  const meta = [repo.language, repo.license && repo.license !== "NOASSERTION" ? repo.license : null].filter(Boolean);
  return (
    <a
      href={repo.repository}
      target="_blank"
      rel="noreferrer"
      className="press group flex h-full flex-col rounded-[24px] bg-surface p-5 sm:rounded-[28px] sm:p-7 motion-safe:hover:-translate-y-1 hover:shadow-[0_20px_50px_-20px_rgb(0_0_0/0.25)]"
    >
      <div className="flex items-start justify-between gap-4">
        <p className="text-caption font-medium tracking-[0.06em] text-fg-2 uppercase">{category ?? repo.category}</p>
        {repo.stars != null && (
          <span className="flex shrink-0 items-center gap-1 text-caption text-fg-2">
            <Icon name="star" className="h-3.5 w-3.5" />
            <span className="sr-only">Stars:</span>
            {formatCount(repo.stars)}
          </span>
        )}
      </div>
      <h3 className="mt-1.5 text-headline [overflow-wrap:anywhere]">{repo.name}</h3>
      <p className="mt-2 line-clamp-3 flex-1 text-body text-pretty [overflow-wrap:anywhere] text-fg-2">{repo.description}</p>
      <div className="mt-5 flex items-center justify-between gap-3 text-footnote text-fg-2">
        <span className="min-w-0 truncate">
          {repo.archived ? "Archived" : [...meta, updated && `updated ${updated}`].filter(Boolean).join(" · ")}
        </span>
        <span className="shrink-0 text-callout text-link">
          Open
          <span className="ml-1 inline-block transition-transform duration-300 group-hover:translate-x-1">›</span>
        </span>
      </div>
    </a>
  );
}

export default async function ReposPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const sp = await searchParams;
  const index = await getReposIndex();
  const categories = index?.categories ?? {};
  const rawSort = first(sp.sort);
  const params: Params = {
    q: first(sp.q).trim().slice(0, 100),
    category: first(sp.category) in categories ? first(sp.category) : "",
    sort: rawSort in SORTS ? (rawSort as RepoSort) : "stars",
    page: Math.max(1, Number.parseInt(first(sp.page), 10) || 1),
  };

  const hits = index ? findRepos(index.repos, params) : [];
  const pages = Math.max(1, Math.ceil(hits.length / PAGE_SIZE));
  const page = Math.min(params.page, pages);
  const shown = hits.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const selected = params.category ? categories[params.category] : null;
  const chips = [["", { name: "All", count: index?.count ?? 0 }] as const, ...Object.entries(categories)].filter(
    ([, c]) => c.count > 0,
  );

  return (
    <main className="bg-bg-alt px-4 pt-28 pb-20 sm:px-6 sm:pt-32 sm:pb-28 lg:pb-36">
      <div className="mx-auto max-w-[1100px]">
        <Reveal className="mx-auto max-w-[760px] text-center">
          <p className="text-callout font-semibold text-fg-2 sm:text-body">Open-source AI repos</p>
          <h1 className="mt-2 font-display text-display text-balance">Open-source AI, all in one place.</h1>
          <p className="mt-5 text-lede text-pretty text-fg-2">
            {index ? `${number.format(index.count)} open-source` : "Open-source"} AI repositories for learning, teaching,
            research and building. Kept up to date by the community: anyone can add a repo with a pull request.
          </p>
        </Reveal>

        <Reveal delay={100} className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <a
            href={`${REPOS_REPO}/blob/main/CONTRIBUTING.md`}
            className="press rounded-full bg-cta px-6 py-3 text-body font-medium text-white hover:bg-cta-hover"
          >
            Add a repo
          </a>
          <a
            href={REPOS_REPO}
            className="press rounded-full bg-surface px-6 py-3 text-body font-medium text-fg hover:bg-bg"
          >
            View on GitHub
          </a>
        </Reveal>

        {!index ? (
          <Reveal delay={150} className="mt-14 rounded-[28px] bg-surface p-10 text-center sm:mt-20 sm:p-16">
            <p className="text-headline">The directory is being built.</p>
            <p className="mt-2 text-body text-fg-2">
              Check back shortly, or browse the repos{" "}
              <a className="text-link hover:underline" href={`${REPOS_REPO}/tree/main/repos`}>
                on GitHub
              </a>
              .
            </p>
          </Reveal>
        ) : (
          <Reveal delay={150} className="mt-14 sm:mt-20">
            <nav
              aria-label="Categories"
              className="-mx-4 [mask-image:linear-gradient(to_right,transparent,black_1rem,black_calc(100%-2.5rem),transparent)] sm:mx-0"
            >
              <ul className="flex snap-x scroll-px-4 gap-2 overflow-x-auto overscroll-x-contain px-4 py-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {chips.map(([id, c]) => {
                  const active = params.category === id;
                  return (
                    <li key={id || "all"} className="shrink-0 snap-start">
                      <Link
                        href={href({ ...params, category: id, page: 1 })}
                        scroll={false}
                        aria-current={active ? "page" : undefined}
                        className={`press flex min-h-11 items-center gap-1.5 rounded-full px-4 text-callout ${
                          active ? "bg-fg text-bg" : "bg-surface text-fg-2 hover:text-fg"
                        }`}
                      >
                        {c.name}
                        <span className={active ? "opacity-70" : "text-fg-2/70"}>{formatCount(c.count)}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>

            <div className="mt-8 mb-8 flex flex-col gap-4 sm:mt-10 sm:mb-10 sm:flex-row sm:items-center sm:justify-between">
              <SearchField
                action="/repos"
                q={params.q}
                keep={{ category: params.category, sort: params.sort === "stars" ? "" : params.sort }}
                label="Search repos, tags or languages"
              />
              <div role="group" aria-label="Sort" className="flex w-full shrink-0 gap-1 rounded-full bg-surface p-1 sm:w-fit">
                {(Object.keys(SORTS) as RepoSort[]).map((s) => (
                  <Link
                    key={s}
                    href={href({ ...params, sort: s, page: 1 })}
                    scroll={false}
                    aria-current={params.sort === s ? "true" : undefined}
                    className={`press flex min-h-9 flex-1 items-center justify-center rounded-full px-4 text-callout whitespace-nowrap sm:flex-none ${
                      params.sort === s ? "bg-fg text-bg" : "text-fg-2 hover:text-fg"
                    }`}
                  >
                    {SORTS[s]}
                  </Link>
                ))}
              </div>
            </div>

            <div className="mb-6 flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between" aria-live="polite">
              <p className="text-callout text-fg-2">
                <span className="font-semibold text-fg">{number.format(hits.length)}</span>{" "}
                {hits.length === 1 ? "repo" : "repos"}
                {selected ? ` in ${selected.name}` : ""}
                {params.q ? ` matching “${params.q}”` : ""}
              </p>
              {selected && <p className="text-footnote text-fg-2">{selected.description}</p>}
            </div>

            {shown.length === 0 ? (
              <div className="rounded-[28px] bg-surface p-10 text-center sm:p-16">
                <p className="text-headline">No matches.</p>
                <p className="mt-2 text-body text-fg-2">
                  Try a different search, or{" "}
                  <a className="text-link hover:underline" href={`${REPOS_REPO}/issues/new/choose`}>
                    suggest a repo
                  </a>{" "}
                  that should be here.
                </p>
              </div>
            ) : (
              <ul key={`${params.category}-${params.q}-${params.sort}-${page}`} className="animate-fade grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 [&>li]:min-w-0">
                {shown.map((t) => (
                  <li key={t.slug}>
                    <RepoCard repo={t} category={categories[t.category]?.name} />
                  </li>
                ))}
              </ul>
            )}

            <Pager page={page} pages={pages} href={(n) => href({ ...params, page: n })} />

            <p className="mt-12 text-center text-footnote text-fg-2 sm:mt-16">
              Details come from each project&rsquo;s own repository. Something wrong or missing?{" "}
              <a className="text-link hover:underline" href={`${REPOS_REPO}/issues/new/choose`}>
                Tell us
              </a>{" "}
              or{" "}
              <a className="text-link hover:underline" href={`${REPOS_REPO}/blob/main/CONTRIBUTING.md`}>
                open a pull request
              </a>
              .
            </p>
          </Reveal>
        )}
      </div>
    </main>
  );
}
