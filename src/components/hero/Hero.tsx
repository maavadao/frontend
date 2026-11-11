import Link from "next/link";
import { site } from "@/lib/site";
import { LogoMark } from "@/components/Logo";
import { AskWidget } from "./AskWidget";

function GitHubIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M9 19c-4.3 1.4-4.3-2.5-6-3m12 5v-3.5c0-1 .1-1.4-.5-2 2.8-.3 5.5-1.4 5.5-6a4.6 4.6 0 0 0-1.3-3.2 4.2 4.2 0 0 0-.1-3.2s-1.1-.3-3.5 1.3a12.3 12.3 0 0 0-6.2 0C6.5 2.8 5.4 3.1 5.4 3.1a4.2 4.2 0 0 0-.1 3.2A4.6 4.6 0 0 0 4 9.5c0 4.6 2.7 5.7 5.5 6-.6.6-.6 1.2-.5 2V21" />
    </svg>
  );
}

/** Home hero: the promise on the left, the "Ask maava" tile on the right. */
export function Hero() {
  return (
    <section aria-labelledby="hero-title" className="relative overflow-hidden bg-bg">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 right-[-12%] h-[640px] w-[640px] rounded-full bg-[radial-gradient(closest-side,var(--glow-violet),transparent)] blur-2xl" />
        <div className="absolute bottom-[-30%] left-[-10%] h-[520px] w-[520px] rounded-full bg-[radial-gradient(closest-side,var(--glow-ember),transparent)] blur-2xl" />
        <div className="absolute inset-0 bg-[radial-gradient(var(--grid-dot)_1px,transparent_1px)] [mask-image:linear-gradient(to_bottom,black,transparent_85%)] [background-size:24px_24px]" />
      </div>

      <div className="relative mx-auto grid max-w-[1148px] items-center gap-12 px-4 pt-24 pb-16 sm:px-6 sm:pt-32 sm:pb-24 lg:min-h-[86svh] lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-16 lg:pt-28">
        <div className="min-w-0">
          <p className="inline-flex items-center gap-2 rounded-full border border-line bg-surface/80 px-3 py-1.5 text-footnote font-medium text-fg-2 shadow-card backdrop-blur">
            <span aria-hidden="true" className="dot" />
            Community-owned, free for education
          </p>
          <h1 id="hero-title" className="mt-6 text-hero text-balance lg:text-[clamp(3rem,5.2vw,4.75rem)]">
            AI for education, <span className="text-brand">built by the community.</span>
          </h1>
          <p className="mt-6 max-w-[34rem] text-lede text-pretty text-fg">{site.tagline}</p>
          <p className="mt-4 max-w-[34rem] text-body text-pretty text-fg-2">{site.subline}</p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link href="/signup" className="btn btn-primary min-h-12 px-6 text-body">
              Join maavaDao
            </Link>
            <a href={site.links.github} target="_blank" rel="noopener noreferrer" className="btn btn-dark min-h-12 px-6 text-body">
              <GitHubIcon />
              Open GitHub
            </a>
            <a href={site.links.agentsGithub} target="_blank" rel="noopener noreferrer" className="btn btn-ghost min-h-12 px-6 text-body">
              <LogoMark className="h-5 w-5" />
              Open community agents
            </a>
            <Link href="/#how-it-works" className="group inline-flex min-h-12 items-center px-2 text-body font-semibold text-link">
              See how it works
              <span aria-hidden="true" className="ml-1 inline-block transition-transform group-hover:translate-x-1">
                →
              </span>
            </Link>
          </div>
        </div>
        <AskWidget />
      </div>
    </section>
  );
}
