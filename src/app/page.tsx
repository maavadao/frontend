import type { ReactNode } from "react";
import Link from "next/link";
import { Reveal } from "@/components/Reveal";
import { LogoMark } from "@/components/Logo";
import { Icon, type IconName } from "@/components/Icon";
import { CommunityProjects } from "@/components/CommunityProjects";
import { ContactForm } from "@/components/ContactForm";
import { hasEmail, site } from "@/lib/site";

function SectionHead({ eyebrow, title, lede }: { eyebrow: string; title: ReactNode; lede?: string }) {
  return (
    <Reveal className="mx-auto mb-10 max-w-[760px] text-center sm:mb-14">
      <p className="text-callout font-semibold text-fg-2 sm:text-body">{eyebrow}</p>
      <h2 className="mt-2 font-display text-display text-balance">{title}</h2>
      {lede && <p className="mt-5 text-lede text-pretty text-fg-2">{lede}</p>}
    </Reveal>
  );
}

const steps = [
  ["Create and list, free", "Anyone can build an AI agent and list it on the maava Marketplace. There is no charge to list, create or publish anything, ever."],
  ["Propose a project", "Any community member can propose a new product: an AI science tutor, a research agent for content creators, a clinical-skills trainer."],
  ["The DAO votes", "The community votes on proposals, and approved projects get the backing of the community."],
  ["Build together", "Developers, educators, designers, translators and subject experts contribute. Every contribution is recorded transparently on the blockchain."],
  ["Share the rewards", "When a product is monetised, 60% of the revenue goes to the contributors who built it, and 40% funds education for deserving children."],
];

const features: { icon: IconName; title: string; body: string; className?: string; feature?: boolean }[] = [
  {
    icon: "store",
    title: "Open agent marketplace",
    body: "Developers list and share agents for free. No listing fees, no creation fees and no commissions.",
    className: "lg:col-span-2",
    feature: true,
  },
  {
    icon: "chain",
    title: "Blockchain-linked agents",
    body: "Every agent has an on-chain identity: its author, version history, review status and usage.",
  },
  {
    icon: "gift",
    title: "60% to the contributors",
    body: "When a product is monetised, revenue is split automatically: 60% to the community who built it, enforced in code by the blockchain, not left to promises.",
  },
  {
    icon: "people",
    title: "Shared ownership",
    body: "Contributors become co-owners of the platform with a voice in its direction, not users of someone else's product.",
  },
  {
    icon: "layers",
    title: "DAO governance",
    body: "Any member can propose a project. The community votes on it through the DAO, at local, country and community level.",
  },
  {
    icon: "signal",
    title: "Built for low-resource settings",
    body: "Agents work on low-cost devices and limited bandwidth, and in local languages wherever possible.",
    className: "sm:col-span-2 lg:col-span-3",
  },
];

const levels = [
  {
    level: "Local",
    who: "Schools, orphanages, teachers, parents and local organisations",
    decides: ["Which agents are used locally", "Local content and language needs", "How local rewards are allocated"],
  },
  {
    level: "Country",
    who: "National chapters, education partners and regional contributors",
    decides: ["Country-specific safety and curriculum standards", "Compliance with national law", "Regional priorities"],
  },
  {
    level: "Global community",
    who: "All contributors and members",
    decides: ["Platform-wide standards", "Responsible AI policy", "Treasury and reward rules", "The roadmap"],
  },
];

const safety: { icon: IconName; title: string; body: string }[] = [
  {
    icon: "shield",
    title: "Safeguarding by design",
    body: "Agents used with children must meet maavaDao's safeguarding and content standards before listing.",
  },
  {
    icon: "lock",
    title: "Privacy",
    body: "Learners' data, especially children's, is minimised, protected and never sold.",
  },
  {
    icon: "eye",
    title: "Accuracy",
    body: "Educational content, especially in subjects like medicine, is reviewed by qualified educators or experts.",
  },
  {
    icon: "scale",
    title: "Responsible content",
    body: "Agents used for content creation must support accurate, informative and respectful publishing.",
  },
  {
    icon: "hand",
    title: "Inclusion",
    body: "Agents should work across languages, abilities, low-cost devices and low-bandwidth connections.",
  },
];

const audiences: { icon: IconName; who: string; body: string }[] = [
  {
    icon: "code",
    who: "AI developers",
    body: "List agents for free on the maava Marketplace, contribute to community projects, and earn from what you help build.",
  },
  {
    icon: "signal",
    who: "Content creators",
    body: "Use maava agents to research freely, create informative and educational content, and publish it across social media.",
  },
  {
    icon: "school",
    who: "Schools, colleges and universities",
    body: "Access AI agents for teaching, tutoring, assessment and learner support.",
  },
  {
    icon: "people",
    who: "Teachers and student teachers",
    body: "Use agents to plan lessons, create materials and support every learner in the classroom.",
  },
  {
    icon: "layers",
    who: "Students",
    body: "Learn with AI tutors and study tools in any subject, at your own pace.",
  },
];

const phases = [
  ["Foundation", "Open-source repository, contributor guidelines and safeguarding standards."],
  ["maava Marketplace", "Free agent listing and discovery for educators, students and content creators."],
  ["DAO governance", "Project proposals and community voting at local, country and community level."],
  ["Maava School for AI", "AI education for deserving children, building on maava's two existing schools."],
  ["Community token", "Launch of the maavaDao token, with 75% distributed to developers, contributors and the wider community."],
];

const ways = [
  "Build or improve AI agents for education and content creation, or propose your own project",
  "Use maava agents to research and create, and share what works",
  "Tell us what your learners need and help review agents",
  "Review agents for safety, quality and bias",
  "Translate agents and learning content into local languages",
  "Take part in governance and help shape policy",
];

export default function Home() {
  return (
    <main>
      {/* Hero */}
      <section className="relative flex min-h-svh items-center overflow-hidden bg-bg text-fg">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          <div className="animate-glow absolute top-[8%] left-1/2 h-[620px] w-[620px] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,var(--glow-violet),transparent)] blur-2xl" />
          <div className="animate-glow absolute right-[-10%] bottom-[-20%] h-[520px] w-[520px] rounded-full bg-[radial-gradient(closest-side,var(--glow-ember),transparent)] blur-2xl [animation-delay:200ms]" />
          <div className="absolute inset-0 bg-[radial-gradient(var(--grid-dot)_1px,transparent_1px)] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)] [background-size:28px_28px]" />
        </div>

        <div className="relative mx-auto w-full max-w-[1024px] px-4 pt-24 pb-20 text-center sm:px-6 sm:pt-28 sm:pb-24">
          <Reveal>
            <LogoMark className="mx-auto h-16 w-16 drop-shadow-[0_20px_50px_var(--glow-violet)] sm:h-24 sm:w-24" />
          </Reveal>
          <Reveal delay={100}>
            <p className="mt-6 text-caption font-medium tracking-[0.16em] whitespace-nowrap text-fg-2 uppercase max-[360px]:text-[0.6875rem] max-[360px]:tracking-[0.08em] sm:mt-8 sm:text-footnote sm:tracking-[0.25em]">
              Agentic&nbsp;AI&nbsp;&nbsp;·&nbsp;&nbsp;Community-owned&nbsp;&nbsp;·&nbsp;&nbsp;DAO
            </p>
          </Reveal>
          <Reveal delay={200}>
            <h1 className="mt-5 font-display text-hero text-balance">
              Agentic AI.
              <br />
              <span className="inline-block text-brand text-balance">Owned by all of us.</span>
            </h1>
          </Reveal>
          <Reveal delay={300}>
            <p className="mx-auto mt-5 max-w-[42rem] text-lede text-pretty text-fg-2 sm:mt-7">{site.tagline}</p>
          </Reveal>
          <Reveal delay={400} className="mt-8 flex flex-wrap items-center justify-center gap-x-8 gap-y-4 sm:mt-10">
            <Link href="/signup" className="press rounded-full bg-cta px-7 py-3.5 text-body font-medium text-white hover:bg-cta-hover">
              Join maavaDao
            </Link>
            <Link href="/#how-it-works" className="group text-body text-link hover:underline">
              See how it works
              <span className="ml-1 inline-block transition-transform group-hover:translate-x-1">›</span>
            </Link>
          </Reveal>
          <Reveal delay={500} className="mt-8 sm:mt-10">
            <Link
              href="/#impact"
              className="press inline-flex min-h-11 items-center gap-2.5 rounded-full border border-fg/12 bg-surface/70 px-4 text-footnote whitespace-nowrap text-fg-2 backdrop-blur-md hover:text-fg sm:text-callout"
            >
              <span aria-hidden="true" className="h-2 w-2 shrink-0 rounded-full bg-gradient-to-br from-gold to-ember" />
              <span>
                Already running 2 schools<span className="hidden sm:inline"> for deserving children</span>
              </span>
              <span aria-hidden="true">›</span>
            </Link>
          </Reveal>
        </div>

        <a
          href="#why"
          aria-label="Scroll to learn more"
          className="absolute bottom-8 left-1/2 hidden h-10 w-6 -translate-x-1/2 justify-center rounded-full border border-fg/25 pt-2 [@media(min-height:700px)]:flex"
        >
          <span className="h-2 w-1 rounded-full bg-fg/50 motion-safe:animate-bounce" />
        </a>
      </section>

      {/* Why this exists + mission */}
      <section id="why" className="bg-bg px-4 py-20 sm:px-6 sm:py-28 lg:py-36">
        <Reveal className="mx-auto max-w-[900px] text-center">
          <p className="font-display text-statement text-balance">
            Open-source developers give their expertise away for nothing, and commercial marketplaces can take up to 30% of what creators earn.{" "}
            <span className="text-fg-2">
              Meanwhile, quality education is still out of reach for millions of children. maavaDao turns this around.
            </span>
          </p>
        </Reveal>

        <dl className="mx-auto mt-12 grid max-w-[900px] grid-cols-2 gap-x-4 gap-y-8 text-center sm:mt-20 sm:grid-cols-4 sm:gap-y-10">
          {[
            ["Free", "to create, list and use"],
            ["60%", "to contributors"],
            ["40%", "to children's education"],
            ["0%", "commission, ever"],
          ].map(([value, label], i) => (
            <Reveal key={label} delay={i * 80}>
              <dt className="sr-only">{label}</dt>
              <dd>
                <span className="block font-display text-figure">{value}</span>
                <span className="mt-2 block text-footnote text-balance text-fg-2 sm:text-callout">{label}</span>
              </dd>
            </Reveal>
          ))}
        </dl>

        <Reveal className="mx-auto mt-14 max-w-[900px] rounded-[28px] bg-gradient-to-br from-[#0f0c29] via-[#24243e] to-[#302b63] px-6 py-10 text-center text-[#f5f5f7] sm:mt-24 sm:px-16 sm:py-16">
          <p className="text-callout font-semibold text-gold sm:text-body">Our mission</p>
          <p className="mt-3 font-display text-subhead font-semibold text-balance sm:mt-4 sm:text-title">{site.mission}</p>
        </Reveal>

        {/* Rows are shared (subgrid) so the eyebrow, headline and body line up across both cards. */}
        <div id="impact" className="mx-auto mt-4 grid max-w-[900px] scroll-mt-20 gap-4 sm:mt-5 sm:grid-cols-2 sm:gap-5">
          <Reveal className="flex flex-col gap-3 rounded-[28px] bg-bg-alt px-7 py-8 sm:row-span-3 sm:grid sm:grid-rows-subgrid sm:p-10">
            <p className="text-footnote font-semibold tracking-[0.06em] text-accent-text uppercase">Already running</p>
            <p className="font-display text-figure leading-none sm:self-end">
              <span className="text-brand">2 schools</span>
            </p>
            <p className="text-body text-fg-2">
              maava already runs two schools for deserving children. maavaDao extends that mission into the age of AI.
            </p>
          </Reveal>
          <Reveal delay={90} className="flex flex-col gap-3 rounded-[28px] bg-bg-alt px-7 py-8 sm:row-span-3 sm:grid sm:grid-rows-subgrid sm:p-10">
            <p className="text-footnote font-semibold tracking-[0.06em] text-fg-2 uppercase">Next</p>
            <h3 className="font-display text-title sm:self-end">Maava School for AI</h3>
            <p className="text-body text-fg-2">
              Teaching deserving children, orphans and street children to learn with, use and build AI. Every product
              monetised on maavaDao helps fund it.
            </p>
          </Reveal>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="bg-bg-alt px-4 py-16 sm:px-6 sm:py-24 lg:py-32">
        <div className="mx-auto max-w-[1100px]">
          <SectionHead
            eyebrow="How it works"
            title={
              <>
                Built by developers.
                <br />
                <span className="text-brand">Free for every learner.</span>
              </>
            }
            lede="Developers build and list agents, free. Educators, students and content creators use them to teach, learn, research and inform. When a product earns money, the community shares in it."
          />
          {/* Five steps: three across, then two, so neither row is left with a gap. */}
          <ol className="gallery sm:grid sm:grid-cols-2 sm:gap-5 lg:grid-cols-6">
            {steps.map(([title, body], i) => (
              <Reveal
                as="li"
                key={title}
                delay={(i % 3) * 90}
                className={`rounded-[28px] bg-surface p-7 sm:p-8 ${i < 3 ? "lg:col-span-2" : "lg:col-span-3"} ${
                  i === steps.length - 1 ? "sm:col-span-2" : ""
                }`}
              >
                <span className="font-display text-figure text-brand">{i + 1}</span>
                <h3 className="mt-4 text-headline sm:mt-6">{title}</h3>
                <p className="mt-2 text-body text-fg-2">{body}</p>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* Key features */}
      <section id="features" className="bg-bg px-4 py-16 sm:px-6 sm:py-24 lg:py-32">
        <div className="mx-auto max-w-[1100px]">
          <SectionHead eyebrow="Key features" title="Accountability built in, not bolted on." />
          <div className="gallery sm:grid sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
            {features.map((f, i) => (
              <Reveal
                key={f.title}
                delay={(i % 3) * 90}
                className={`flex flex-col rounded-[28px] p-7 sm:p-10 ${f.className ?? ""} ${
                  f.feature ? "bg-gradient-to-br from-[#0f0c29] via-[#24243e] to-[#302b63] text-[#f5f5f7]" : "bg-bg-alt"
                }`}
              >
                <span className={f.feature ? "text-gold" : "text-ember"}>
                  <Icon name={f.icon} className="h-8 w-8 sm:h-9 sm:w-9" />
                </span>
                <div className="mt-8 sm:mt-10">
                  <h3 className="font-display text-title">{f.title}</h3>
                  <p className={`mt-3 max-w-[40rem] text-body ${f.feature ? "text-[#c7c7cc]" : "text-fg-2"}`}>{f.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Community projects */}
      <section id="projects" className="bg-bg-alt px-4 py-16 sm:px-6 sm:py-24 lg:py-32">
        <div className="mx-auto max-w-[1100px]">
          <SectionHead
            eyebrow="Projects"
            title="Built by the community."
            lede="Agents we write together in the open, and the latest that developers have listed in the marketplace. Free for education."
          />
          <CommunityProjects />
        </div>
      </section>

      {/* Governance */}
      <section id="governance" className="bg-bg px-4 py-16 sm:px-6 sm:py-24 lg:py-32">
        <div className="mx-auto max-w-[1100px]">
          <SectionHead
            eyebrow="Governance"
            title="Decisions made close to the people they affect."
            lede="maavaDao combines the principles of a decentralised autonomous organisation with AI. Proposals, votes and outcomes are recorded on-chain, so every decision can be traced and audited."
          />
          <div className="gallery sm:grid sm:gap-5 lg:grid-cols-3">
            {levels.map((l, i) => (
              <Reveal key={l.level} delay={i * 110} className="rounded-[28px] bg-bg-alt p-7 sm:p-8">
                <p className="text-footnote font-semibold tracking-[0.06em] text-accent-text uppercase">Level {i + 1}</p>
                <h3 className="mt-2 font-display text-title">{l.level}</h3>
                <p className="mt-3 text-callout text-fg-2">{l.who}</p>
                <p className="mt-6 text-footnote font-semibold tracking-[0.06em] text-fg-2 uppercase">Decides</p>
                <ul className="mt-3 space-y-2">
                  {l.decides.map((d) => (
                    <li key={d} className="flex gap-3 text-body">
                      <span aria-hidden="true" className="mt-[0.6em] h-1.5 w-1.5 shrink-0 rounded-full bg-gradient-to-br from-gold to-ember" />
                      {d}
                    </li>
                  ))}
                </ul>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Responsible AI and child safety */}
      <section id="safety" className="bg-bg-alt px-4 py-16 sm:px-6 sm:py-24 lg:py-32">
        <div className="mx-auto max-w-[1100px]">
          <SectionHead
            eyebrow="Responsible AI and safeguarding"
            title="Because it serves children and young people, safety comes first."
            lede="Every agent listed on maavaDao must meet these standards."
          />
          <div className="grid gap-x-10 gap-y-8 sm:grid-cols-2 sm:gap-y-12 lg:grid-cols-6">
            {safety.map((s, i) => (
              <Reveal
                key={s.title}
                delay={(i % 3) * 90}
                className={`grid grid-cols-[auto_1fr] gap-x-4 sm:block ${i < 3 ? "lg:col-span-2" : "lg:col-span-3"} ${
                  i === safety.length - 1 ? "sm:col-span-2" : ""
                }`}
              >
                <span className="row-span-2 flex h-11 w-11 items-center justify-center rounded-[12px] bg-surface text-cta sm:h-12 sm:w-12 sm:rounded-[14px]">
                  <Icon name={s.icon} className="h-6 w-6" />
                </span>
                <h3 className="self-center text-headline sm:mt-5">{s.title}</h3>
                <p className="mt-1 text-body text-fg-2 sm:mt-2">{s.body}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Who it is for */}
      <section id="who" className="bg-bg px-4 py-16 sm:px-6 sm:py-24 lg:py-32">
        <div className="mx-auto max-w-[1100px]">
          <SectionHead eyebrow="Who it is for" title="A place for everyone who wants to help." />
          {/* People who build (two wide), then people who learn and teach (three across). */}
          <div className="grid gap-3 sm:grid-cols-2 sm:gap-5 lg:grid-cols-6">
            {audiences.map((a, i) => (
              <Reveal
                key={a.who}
                delay={(i % 3) * 90}
                className={`flex gap-4 rounded-[24px] bg-bg-alt p-6 sm:gap-6 sm:rounded-[28px] sm:p-8 ${
                  i < 2 ? "lg:col-span-3" : "lg:col-span-2"
                } ${i === audiences.length - 1 ? "sm:col-span-2" : ""}`}
              >
                <span className="text-ember">
                  <Icon name={a.icon} className="h-7 w-7 sm:h-8 sm:w-8" />
                </span>
                <div>
                  <h3 className="text-headline">{a.who}</h3>
                  <p className="mt-2 text-body text-fg-2">{a.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Roadmap */}
      <section id="roadmap" className="bg-bg-alt px-4 py-16 sm:px-6 sm:py-24 lg:py-32">
        <div className="mx-auto max-w-[1100px]">
          <SectionHead
            eyebrow="Roadmap"
            title="What we're planning."
            lede="maavaDao is in its early stage. Here is the path from first agents to verifiable impact."
          />
          <ol className="relative grid gap-8 lg:grid-cols-5 lg:gap-6">
            <span
              aria-hidden="true"
              className="absolute top-7 right-[10%] left-[10%] hidden h-px bg-gradient-to-r from-gold via-ember to-violet lg:block"
            />

            {phases.map(([title, body], i) => (
              <Reveal
                as="li"
                key={title}
                delay={i * 100}
                className="relative lg:row-span-2 lg:grid lg:grid-rows-subgrid lg:gap-y-3 lg:text-center"
              >
                {i < phases.length - 1 && (
                  <span
                    aria-hidden="true"
                    className="absolute top-12 -bottom-8 left-6 w-px bg-gradient-to-b from-gold to-ember lg:hidden"
                  />
                )}
                <div className="flex items-center gap-4 lg:block">
                  <span className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-line bg-surface font-display text-callout font-semibold text-accent-text lg:mx-auto lg:h-14 lg:w-14">
                    {i + 1}
                  </span>
                  <div className="lg:mt-6">
                    <p className="text-footnote font-semibold tracking-[0.06em] text-fg-2 uppercase">Phase {i + 1}</p>
                    <h3 className="text-headline text-balance">{title}</h3>
                  </div>
                </div>
                <p className="mt-2 pl-16 text-callout text-fg-2 lg:mx-auto lg:mt-0 lg:max-w-[13rem] lg:pl-0">{body}</p>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* Get involved */}
      <section id="contact" className="bg-bg px-4 py-16 sm:px-6 sm:py-24 lg:py-32">
        <div className="mx-auto grid max-w-[1100px] gap-10 lg:grid-cols-[1fr_1.2fr] lg:gap-20">
          <Reveal>
            <p className="text-callout font-semibold text-fg-2 sm:text-body">Get involved</p>
            <h2 className="mt-2 font-display text-display">
              Help us reach
              <br />
              <span className="text-brand">every child.</span>
            </h2>
            <p className="mt-5 max-w-[28rem] text-lede text-pretty text-fg-2">
              We are looking for founding contributors, education partners and pilot communities. Not every way to help
              involves code.
            </p>
            <ul className="mt-8 space-y-3">
              {ways.map((w) => (
                <li key={w} className="flex gap-3 text-body">
                  <span aria-hidden="true" className="mt-[0.6em] h-1.5 w-1.5 shrink-0 rounded-full bg-gradient-to-br from-gold to-ember" />
                  {w}
                </li>
              ))}
            </ul>
            <ul className="mt-8 space-y-1 text-body sm:mt-10">
              {[
                ["GitHub", site.links.github, "github.com/maavadao"],
                ["Discord", site.links.discord, "Join the conversation"],
                ["Email", hasEmail ? `mailto:${site.email}` : null, site.email],
              ].map(([label, href, text]) => (
                <li key={label} className="flex min-h-11 items-center gap-4">
                  <span className="w-20 shrink-0 text-fg-2">{label}</span>
                  {href ? (
                    <a href={href} className="text-link hover:underline" target={href.startsWith("http") ? "_blank" : undefined} rel="noreferrer">
                      {text}
                    </a>
                  ) : (
                    <span className="text-fg-2">{text}</span>
                  )}
                </li>
              ))}
            </ul>
          </Reveal>
          <Reveal delay={120} className="-mx-4 self-start bg-bg-alt px-4 py-8 sm:mx-0 sm:rounded-[28px] sm:p-10">
            <ContactForm />
          </Reveal>
        </div>
      </section>
    </main>
  );
}
