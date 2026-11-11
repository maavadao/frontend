import type { ReactNode } from "react";
import Link from "next/link";
import { Wordmark } from "./Logo";
import { hasEmail, site } from "@/lib/site";

const columns = [
  {
    title: "Explore",
    links: [
      { label: "How it works", href: "/#how-it-works" },
      { label: "Marketplace", href: "/marketplace" },
      { label: "Directory", href: "/directory" },
      { label: "Open-source AI repos", href: "/repos" },
      { label: "Developers", href: "/developers" },
      { label: "maava Community Agents", href: "/agents" },
      { label: "Vote on ideas", href: "/vote" },
      { label: "Projects", href: "/#projects" },
      { label: "Governance", href: "/#governance" },
      { label: "Safeguarding", href: "/#safety" },
      { label: "Roadmap", href: "/#roadmap" },
    ],
  },
  {
    title: "Community",
    links: [
      { label: "GitHub", href: site.links.github },
      { label: "Discord", href: site.links.discord },
      { label: "X (Twitter)", href: site.links.x },
    ],
  },
  {
    title: "Account",
    links: [
      { label: "Sign in", href: "/login" },
      { label: "Create account", href: "/signup" },
    ],
  },
  {
    title: "Get in touch",
    links: [
      { label: "Get involved", href: "/get-involved" },
      { label: "Refer a school or orphanage", href: "/get-involved#refer" },
      { label: site.email, href: hasEmail ? `mailto:${site.email}` : "/#contact" },
    ],
  },
];

function FooterLink({ href, className = "", children }: { href: string; className?: string; children: ReactNode }) {
  const cls = `break-all text-ink-fg-2 hover:text-mint ${className}`;
  if (href.startsWith("/"))
    return (
      <Link href={href} className={cls}>
        {children}
      </Link>
    );
  return (
    <a href={href} className={cls} rel="noreferrer" target={href.startsWith("http") ? "_blank" : undefined}>
      {children}
    </a>
  );
}

export function Footer() {
  return (
    <footer className="site-footer bg-ink text-footnote text-ink-fg-2">
      <div className="mx-auto max-w-[1148px] px-4 pt-12 pb-10 sm:px-6 sm:pt-16">
        <div className="flex flex-col gap-5 border-b border-white/10 pb-8 sm:flex-row sm:items-start sm:justify-between sm:gap-12">
          <Wordmark onDark large />
          <p className="max-w-[40rem] leading-relaxed">
          maavaDao is a community-owned ecosystem of agentic AI for education, governed as a decentralised autonomous
          organisation. No fees, no commissions: 60% of every monetised product rewards the contributors who built
          it, and 40% helps children in need: deserving children, orphans and street children. Open source under the
          Apache 2.0 Licence.
          </p>
        </div>

        {/* Phones: each column is an accordion with full-height tap rows. */}
        <div className="py-2 sm:hidden">
          {columns.map((col) => (
            <details key={col.title} className="group border-b border-white/10">
              <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between text-callout font-semibold text-white [&::-webkit-details-marker]:hidden">
                {col.title}
                <span
                  aria-hidden="true"
                  className="text-ink-fg-2 transition-transform duration-300 ease-[var(--ease-spring)] group-open:rotate-180"
                >
                  ⌄
                </span>
              </summary>
              <ul className="pb-3">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <FooterLink href={l.href} className="flex min-h-11 items-center text-callout">
                      {l.label}
                    </FooterLink>
                  </li>
                ))}
              </ul>
            </details>
          ))}
        </div>

        <div className="hidden grid-cols-4 gap-8 py-10 sm:grid">
          {columns.map((col) => (
            <div key={col.title}>
              <h3 className="mb-4 font-semibold text-white">{col.title}</h3>
              <ul className="space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <FooterLink href={l.href}>{l.label}</FooterLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-2 pt-6 sm:flex-row sm:items-center sm:justify-between sm:border-t sm:border-white/10">
          <p className="flex items-center gap-2">
            <span aria-hidden="true" className="dot" />
            AI education, automation and community
          </p>
          <p>Copyright © {new Date().getFullYear()} maavaDao. Built in the open.</p>
        </div>
      </div>
    </footer>
  );
}
