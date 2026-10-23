import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ToolRating } from "@/components/ToolRating";
import { getClaims } from "@/lib/supabase/server";
import { TOOLS_REPO, getTool, priceLabel, toolSourceUrl } from "@/lib/tools";

const number = new Intl.NumberFormat("en-GB");
const PLATFORMS: Record<string, string> = {
  web: "Web",
  ios: "iPhone & iPad",
  android: "Android",
  mac: "Mac",
  windows: "Windows",
  linux: "Linux",
  api: "API",
  "browser-extension": "Browser extension",
  slack: "Slack",
  discord: "Discord",
};

export async function generateMetadata({ params }: PageProps<"/ai-tools/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const found = await getTool(slug);
  if (!found) return { title: "Tool not found" };
  return { title: found.tool.name, description: found.tool.description };
}

async function community(slug: string) {
  const { supabase, claims } = await getClaims();
  const [summary, mine] = await Promise.all([
    supabase.rpc("tool_summary", { slug }).maybeSingle(),
    claims ? supabase.from("tool_ratings").select("score").eq("tool_slug", slug).eq("user_id", claims.sub).maybeSingle() : null,
  ]);
  const s = summary.data as { rating: number | null; ratings: number } | null;
  return {
    rating: s?.rating != null ? Number(s.rating) : null,
    ratings: Number(s?.ratings ?? 0),
    signedIn: !!claims,
    mine: (mine?.data?.score as number | undefined) ?? null,
  };
}

function Fact({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-[20px] bg-bg-alt p-4">
      <dt className="text-footnote text-fg-2">{label}</dt>
      <dd className="mt-1 text-body [overflow-wrap:anywhere]">{children}</dd>
    </div>
  );
}

export default async function ToolPage({ params }: PageProps<"/ai-tools/[slug]">) {
  const { slug } = await params;
  const found = await getTool(slug);
  if (!found) notFound();
  const { tool, category } = found;
  const social = await community(slug).catch(() => null);
  const price = priceLabel(tool);
  const checked = tool.pricing_checked
    ? `checked ${new Date(tool.pricing_checked).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}`
    : tool.pricing_seen
      ? "mentioned on its pricing page; check the page for prices"
      : null;
  const platforms = (tool.platforms ?? []).map((p) => PLATFORMS[p] ?? p);

  return (
    <main className="bg-bg-alt px-4 pt-28 pb-20 sm:px-6 sm:pt-32 sm:pb-28">
      <div className="mx-auto max-w-[880px]">
        <Link href="/ai-tools" className="inline-flex min-h-11 items-center text-callout text-link hover:underline">
          <span aria-hidden="true" className="mr-1">‹</span> AI tools
        </Link>

        <article className="-mx-4 mt-4 bg-surface px-4 py-6 sm:mx-0 sm:rounded-[28px] sm:p-10">
          {tool.image && (
            <div className="mb-6 aspect-[16/9] overflow-hidden rounded-[20px] bg-bg-alt sm:mb-8">
              {/* The tool's own preview image, from its site: hosts vary, so it isn't run through next/image. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={tool.image} alt={`${tool.name} home page preview`} referrerPolicy="no-referrer" className="h-full w-full object-cover" />
            </div>
          )}
          <p className="text-caption font-medium tracking-[0.06em] text-fg-2 uppercase">{category?.name ?? tool.category}</p>
          <h1 className="mt-1.5 font-display text-display text-balance [overflow-wrap:anywhere]">{tool.name}</h1>
          {tool.company && <p className="mt-1 text-body text-fg-2">by {tool.company}</p>}
          <p className="mt-4 text-lede text-pretty [overflow-wrap:anywhere]">{tool.description}</p>
          {tool.tags && tool.tags.length > 0 && (
            <ul className="mt-4 flex flex-wrap gap-2">
              {tool.tags.map((t) => (
                <li key={t}>
                  <Link href={`/ai-tools?q=${encodeURIComponent(t)}`} className="rounded-full bg-bg-alt px-3 py-1 text-footnote text-fg-2 hover:text-fg">
                    {t}
                  </Link>
                </li>
              ))}
            </ul>
          )}
          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href={tool.website}
              target="_blank"
              rel="noreferrer nofollow"
              className="press inline-flex min-h-11 items-center rounded-full bg-cta px-5 text-body font-medium text-white hover:bg-cta-hover"
            >
              Visit website
            </a>
            {tool.pricing_url && (
              <a
                href={tool.pricing_url}
                target="_blank"
                rel="noreferrer nofollow"
                className="press inline-flex min-h-11 items-center rounded-full bg-bg-alt px-5 text-body font-medium text-fg hover:bg-bg"
              >
                Pricing page
              </a>
            )}
            {tool.repository && (
              <a
                href={tool.repository}
                target="_blank"
                rel="noreferrer"
                className="press inline-flex min-h-11 items-center rounded-full bg-bg-alt px-5 text-body font-medium text-fg hover:bg-bg"
              >
                Source code
              </a>
            )}
          </div>

          <section aria-label="Pricing and details" className="mt-10">
            <h2 className="mb-4 text-headline">Pricing and details</h2>
            <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2 [&>div]:min-w-0">
              <Fact label="Pricing">
                {price ?? "Not listed yet"}
                {checked && <span className="mt-0.5 block text-footnote text-fg-2">{checked}</span>}
              </Fact>
              {tool.free_trial && <Fact label="Free trial">Yes</Fact>}
              {tool.education_discount && <Fact label="Schools and students">Free or discounted plan</Fact>}
              {tool.open_source != null && <Fact label="Open source">{tool.open_source ? "Yes" : "No"}</Fact>}
              {platforms.length > 0 && <Fact label="Works on">{platforms.join(", ")}</Fact>}
            </dl>
          </section>

          <section aria-label="Community rating" className="mt-8 grid gap-4 rounded-[24px] bg-bg-alt p-4 sm:grid-cols-[auto_1fr] sm:items-center sm:gap-8 sm:p-6">
            <div className="flex items-center gap-4 sm:flex-col sm:items-start sm:gap-1">
              <p className="font-display text-figure leading-none tabular-nums">{social?.rating != null ? social.rating.toFixed(1) : "–"}</p>
              <p className="text-footnote text-fg-2">
                {social?.ratings ? `${number.format(social.ratings)} member rating${social.ratings === 1 ? "" : "s"}` : "No ratings yet"}
              </p>
            </div>
            <ToolRating slug={slug} mine={social?.mine ?? null} signedIn={social?.signedIn ?? false} />
          </section>

          <p className="mt-8 text-footnote text-pretty text-fg-2">
            The name, description and preview image come from {tool.name}&rsquo;s own site. Ratings are from maavaDao
            members; we don&rsquo;t copy scores from other sites. Something wrong?{" "}
            <a className="text-link hover:underline" href={`${TOOLS_REPO}/issues/new?template=fix-a-listing.yml&title=${encodeURIComponent(`Fix: ${tool.name}`)}`}>
              Tell us
            </a>{" "}
            or{" "}
            <a className="text-link hover:underline" href={toolSourceUrl(tool)}>
              edit this listing
            </a>
            .
          </p>
        </article>
      </div>
    </main>
  );
}
