import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Avatar } from "@/components/Avatar";
import { Icon } from "@/components/Icon";
import { Reveal } from "@/components/Reveal";
import { countries } from "@/lib/countries";
import {
  HANDLE_RE,
  OPT_OUT_URL,
  getContributors,
  getMember,
  roleLabel,
  type Contributor,
  type Member,
} from "@/lib/developers";
import { formatCount } from "@/lib/registry";
import { getReposIndex } from "@/lib/repos";

const number = new Intl.NumberFormat("en-GB");

async function find(login: string): Promise<{ member: Member | null; contributor: Contributor | null }> {
  if (!HANDLE_RE.test(login)) return { member: null, contributor: null };
  const [member, contributors] = await Promise.all([getMember(login), getContributors()]);
  const key = (member?.github_login ?? login).toLowerCase();
  const contributor = contributors?.developers.find((d) => d.login.toLowerCase() === key) ?? null;
  return { member, contributor };
}

export async function generateMetadata({ params }: PageProps<"/developers/[login]">): Promise<Metadata> {
  const { login } = await params;
  const { member, contributor } = await find(decodeURIComponent(login));
  if (!member && !contributor) return { title: "Developer not found" };
  const name = member?.display_name || member?.username || contributor?.login || login;
  return {
    title: name,
    description: member?.bio || `${name}'s contributions to open-source AI.`,
    // Only members who chose to join are indexed; contributor pages come from public GitHub data.
    robots: member ? undefined : { index: false, follow: true },
  };
}

export default async function DeveloperPage({ params }: PageProps<"/developers/[login]">) {
  const { login: raw } = await params;
  const login = decodeURIComponent(raw);
  const { member, contributor } = await find(login);
  if (!member && !contributor) notFound();

  const repos = await getReposIndex();
  const bySlug = new Map((repos?.repos ?? []).map((r) => [r.slug, r]));
  const github = member?.github_login ?? contributor?.login ?? null;
  const name = member?.display_name || member?.username || contributor?.login || login;
  const country = member?.country ? countries.find((c) => c.code === member.country)?.name : null;
  const facts = [
    member && roleLabel(member.role),
    country,
    member && `Member since ${new Date(member.joined_at).toLocaleDateString("en-GB", { month: "long", year: "numeric" })}`,
  ].filter(Boolean);

  return (
    <main className="bg-bg-alt px-4 pt-28 pb-20 sm:px-6 sm:pt-32 sm:pb-28 lg:pb-36">
      <div className="mx-auto max-w-[860px]">
        <Link href="/developers" className="inline-flex min-h-11 items-center text-callout text-link hover:underline">
          <span aria-hidden="true" className="mr-1">‹</span> Developers
        </Link>

        <Reveal className="mt-4 flex flex-col items-center rounded-[28px] bg-surface p-8 text-center sm:p-12">
          <Avatar id={contributor?.id} login={github} name={name} size={112} />
          <h1 className="mt-5 max-w-full font-display text-display text-balance [overflow-wrap:anywhere]">{name}</h1>
          {github && <p className="mt-1 text-body text-fg-2">@{github}</p>}
          {facts.length > 0 && <p className="mt-3 text-callout text-fg-2">{facts.join(" · ")}</p>}
          {member?.bio && <p className="mt-5 max-w-[560px] text-lede text-pretty">{member.bio}</p>}
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            {github && (
              <a
                href={`https://github.com/${github}`}
                target="_blank"
                rel="noreferrer"
                className="press rounded-full bg-bg-alt px-5 py-2.5 text-callout font-medium text-fg hover:bg-bg"
              >
                GitHub
              </a>
            )}
            {member?.website && (
              <a
                href={member.website}
                target="_blank"
                rel="noreferrer nofollow"
                className="press rounded-full bg-bg-alt px-5 py-2.5 text-callout font-medium text-fg hover:bg-bg"
              >
                Website
              </a>
            )}
          </div>
          {contributor && (
            <div className="mt-8 grid w-full max-w-[420px] grid-cols-2 gap-3">
              <div className="rounded-[20px] bg-bg-alt p-4">
                <p className="text-figure tabular-nums">{contributor.repos.length}</p>
                <p className="text-footnote text-fg-2">{contributor.repos.length === 1 ? "project" : "projects"}</p>
              </div>
              <div className="rounded-[20px] bg-bg-alt p-4">
                <p className="text-figure tabular-nums">{formatCount(contributor.total)}</p>
                <p className="text-footnote text-fg-2">commits</p>
              </div>
            </div>
          )}
        </Reveal>

        {contributor && (
          <section aria-labelledby="contributes" className="mt-12 sm:mt-16">
            <Reveal>
              <h2 id="contributes" className="text-title">
                Contributes to
              </h2>
              <p className="mt-2 text-body text-fg-2">Among the most-starred open-source AI repos, by commits.</p>
            </Reveal>
            <Reveal delay={80} as="ul" className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-5 [&>li]:min-w-0">
              {contributor.repos.map(([slug, commits]) => {
                const repo = bySlug.get(slug);
                return (
                  <li key={slug}>
                    <a
                      href={repo?.repository ?? `/repos?q=${encodeURIComponent(slug)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="press group flex h-full flex-col rounded-[24px] bg-surface p-5 sm:p-6 motion-safe:hover:-translate-y-1 hover:shadow-[0_20px_50px_-20px_rgb(0_0_0/0.25)]"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="min-w-0 text-headline [overflow-wrap:anywhere]">{repo?.name ?? slug}</h3>
                        {repo?.stars != null && (
                          <span className="flex shrink-0 items-center gap-1 text-caption text-fg-2">
                            <Icon name="star" className="h-3.5 w-3.5" />
                            <span className="sr-only">Stars:</span>
                            {formatCount(repo.stars)}
                          </span>
                        )}
                      </div>
                      {repo && <p className="mt-2 line-clamp-2 flex-1 text-body [overflow-wrap:anywhere] text-fg-2">{repo.description}</p>}
                      <p className="mt-4 text-footnote text-fg-2">
                        {number.format(commits)} {commits === 1 ? "commit" : "commits"}
                      </p>
                    </a>
                  </li>
                );
              })}
            </Reveal>
          </section>
        )}

        {!member && (
          <p className="mt-12 text-center text-footnote text-pretty text-fg-2 sm:mt-16">
            This page shows public GitHub data only. Is this you?{" "}
            <Link className="text-link hover:underline" href="/developers/join">
              Join maavaDao
            </Link>{" "}
            to add a bio, or{" "}
            <a className="text-link hover:underline" href={OPT_OUT_URL}>
              ask to be removed
            </a>
            .
          </p>
        )}
      </div>
    </main>
  );
}
