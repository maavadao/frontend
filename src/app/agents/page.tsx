import type { Metadata } from "next";
import Link from "next/link";
import { Icon, type IconName } from "@/components/Icon";
import { ListingCard } from "@/components/ListingCard";
import { Reveal } from "@/components/Reveal";
import { MAAVA_AGENTS_REPO, getMaavaAgents } from "@/lib/registry";

export const metadata: Metadata = {
  title: "maava agents",
  description:
    "Open-source AI agents for education, built together by the maavaDao community. Free for education; 60% of what an agent earns rewards its contributors and 40% helps children in need.",
};

const steps: { icon: IconName; title: string; body: string }[] = [
  {
    icon: "flag",
    title: "Pick or propose an agent",
    body: "Choose an agent the community wants, or open an issue to propose one that helps people teach, learn, research or inform.",
  },
  {
    icon: "code",
    title: "Build it together",
    body: "Write it in the open with others, in Python with the maava agent SDK. Every pull request is a recorded contribution.",
  },
  {
    icon: "shield",
    title: "Community safety review",
    body: "Reviewers check age suitability, the data it collects and fairness before anything reaches learners.",
  },
  {
    icon: "gift",
    title: "Share it, and share the rewards",
    body: "It's free for schools, teachers and students. When it earns money, 60% rewards its contributors and 40% helps children in need.",
  },
];

export default async function AgentsPage() {
  const agents = await getMaavaAgents();

  return (
    <main className="bg-bg-alt px-4 pt-28 pb-20 sm:px-6 sm:pt-32 sm:pb-28 lg:pb-36">
      <div className="mx-auto max-w-[1100px]">
        <Reveal className="mx-auto max-w-[760px] text-center">
          <p className="text-callout font-semibold text-fg-2 sm:text-body">maava agents</p>
          <h1 className="mt-2 font-display text-display text-balance">Agents we build together.</h1>
          <p className="mt-5 text-lede text-pretty text-fg-2">
            Open-source AI agents for education, written, reviewed and maintained by developers and contributors from
            around the world. Free for schools, colleges, universities, teachers and students.
          </p>
        </Reveal>

        <Reveal delay={100} className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <a
            href={`${MAAVA_AGENTS_REPO}/blob/main/docs/getting-started.md`}
            className="press rounded-full bg-cta px-6 py-3 text-body font-medium text-white hover:bg-cta-hover"
          >
            Start building
          </a>
          <a
            href={MAAVA_AGENTS_REPO}
            className="press rounded-full bg-surface px-6 py-3 text-body font-medium text-fg hover:bg-bg"
          >
            View on GitHub
          </a>
        </Reveal>

        <Reveal delay={150} className="mt-14 grid gap-3 sm:mt-20 sm:grid-cols-2 sm:gap-5">
          <div className="rounded-[28px] bg-surface p-7 sm:p-10">
            <p className="font-display text-hero leading-none text-accent-text">60%</p>
            <p className="mt-4 text-headline">to the contributors</p>
            <p className="mt-2 text-body text-pretty text-fg-2">
              When an agent earns money, 60% rewards the community who built it, split by their contributions
              and decided through maavaDao governance.
            </p>
          </div>
          <div className="rounded-[28px] bg-surface p-7 sm:p-10">
            <p className="font-display text-hero leading-none text-accent-text">40%</p>
            <p className="mt-4 text-headline">to children&rsquo;s education</p>
            <p className="mt-2 text-body text-pretty text-fg-2">
              40% helps children in need: it funds maava&rsquo;s work educating deserving children, orphans and street children. No listing
              fees, no commissions.
            </p>
          </div>
        </Reveal>

        <section aria-labelledby="how" className="mt-16 sm:mt-24">
          <Reveal>
            <h2 id="how" className="text-title">
              How an agent gets built
            </h2>
          </Reveal>
          <ol className="gallery mt-6 sm:grid sm:grid-cols-2 sm:gap-5 lg:grid-cols-4">
            {steps.map((s, i) => (
              <Reveal as="li" key={s.title} delay={i * 70} className="flex h-full flex-col rounded-[28px] bg-surface p-6 sm:p-7">
                <span className="flex h-11 w-11 items-center justify-center rounded-[12px] bg-bg-alt text-cta">
                  <Icon name={s.icon} className="h-6 w-6" />
                </span>
                <p className="mt-5 text-caption font-medium tracking-[0.06em] text-fg-2 uppercase">Step {i + 1}</p>
                <h3 className="mt-1 text-headline">{s.title}</h3>
                <p className="mt-2 text-body text-pretty text-fg-2">{s.body}</p>
              </Reveal>
            ))}
          </ol>
        </section>

        <section aria-labelledby="agents" className="mt-16 sm:mt-24">
          <Reveal className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 id="agents" className="text-title">
                The agents
              </h2>
              <p className="mt-2 text-body text-fg-2">Built so far, and open for anyone to improve.</p>
            </div>
            <a href={`${MAAVA_AGENTS_REPO}/issues/new/choose`} className="group text-body text-link hover:underline">
              Propose an agent
              <span className="ml-1 inline-block transition-transform group-hover:translate-x-1">›</span>
            </a>
          </Reveal>
          {agents.length === 0 ? (
            <Reveal delay={80} className="mt-6 rounded-[28px] bg-surface p-10 text-center sm:p-14">
              <p className="text-headline">The first maava agents are on their way.</p>
              <p className="mt-2 text-body text-fg-2">
                <a className="text-link hover:underline" href={MAAVA_AGENTS_REPO}>
                  Help build them
                </a>
                .
              </p>
            </Reveal>
          ) : (
            <Reveal delay={80} as="ul" className="mt-6 gallery sm:grid sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
              {agents.map((a) => (
                <li key={a.slug}>
                  <ListingCard listing={a} label="maava agent" />
                </li>
              ))}
            </Reveal>
          )}
        </section>

        <Reveal className="mt-16 rounded-[28px] bg-surface p-8 text-center sm:mt-24 sm:p-12">
          <h2 className="text-title">Find people to build with.</h2>
          <p className="mx-auto mt-2 max-w-[560px] text-body text-pretty text-fg-2">
            Meet the developers behind open-source AI, and join the directory so others can find you.
          </p>
          <Link
            href="/developers"
            className="press mt-6 inline-flex min-h-12 items-center rounded-full bg-cta px-6 text-body font-medium text-white hover:bg-cta-hover"
          >
            Meet the developers
          </Link>
        </Reveal>
      </div>
    </main>
  );
}
