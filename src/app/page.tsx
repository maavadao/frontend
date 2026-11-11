import type { ReactNode } from "react";
import Link from "next/link";
import { Reveal } from "@/components/Reveal";
import { Hero } from "@/components/hero/Hero";
import { Icon, type IconName } from "@/components/Icon";
import { CommunityProjects } from "@/components/CommunityProjects";
import { CommunityWall } from "@/components/CommunityWall";
import { ContactForm } from "@/components/ContactForm";
import { hasEmail, site } from "@/lib/site";
import { helpWays } from "@/lib/supporters";

function SectionHead({
  eyebrow,
  title,
  lede,
  onDark = false,
}: {
  eyebrow: string;
  title: ReactNode;
  lede?: string;
  onDark?: boolean;
}) {
  return (
    <Reveal className="mx-auto mb-10 max-w-[760px] text-center sm:mb-14">
      <p className={`text-callout font-semibold sm:text-body ${onDark ? "text-mint" : "kicker"}`}>{eyebrow}</p>
      <h2 className={`mt-3 text-display text-balance ${onDark ? "text-white" : ""}`}>{title}</h2>
      {lede && <p className={`mt-5 text-lede text-pretty ${onDark ? "text-ink-fg-2" : "text-fg-2"}`}>{lede}</p>}
    </Reveal>
  );
}

/** A rounded square holding a line icon: mint on navy, teal on white. */
function IconTile({ name, onDark = false }: { name: IconName; onDark?: boolean }) {
  return (
    <span
      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-[14px] ${
        onDark ? "bg-mint/12 text-mint ring-1 ring-mint/25" : "bg-mint-wash text-teal ring-1 ring-mint-soft"
      }`}
    >
      <Icon name={name} className="h-6 w-6" />
    </span>
  );
}

const stats: [string, string, string][] = [
  ["Free", "to create, list and use", "text-white"],
  ["60%", "to contributors", "text-mint"],
  ["40%", "to children's education", "text-sun"],
  ["0%", "commission, ever", "text-white"],
];

const steps = [
  ["Create and list, free", "Anyone can build an AI agent and list it on the maava Marketplace. There is no charge to list, create or publish anything, ever."],
  ["Propose a project", "Any community member can propose a new product: an AI science tutor, a research agent for content creators, a clinical-skills trainer."],
  ["The DAO votes", "The community votes on proposals, and approved projects get the backing of the community."],
  ["Build together", "Developers, educators, designers, translators and subject experts contribute. Every contribution is recorded transparently on the blockchain."],
  ["Share the rewards", "When a product is monetised, 60% of the revenue rewards the contributors who built it, and 40% helps children in need."],
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
    body: "When a product is monetised, revenue is split automatically: 60% rewards the community who built it and 40% helps children in need, enforced in code by the blockchain, not left to promises.",
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

export default function Home() {
  return (
    <main>
      <Hero />

      {/* Why this exists: the one full navy band near the top, like the logo's ground. */}
      <section id="why" className="bg-ink px-4 py-20 text-white sm:px-6 sm:py-28 lg:py-32">
        <div className="mx-auto max-w-[1100px]">
          <Reveal className="mx-auto max-w-[900px] text-center">
            <p className="text-statement text-balance">
              Open-source developers give their expertise away for nothing, and commercial marketplaces can take up to 30% of what creators earn.{" "}
              <span className="text-ink-fg-2">Meanwhile, quality education is still out of reach for millions of children.</span>{" "}
              <span className="text-mint">maavaDao turns this around.</span>
            </p>
          </Reveal>

          <dl className="mt-14 grid grid-cols-2 gap-3 sm:mt-20 sm:grid-cols-4 sm:gap-4">
            {stats.map(([value, label, tone], i) => (
              <Reveal key={label} delay={i * 80} className="rounded-[var(--radius-card)] bg-ink-2 px-5 py-6 ring-1 ring-white/8 sm:px-7 sm:py-8">
                <dt className="sr-only">{label}</dt>
                <dd>
                  <span className={`block text-figure ${tone}`}>{value}</span>
                  <span className="mt-2 block text-footnote text-balance text-ink-fg-2 sm:text-callout">{label}</span>
                </dd>
              </Reveal>
            ))}
          </dl>
        </div>
      </section>

      {/* Mission and impact */}
      <section className="bg-bg px-4 py-16 sm:px-6 sm:py-24 lg:py-28">
        <div className="mx-auto max-w-[1100px]">
          <Reveal className="card relative overflow-hidden px-6 py-10 text-center sm:px-16 sm:py-16">
            <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-mint via-teal to-sun" />
            <p className="kicker text-callout sm:text-body">Our mission</p>
            <p className="mx-auto mt-4 max-w-[52rem] text-title text-balance">{site.mission}</p>
          </Reveal>

          {/* Rows are shared (subgrid) so the label, headline and body line up across both cards. */}
          <div id="impact" className="mt-4 grid scroll-mt-20 gap-4 sm:mt-5 sm:grid-cols-2 sm:gap-5">
            <Reveal className="flex flex-col gap-3 rounded-[var(--radius-card)] border border-sun-soft bg-sun-wash px-7 py-8 sm:row-span-3 sm:grid sm:grid-rows-subgrid sm:p-10">
              <p className="flex items-center gap-2 text-callout font-semibold text-sun-text">
                <span aria-hidden="true" className="dot bg-sun-strong" />
                Already running
              </p>
              <p className="text-figure leading-none sm:self-end">2 schools</p>
              <p className="text-body text-fg-2">
                maava already runs two schools for deserving children. maavaDao extends that mission into the age of AI.
              </p>
            </Reveal>
            <Reveal delay={90} className="flex flex-col gap-3 rounded-[var(--radius-card)] border border-mint-soft bg-mint-wash px-7 py-8 sm:row-span-3 sm:grid sm:grid-rows-subgrid sm:p-10">
              <p className="kicker text-callout">Next</p>
              <h3 className="text-title sm:self-end">Maava School for AI</h3>
              <p className="text-body text-fg-2">
                Teaching deserving children, orphans and street children to learn with, use and build AI. Every product
                monetised on maavaDao helps fund it.
              </p>
            </Reveal>
          </div>
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
                className={`card p-7 sm:p-8 ${i < 3 ? "lg:col-span-2" : "lg:col-span-3"} ${i === steps.length - 1 ? "sm:col-span-2" : ""}`}
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-ink text-callout font-bold text-mint">
                  {i + 1}
                </span>
                <h3 className="mt-5 text-headline sm:mt-6">{title}</h3>
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
                className={`flex flex-col p-7 sm:p-9 ${f.className ?? ""} ${f.feature ? "tile shadow-lift" : "card"}`}
              >
                <IconTile name={f.icon} onDark={f.feature} />
                <div className="mt-8 sm:mt-10">
                  <h3 className={`text-title ${f.feature ? "text-white" : ""}`}>{f.title}</h3>
                  <p className={`mt-3 max-w-[40rem] text-body ${f.feature ? "text-ink-fg-2" : "text-fg-2"}`}>{f.body}</p>
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
              <Reveal key={l.level} delay={i * 110} className="card p-7 sm:p-8">
                <span className="inline-flex rounded-full bg-mint-wash px-3 py-1 text-footnote font-semibold text-accent-text ring-1 ring-mint-soft">
                  Level {i + 1}
                </span>
                <h3 className="mt-4 text-title">{l.level}</h3>
                <p className="mt-3 text-callout text-fg-2">{l.who}</p>
                <p className="mt-6 border-t border-line pt-5 text-footnote font-semibold text-fg">Decides</p>
                <ul className="mt-3 space-y-2.5">
                  {l.decides.map((d) => (
                    <li key={d} className="flex gap-3 text-body">
                      <span aria-hidden="true" className="dot mt-[0.55em]" />
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
      <section id="safety" className="bg-mint-wash px-4 py-16 sm:px-6 sm:py-24 lg:py-32">
        <div className="mx-auto max-w-[1100px]">
          <SectionHead
            eyebrow="Responsible AI and safeguarding"
            title="Because it serves children and young people, safety comes first."
            lede="Every agent listed on maavaDao must meet these standards."
          />
          <div className="grid gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-6">
            {safety.map((s, i) => (
              <Reveal
                key={s.title}
                delay={(i % 3) * 90}
                className={`card flex gap-4 p-6 sm:block sm:p-8 ${i < 3 ? "lg:col-span-2" : "lg:col-span-3"} ${
                  i === safety.length - 1 ? "sm:col-span-2" : ""
                }`}
              >
                <IconTile name={s.icon} />
                <div>
                  <h3 className="text-headline sm:mt-5">{s.title}</h3>
                  <p className="mt-1 text-body text-fg-2 sm:mt-2">{s.body}</p>
                </div>
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
                className={`card flex gap-4 p-6 sm:gap-5 sm:p-8 ${i < 2 ? "lg:col-span-3" : "lg:col-span-2"} ${
                  i === audiences.length - 1 ? "sm:col-span-2" : ""
                }`}
              >
                <IconTile name={a.icon} />
                <div>
                  <h3 className="text-headline">{a.who}</h3>
                  <p className="mt-2 text-body text-fg-2">{a.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Roadmap: the second navy band. */}
      <section id="roadmap" className="bg-ink px-4 py-16 text-white sm:px-6 sm:py-24 lg:py-32">
        <div className="mx-auto max-w-[1100px]">
          <SectionHead
            onDark
            eyebrow="Roadmap"
            title="What we're planning."
            lede="maavaDao is in its early stage. Here is the path from first agents to verifiable impact."
          />
          <ol className="relative grid gap-8 lg:grid-cols-5 lg:gap-6">
            <span
              aria-hidden="true"
              className="absolute top-7 right-[10%] left-[10%] hidden h-0.5 bg-gradient-to-r from-mint via-teal to-sun lg:block"
            />
            {phases.map(([title, body], i) => (
              <Reveal
                as="li"
                key={title}
                delay={i * 100}
                className="relative lg:row-span-2 lg:grid lg:grid-rows-subgrid lg:gap-y-3 lg:text-center"
              >
                {i < phases.length - 1 && (
                  <span aria-hidden="true" className="absolute top-12 -bottom-8 left-6 w-0.5 bg-gradient-to-b from-mint to-teal lg:hidden" />
                )}
                <div className="flex items-center gap-4 lg:block">
                  <span
                    className={`relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-callout font-bold lg:mx-auto lg:h-14 lg:w-14 ${
                      i === 0 ? "bg-mint text-cta-fg" : "bg-ink-2 text-mint ring-1 ring-mint/30"
                    }`}
                  >
                    {i + 1}
                  </span>
                  <div className="lg:mt-6">
                    <p className="text-footnote font-semibold text-mint">Phase {i + 1}</p>
                    <h3 className="text-headline text-balance text-white">{title}</h3>
                  </div>
                </div>
                <p className="mt-2 pl-16 text-callout text-ink-fg-2 lg:mx-auto lg:mt-0 lg:max-w-[13rem] lg:pl-0">{body}</p>
              </Reveal>
            ))}
          </ol>
          <Reveal className="mt-12 flex justify-center sm:mt-16">
            <p className="inline-flex min-h-11 items-center gap-2.5 rounded-full bg-ink-2 px-4 text-footnote whitespace-nowrap text-white ring-1 ring-white/10 sm:text-callout">
              <span aria-hidden="true" className="dot" />
              <span>
                maava Studio coming soon<span className="hidden text-ink-fg-2 sm:inline">: a drag-and-drop workflow editor</span>
              </span>
            </p>
          </Reveal>
        </div>
      </section>

      {/* Our community: supporters who chose to appear */}
      <CommunityWall />

      {/* Get involved */}
      <section id="contact" className="bg-bg-alt px-4 py-16 sm:px-6 sm:py-24 lg:py-32">
        <div className="mx-auto grid max-w-[1100px] gap-10 lg:grid-cols-[1fr_1.2fr] lg:gap-20">
          <Reveal>
            <p className="kicker text-callout sm:text-body">Get involved</p>
            <h2 className="mt-3 text-display">
              Help us reach
              <br />
              <span className="text-brand">every child.</span>
            </h2>
            <p className="mt-5 max-w-[28rem] text-lede text-pretty text-fg-2">
              maavaDao is an ever-welcoming community. You don&apos;t need to write code to belong here: volunteers,
              students, teachers, parents and supporters are as much a part of it as developers.
            </p>
            <p className="mt-4 max-w-[28rem] text-body text-pretty text-fg-2">
              Give some time, refer a school or orphanage, teach, translate or spread the word. Every bit of help
              reaches children in need.
            </p>
            <ul className="mt-8 space-y-1 text-body sm:mt-10">
              {[
                ["GitHub", site.links.github, "github.com/maavadao"],
                ["Discord", site.links.discord, "Join the conversation"],
                ["Email", hasEmail ? `mailto:${site.email}` : null, site.email],
              ].map(([label, href, text]) => (
                <li key={label} className="flex min-h-11 items-center gap-4">
                  <span className="w-20 shrink-0 font-semibold text-fg">{label}</span>
                  {href ? (
                    <a href={href} className="font-medium text-link hover:underline" target={href.startsWith("http") ? "_blank" : undefined} rel="noreferrer">
                      {text}
                    </a>
                  ) : (
                    <span className="text-fg-2">{text}</span>
                  )}
                </li>
              ))}
            </ul>
          </Reveal>
          <Reveal delay={120} className="card -mx-4 self-start rounded-none px-4 py-8 sm:mx-0 sm:rounded-[var(--radius-card)] sm:p-10">
            {/* A plain GET form: the chosen ways arrive pre-ticked on /get-involved, before or after joining. */}
            <form action="/get-involved" method="get">
              <fieldset>
                <legend className="text-title">How would you like to help?</legend>
                <p className="mt-1.5 text-callout text-fg-2">Choose any. You can change them later.</p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {helpWays.map((w) => (
                    <label key={w.id} className="chip min-h-11 px-4 text-callout">
                      <input type="checkbox" name="way" value={w.id} className="sr-only" />
                      {w.label}
                    </label>
                  ))}
                </div>
              </fieldset>
              <button type="submit" className="btn btn-primary mt-6 min-h-12 px-6 text-body">
                Open the get-involved form
              </button>
              <p className="mt-4 text-callout text-fg-2">
                A developer?{" "}
                <Link href="/agents" className="font-medium text-link hover:underline">
                  Build maava Community Agents
                </Link>
                .
              </p>
            </form>
            <details className="group mt-8 border-t border-line pt-4">
              <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between text-callout font-medium text-link [&::-webkit-details-marker]:hidden">
                Have a question, or a business enquiry? Send us a message
                <span aria-hidden="true" className="text-fg-2 transition-transform group-open:rotate-180">
                  ⌄
                </span>
              </summary>
              <div className="mt-4">
                <ContactForm />
              </div>
            </details>
          </Reveal>
        </div>
      </section>
    </main>
  );
}
