import type { Metadata } from "next";
import Link from "next/link";
import { Avatar } from "@/components/Avatar";
import { IdeaActions, IdeaForm, VoteButton } from "@/components/IdeaBoard";
import { Reveal } from "@/components/Reveal";
import { timeAgo } from "@/lib/repos";
import { getClaims } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Vote",
  description:
    "Post an idea for a project the maavaDao community could build, and vote for the ideas you want built next.",
};

type Idea = {
  id: number;
  user_id: string;
  username: string;
  github_login: string | null;
  title: string;
  body: string;
  status: string;
  created_at: string;
  edited_at: string | null;
  votes: number;
};

const STATUS: Record<string, { label: string; className: string }> = {
  planned: { label: "Planned", className: "bg-[#0a84ff]/12 text-[#0a64d6] dark:text-[#64aaff]" },
  building: { label: "Being built", className: "bg-[#ff9f0a]/15 text-[#b25f00] dark:text-[#ffb340]" },
  built: { label: "Built", className: "bg-[#34c759]/15 text-[#1d7a35] dark:text-[#4cd964]" },
  declined: { label: "Not taken forward", className: "bg-fg/8 text-fg-2" },
};

const SORTS = [
  { id: "top", label: "Most votes" },
  { id: "new", label: "Newest" },
] as const;

async function board() {
  const { supabase, claims } = await getClaims();
  const [ideas, mine, profile] = await Promise.all([
    supabase.rpc("project_ideas_ranked"),
    claims ? supabase.from("project_idea_votes").select("idea_id").eq("user_id", claims.sub) : null,
    claims ? supabase.from("profiles").select("id").eq("id", claims.sub).maybeSingle() : null,
  ]);
  return {
    ideas: (ideas.data as Idea[] | null) ?? [],
    voted: new Set(((mine?.data as { idea_id: number }[] | null) ?? []).map((v) => v.idea_id)),
    userId: claims?.sub ?? null,
    hasProfile: !!profile?.data,
  };
}

export default async function VotePage({ searchParams }: PageProps<"/vote">) {
  const { sort } = await searchParams;
  const newest = sort === "new";
  const data = await board().catch(() => null);
  const ideas = [...(data?.ideas ?? [])];
  if (newest) ideas.sort((a, b) => b.created_at.localeCompare(a.created_at));
  const signedIn = !!data?.userId;

  return (
    <main className="bg-bg-alt px-4 pt-28 pb-20 sm:px-6 sm:pt-32 sm:pb-28 lg:pb-36">
      <div className="mx-auto max-w-[760px]">
        <Reveal className="text-center">
          <p className="text-callout font-semibold text-fg-2 sm:text-body">Vote</p>
          <h1 className="mt-2 font-display text-display text-balance">You decide what we build next.</h1>
          <p className="mt-5 text-lede text-pretty text-fg-2">
            Share an idea for a project the community could build, and vote for the ideas you want to see. The ideas
            with the most votes go to the DAO first.
          </p>
        </Reveal>

        <Reveal delay={100} className="mt-10 rounded-[28px] bg-surface p-6 sm:mt-14 sm:p-8">
          <h2 className="text-title">Post an idea</h2>
          <div className="mt-4">
            {signedIn && data?.hasProfile ? (
              <IdeaForm />
            ) : signedIn ? (
              <p className="text-body text-fg-2">
                <Link className="text-link hover:underline" href={`/onboarding?next=${encodeURIComponent("/vote")}`}>
                  Finish setting up your profile
                </Link>{" "}
                to post ideas and vote.
              </p>
            ) : (
              <p className="text-body text-fg-2">
                <Link className="text-link hover:underline" href={`/login?next=${encodeURIComponent("/vote")}`}>
                  Sign in
                </Link>{" "}
                to post ideas and vote. Anyone can read them.
              </p>
            )}
          </div>
        </Reveal>

        <section aria-labelledby="ideas" className="mt-12 sm:mt-16">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 id="ideas" className="text-title">
              Ideas
            </h2>
            <nav aria-label="Sort ideas" className="flex gap-1 rounded-full bg-surface p-1">
              {SORTS.map((s) => {
                const active = (s.id === "new") === newest;
                return (
                  <Link
                    key={s.id}
                    href={s.id === "new" ? "/vote?sort=new" : "/vote"}
                    aria-current={active ? "page" : undefined}
                    scroll={false}
                    className={`press flex min-h-11 items-center rounded-full px-4 text-callout sm:min-h-9 ${
                      active ? "bg-fg text-bg" : "text-fg-2 hover:text-fg"
                    }`}
                  >
                    {s.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          {!data ? (
            <p className="mt-6 rounded-[28px] bg-surface p-10 text-center text-body text-fg-2">
              We couldn&rsquo;t load the ideas just now. Please try again in a moment.
            </p>
          ) : ideas.length === 0 ? (
            <p className="mt-6 rounded-[28px] bg-surface p-10 text-center text-body text-fg-2">
              No ideas yet. Be the first to share one.
            </p>
          ) : (
            <ol className="mt-6 grid gap-3">
              {ideas.map((idea) => {
                const status = STATUS[idea.status];
                return (
                  <li key={idea.id} className="flex gap-4 rounded-[28px] bg-surface p-5 sm:gap-5 sm:p-6">
                    <VoteButton id={idea.id} votes={Number(idea.votes)} voted={data.voted.has(idea.id)} signedIn={signedIn} />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-headline [overflow-wrap:anywhere]">{idea.title}</h3>
                        {status && (
                          <span className={`rounded-full px-2.5 py-0.5 text-caption font-medium ${status.className}`}>{status.label}</span>
                        )}
                      </div>
                      <p className="mt-1.5 text-body whitespace-pre-line text-fg-2 [overflow-wrap:anywhere]">{idea.body}</p>
                      <div className="mt-3 flex flex-wrap items-center gap-x-2">
                        <Avatar login={idea.github_login} name={idea.username} size={24} />
                        <p className="text-footnote text-fg-2">
                          <span className="font-medium text-fg">{idea.username}</span> · {timeAgo(idea.created_at)}
                          {idea.edited_at ? " · edited" : ""}
                        </p>
                        <div className="-my-2 ml-auto">
                          <IdeaActions id={idea.id} own={idea.user_id === data.userId} signedIn={signedIn} />
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ol>
          )}
        </section>
      </div>
    </main>
  );
}
