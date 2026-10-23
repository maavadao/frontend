import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@/components/Icon";
import { Pager } from "@/components/Pager";
import { Reveal } from "@/components/Reveal";
import { SearchField } from "@/components/SearchField";
import { SuggestTool } from "@/components/SuggestTool";
import { formatCount } from "@/lib/registry";
import {
  PRICE_FILTERS,
  TOOLS_REPO,
  TOOL_SORTS,
  findTools,
  getToolRatings,
  getToolsIndex,
  priceLabel,
  type PriceFilter,
  type Tool,
  type ToolRating,
  type ToolSort,
} from "@/lib/tools";

export const metadata: Metadata = {
  title: "Directory",
  description:
    "A directory of AI tools, sites and suites, open source or not: what they do, what they cost, and what maavaDao members think of them.",
};

const PAGE_SIZE = 24;
const number = new Intl.NumberFormat("en-GB");

type Params = { q: string; category: string; price: PriceFilter | ""; sort: ToolSort; page: number };

function first(v: string | string[] | undefined): string {
  return (Array.isArray(v) ? v[0] : v) ?? "";
}

/** /directory URL for a set of filters, leaving out defaults so links stay short. */
function href({ q, category, price, sort, page }: Params): string {
  const p = new URLSearchParams();
  if (q) p.set("q", q);
  if (category) p.set("category", category);
  if (price) p.set("price", price);
  if (sort !== "rated") p.set("sort", sort);
  if (page > 1) p.set("page", String(page));
  const s = p.toString();
  return s ? `/directory?${s}` : "/directory";
}

function Preview({ tool }: { tool: Tool }) {
  return (
    <div className="relative aspect-[16/9] overflow-hidden rounded-[16px] bg-bg-alt sm:rounded-[20px]">
      {tool.image ? (
        // The tool's own preview image, from its site: hosts vary, so it isn't run through next/image.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={tool.image}
          alt=""
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
          className="h-full w-full object-cover"
        />
      ) : (
        <span aria-hidden="true" className="flex h-full items-center justify-center font-display text-figure text-fg-2/40">
          {tool.name.slice(0, 1).toUpperCase()}
        </span>
      )}
    </div>
  );
}

function ToolCard({ tool, category, rating }: { tool: Tool; category?: string; rating?: ToolRating }) {
  const price = priceLabel(tool);
  return (
    <Link
      href={`/directory/${tool.slug}`}
      className="press group flex h-full flex-col rounded-[24px] bg-surface p-3 sm:rounded-[28px] sm:p-4 motion-safe:hover:-translate-y-1 hover:shadow-[0_20px_50px_-20px_rgb(0_0_0/0.25)]"
    >
      <Preview tool={tool} />
      <div className="flex flex-1 flex-col px-2 pt-4 pb-2 sm:px-3">
        <div className="flex items-start justify-between gap-3">
          <p className="text-caption font-medium tracking-[0.06em] text-fg-2 uppercase">{category ?? tool.category}</p>
          {rating && (
            <span className="flex shrink-0 items-center gap-1 text-caption text-fg-2">
              <Icon name="star" className="h-3.5 w-3.5 text-[#ff9f0a] [&_path]:fill-current" />
              <span className="sr-only">Rating:</span>
              {rating.rating.toFixed(1)}
              <span className="text-fg-2/70">({formatCount(rating.ratings)})</span>
            </span>
          )}
        </div>
        <h3 className="mt-1.5 text-headline [overflow-wrap:anywhere]">{tool.name}</h3>
        <p className="mt-2 line-clamp-3 flex-1 text-body text-pretty [overflow-wrap:anywhere] text-fg-2">{tool.description}</p>
        <div className="mt-4 flex items-center justify-between gap-3 text-footnote text-fg-2">
          <span className="min-w-0 truncate">
            {[price, tool.free_trial && !/trial/i.test(price ?? "") ? "Free trial" : null].filter(Boolean).join(" · ") || "Pricing not listed yet"}
          </span>
          <span className="shrink-0 text-callout text-link">
            Details
            <span className="ml-1 inline-block transition-transform duration-300 group-hover:translate-x-1">›</span>
          </span>
        </div>
      </div>
    </Link>
  );
}

export default async function AiToolsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const sp = await searchParams;
  const [index, ratings] = await Promise.all([getToolsIndex(), getToolRatings()]);
  const categories = index?.categories ?? {};
  const rawSort = first(sp.sort);
  const rawPrice = first(sp.price);
  const params: Params = {
    q: first(sp.q).trim().slice(0, 100),
    category: first(sp.category) in categories ? first(sp.category) : "",
    price: rawPrice in PRICE_FILTERS ? (rawPrice as PriceFilter) : "",
    sort: rawSort in TOOL_SORTS ? (rawSort as ToolSort) : "rated",
    page: Math.max(1, Number.parseInt(first(sp.page), 10) || 1),
  };

  const hits = index ? findTools(index.tools, ratings, params) : [];
  const pages = Math.max(1, Math.ceil(hits.length / PAGE_SIZE));
  const page = Math.min(params.page, pages);
  const shown = hits.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const selected = params.category ? categories[params.category] : null;
  const chips = [["", { name: "All", count: index?.count ?? 0 }] as const, ...Object.entries(categories)].filter(
    ([, c]) => c.count > 0,
  );
  const pill = (active: boolean) =>
    `press flex min-h-9 flex-1 items-center justify-center rounded-full px-4 text-callout whitespace-nowrap sm:flex-none ${
      active ? "bg-fg text-bg" : "text-fg-2 hover:text-fg"
    }`;

  return (
    <main className="bg-bg-alt px-4 pt-28 pb-20 sm:px-6 sm:pt-32 sm:pb-28 lg:pb-36">
      <div className="mx-auto max-w-[1100px]">
        <Reveal className="mx-auto max-w-[760px] text-center">
          <p className="text-callout font-semibold text-fg-2 sm:text-body">Directory</p>
          <h1 className="mt-2 font-display text-display text-balance">Find the right AI tool.</h1>
          <p className="mt-5 text-lede text-pretty text-fg-2">
            {index ? `${number.format(index.count)} AI tools` : "AI tools"}, sites and suites: what they do, what they
            cost, and what maavaDao members think. Always free to browse, with nothing paid for a place on the list.
          </p>
        </Reveal>

        <Reveal delay={100} className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <a href="#suggest" className="press rounded-full bg-cta px-6 py-3 text-body font-medium text-white hover:bg-cta-hover">
            Suggest a tool
          </a>
          <Link href="/repos" className="press rounded-full bg-surface px-6 py-3 text-body font-medium text-fg hover:bg-bg">
            Open-source AI repos
          </Link>
        </Reveal>

        {!index ? (
          <Reveal delay={150} className="mt-14 rounded-[28px] bg-surface p-10 text-center sm:mt-20 sm:p-16">
            <p className="text-headline">The directory is being built.</p>
            <p className="mt-2 text-body text-fg-2">
              Check back shortly, or browse the tools{" "}
              <a className="text-link hover:underline" href={`${TOOLS_REPO}/tree/main/tools`}>
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

            <div className="mt-8 mb-8 flex flex-col gap-4 sm:mt-10 sm:mb-10 lg:flex-row lg:items-center lg:justify-between">
              <SearchField
                action="/directory"
                q={params.q}
                keep={{ category: params.category, price: params.price, sort: params.sort === "rated" ? "" : params.sort }}
                label="Search tools, companies or tags"
              />
              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <div role="group" aria-label="Price" className="flex w-full shrink-0 gap-1 rounded-full bg-surface p-1 sm:w-fit">
                  {(["", ...Object.keys(PRICE_FILTERS)] as (PriceFilter | "")[]).map((f) => (
                    <Link
                      key={f || "any"}
                      href={href({ ...params, price: f, page: 1 })}
                      scroll={false}
                      aria-current={params.price === f ? "true" : undefined}
                      className={pill(params.price === f)}
                    >
                      {f ? PRICE_FILTERS[f] : "Any price"}
                    </Link>
                  ))}
                </div>
                <div role="group" aria-label="Sort" className="flex w-full shrink-0 gap-1 rounded-full bg-surface p-1 sm:w-fit">
                  {(Object.keys(TOOL_SORTS) as ToolSort[]).map((s) => (
                    <Link
                      key={s}
                      href={href({ ...params, sort: s, page: 1 })}
                      scroll={false}
                      aria-current={params.sort === s ? "true" : undefined}
                      className={pill(params.sort === s)}
                    >
                      {TOOL_SORTS[s]}
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            <div className="mb-6 flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between" aria-live="polite">
              <p className="text-callout text-fg-2">
                <span className="font-semibold text-fg">{number.format(hits.length)}</span> {hits.length === 1 ? "tool" : "tools"}
                {selected ? ` in ${selected.name}` : ""}
                {params.price ? `, ${PRICE_FILTERS[params.price].toLowerCase()}` : ""}
                {params.q ? ` matching “${params.q}”` : ""}
              </p>
              {selected && <p className="text-footnote text-fg-2">{selected.description}</p>}
            </div>

            {shown.length === 0 ? (
              <div className="rounded-[28px] bg-surface p-10 text-center sm:p-16">
                <p className="text-headline">No matches.</p>
                <p className="mt-2 text-body text-fg-2">Try a different search, or suggest the tool below.</p>
              </div>
            ) : (
              <ul
                key={`${params.category}-${params.price}-${params.q}-${params.sort}-${page}`}
                className="animate-fade grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 [&>li]:min-w-0"
              >
                {shown.map((t) => (
                  <li key={t.slug}>
                    <ToolCard tool={t} category={categories[t.category]?.name} rating={ratings.get(t.slug)} />
                  </li>
                ))}
              </ul>
            )}

            <Pager page={page} pages={pages} href={(n) => href({ ...params, page: n })} />

            <section id="suggest" aria-labelledby="suggest-title" className="mx-auto mt-16 max-w-[620px] scroll-mt-24 sm:mt-24">
              <div className="rounded-[28px] bg-surface p-6 sm:p-10">
                <h2 id="suggest-title" className="text-title">
                  Suggest a tool
                </h2>
                <p className="mt-2 mb-6 text-body text-fg-2">
                  Know an AI tool that should be here? Tell us its web address. You need a maavaDao account, so we can
                  keep the list free of spam.
                </p>
                <SuggestTool />
              </div>
            </section>

            <p className="mt-12 text-center text-footnote text-pretty text-fg-2 sm:mt-16">
              Names, descriptions and preview images come from each tool&rsquo;s own site. Prices are written from the
              tool&rsquo;s own pricing page and show when they were checked. Ratings are from maavaDao members.
              Something wrong?{" "}
              <a className="text-link hover:underline" href={`${TOOLS_REPO}/issues/new/choose`}>
                Tell us
              </a>
              . Makers can{" "}
              <a className="text-link hover:underline" href={`${TOOLS_REPO}/issues/new?template=remove-a-listing.yml`}>
                ask to be removed
              </a>
              .
            </p>
          </Reveal>
        )}
      </div>
    </main>
  );
}
