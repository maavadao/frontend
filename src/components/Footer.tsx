import type { ReactNode } from "react";
import Link from "next/link";
import { Wordmark } from "./Logo";
import { AppearanceControl } from "./AppearanceControl";
import { hasEmail, site } from "@/lib/site";

const columns = [
  {
    title: "Explore",
    links: [
      { label: "How it works", href: "/#how-it-works" },
      { label: "Marketplace", href: "/marketplace" },
      { label: "Open-source AI repos", href: "/repos" },
      { label: "Developers", href: "/developers" },
      { label: "maava Community Agents", href: "/agents" },
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
      { label: "Get involved", href: "/#contact" },
      { label: site.email, href: hasEmail ? `mailto:${site.email}` : "/#contact" },
    ],
  },
];

function FooterLink({ href, className = "", children }: { href: string; className?: string; children: ReactNode }) {
  const cls = `break-all hover:text-fg hover:underline ${className}`;
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
    <footer className="border-t border-line bg-bg-alt text-caption text-fg-2">
      <div className="mx-auto max-w-[1148px] px-4 pt-10 pb-8 sm:px-6 sm:pt-12">
        <p className="border-b border-line pb-4 leading-relaxed">
          maavaDao is a community-owned ecosystem of agentic AI for education, governed as a decentralised autonomous
          organisation. No fees, no commissions: 60% of every monetised product rewards the contributors who built
          it, and 40% helps children in need: deserving children, orphans and street children. Open source under the
          Apache 2.0 Licence.
        </p>

        {/* Phones: each column is an accordion with full-height tap rows. */}
        <div className="py-2 sm:hidden">
          {columns.map((col) => (
            <details key={col.title} className="group border-b border-line">
              <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between text-callout text-fg [&::-webkit-details-marker]:hidden">
                {col.title}
                <span
                  aria-hidden="true"
                  className="text-fg-2 transition-transform duration-300 ease-[var(--ease-spring)] group-open:rotate-180"
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

        <div className="hidden grid-cols-4 gap-8 py-8 sm:grid">
          {columns.map((col) => (
            <div key={col.title}>
              <h3 className="mb-3 font-semibold text-fg">{col.title}</h3>
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

        <div className="flex flex-col gap-4 pt-5 sm:flex-row sm:items-center sm:justify-between sm:border-t sm:border-line">
          <Wordmark />
          <AppearanceControl className="self-start sm:self-auto" />
          <p>Copyright © {new Date().getFullYear()} maavaDao. Built in the open.</p>
        </div>
      </div>
    </footer>
  );
}
