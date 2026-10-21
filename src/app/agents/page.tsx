import type { Metadata } from "next";
import Link from "next/link";
import { Icon, type IconName } from "@/components/Icon";
import { ListingCard } from "@/components/ListingCard";
import { Reveal } from "@/components/Reveal";
import { MAAVA_AGENTS_REPO, getMaavaAgents } from "@/lib/registry";

export const metadata: Metadata = {
  title: "maava Community Agents",
  description:
    "A fully open-source suite of AI agents for sales, marketing and growth, built on open-source AI libraries that anyone can inspect, fork and improve.",
};

const pillars: { icon: IconName; title: string; body: string }[] = [
  {
    icon: "layers",
    title: "Built on proven open source",
    body: "We're not building from scratch. We stand on the shoulders of the most proven, community-validated open-source agent repositories on GitHub: thousands of stars, hundreds of contributors, battle-tested prompts and workflows. We take what the community has already built, refined and stress-tested, and make it work for you.",
  },
  {
    icon: "briefcase",
    title: "Customised for you",
    body: "We customise every open-source agent for your specific use case. No generic templates. No one-size-fits-all prompts. Each agent is tailored to your industry, your pipeline, your voice and your revenue targets, so it doesn't just work, it works for you.",
  },
];

const steps: { icon: IconName; title: string; body: string }[] = [
  {
    icon: "code",
    title: "Developers contribute",
    body: "Developers contribute new agents, prompts and workflows, in the open, where anyone can inspect, fork and improve them.",
  },
  {
    icon: "store",
    title: "Businesses deploy",
    body: "Businesses deploy customised agents to run real revenue operations: prospecting, closing, retention and beyond.",
  },
  {
    icon: "gift",
    title: "Revenue flows back",
    body: "When a business puts a maava agent to work and it earns, a share of that revenue flows back to the ecosystem.",
  },
];

export default async function AgentsPage() {
  const agents = await getMaavaAgents();

  return (
    <main className="bg-bg-alt px-4 pt-28 pb-20 sm:px-6 sm:pt-32 sm:pb-28 lg:pb-36">
      <div className="mx-auto max-w-[1100px]">
        <Reveal className="mx-auto max-w-[760px] text-center">
          <p className="text-callout font-semibold text-fg-2 sm:text-body">maava Community Agents</p>
          <h1 className="mt-2 font-display text-display text-balance">Open-source agents for sales, marketing and growth.</h1>
          <p className="mt-5 text-lede text-pretty text-fg-2">
            maava Community Agents is a fully open-source suite of AI agents for sales, marketing and growth, built on
            top of open-source AI libraries that anyone can inspect, fork and improve.
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

        <div className="mt-14 grid gap-3 sm:mt-20 sm:grid-cols-2 sm:gap-5">
          {pillars.map((p, i) => (
            <Reveal key={p.title} delay={150 + i * 70} className="rounded-[28px] bg-surface p-7 sm:p-10">
              <span className="flex h-11 w-11 items-center justify-center rounded-[12px] bg-bg-alt text-cta">
                <Icon name={p.icon} className="h-6 w-6" />
              </span>
              <h2 className="mt-5 text-title">{p.title}</h2>
              <p className="mt-2 text-body text-pretty text-fg-2">{p.body}</p>
            </Reveal>
          ))}
        </div>

        <section aria-labelledby="how" className="mt-16 sm:mt-24">
          <Reveal>
            <h2 id="how" className="text-title">
              How it works
            </h2>
          </Reveal>
          <ol className="gallery mt-6 sm:grid sm:grid-cols-3 sm:gap-5">
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

        <section aria-labelledby="share" className="mt-16 sm:mt-24">
          <Reveal>
            <h2 id="share" className="text-title">
              Where the revenue goes
            </h2>
          </Reveal>
          <Reveal delay={80} className="mt-6 grid gap-3 sm:grid-cols-2 sm:gap-5">
            <div className="rounded-[28px] bg-surface p-7 sm:p-10">
              <p className="font-display text-hero leading-none text-accent-text">40%</p>
              <p className="mt-4 text-headline">Maava Charity</p>
              <p className="mt-2 text-body text-pretty text-fg-2">
                Funding the mission: educating deserving children, orphans and street children.
              </p>
            </div>
            <div className="rounded-[28px] bg-surface p-7 sm:p-10">
              <p className="font-display text-hero leading-none text-accent-text">60%</p>
              <p className="mt-4 text-headline">The developer community</p>
              <p className="mt-2 text-body text-pretty text-fg-2">
                Rewarding the people who built it, split by their contributions and decided through maavaDao governance.
              </p>
            </div>
          </Reveal>
          <Reveal delay={120} className="mx-auto mt-10 max-w-[760px] text-center sm:mt-14">
            <p className="font-display text-subhead font-semibold text-balance sm:text-title">
              No middlemen. No SaaS lock-in.
            </p>
            <p className="mt-3 text-lede text-pretty text-fg-2">
              Just open code, real revenue, and a circular economy where the people who build get paid, and the proceeds
              do good.
            </p>
          </Reveal>
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
              <p className="text-headline">The first maava Community Agents are on their way.</p>
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
                  <ListingCard listing={a} label="Community agent" />
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
