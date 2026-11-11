"use client";

import Link from "next/link";
import { useId, useState } from "react";
import { LogoMark } from "@/components/Logo";

type Audience = "learn" | "run";

/** What maava does today, from the site's own copy and the Education Agent's skills. `featured` rows show before anyone types. */
const tasks: { name: string; what: string; who: Audience; href: string; featured: boolean }[] = [
  { name: "Homework help", what: "Guided, never just the answer.", who: "learn", href: "/chat", featured: true },
  { name: "Quizzes and study plans", what: "Built around your exams.", who: "learn", href: "/chat", featured: true },
  { name: "Research reports", what: "With sources, for older students.", who: "learn", href: "/chat", featured: true },
  { name: "Admissions", what: "Prepared for a person to review.", who: "run", href: "/agents", featured: true },
  { name: "Parent emails", what: "Reminders and updates.", who: "run", href: "/agents", featured: true },
  { name: "Invoices and timetables", what: "And reporting, done for you.", who: "run", href: "/agents", featured: true },
  { name: "Medical and health training", what: "Revision for trainee doctors.", who: "learn", href: "/chat", featured: false },
  { name: "Languages", what: "Explained in English, Urdu and Arabic.", who: "learn", href: "/chat", featured: false },
  { name: "Lesson plans", what: "Worksheets and assessments for teachers.", who: "run", href: "/chat", featured: false },
  { name: "Staff reports", what: "Summaries for teachers and parents.", who: "run", href: "/agents", featured: false },
];

const audiences: { id: Audience; label: string }[] = [
  { id: "learn", label: "Learning" },
  { id: "run", label: "Running a school" },
];

export function AskWidget() {
  const id = useId();
  const [query, setQuery] = useState("");
  const [only, setOnly] = useState<Audience | null>(null);

  const text = query.trim().toLowerCase();
  const shown = tasks.filter(
    (t) =>
      (!only || t.who === only) &&
      (text ? `${t.name} ${t.what}`.toLowerCase().includes(text) : t.featured || only !== null),
  );

  return (
    <div className="tile min-w-0 p-5 shadow-lift ring-1 ring-white/5 sm:p-7">
      <div className="flex items-center gap-3">
        <LogoMark className="h-10 w-10 shrink-0 rounded-[10px] ring-1 ring-white/10" />
        <div>
          <p className="text-headline text-white">Ask maava</p>
          <p className="text-footnote text-ink-fg-2">Teaching, learning or running a school?</p>
        </div>
      </div>

      <label htmlFor={`${id}-find`} className="sr-only">
        What do you need help with?
      </label>
      <div className="relative mt-5">
        <svg aria-hidden="true" viewBox="0 0 24 24" className="pointer-events-none absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-ink-fg-2" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>
        <input
          id={`${id}-find`}
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Homework, admissions, invoices…"
          autoComplete="off"
          spellCheck={false}
          className="h-12 w-full rounded-[var(--radius-control)] border border-white/10 bg-ink-2 pr-4 pl-12 text-body text-white caret-mint outline-none placeholder:text-ink-fg-2 focus:border-mint focus:ring-4 focus:ring-mint/25"
        />
      </div>

      <div role="group" aria-label="Show tasks for" className="mt-3 flex flex-wrap gap-2">
        {audiences.map((a) => {
          const on = only === a.id;
          return (
            <button
              key={a.id}
              type="button"
              aria-pressed={on}
              onClick={() => setOnly(on ? null : a.id)}
              className={`press min-h-11 rounded-full px-4 text-callout font-semibold focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-mint ${
                on ? "bg-mint text-cta-fg" : "border border-white/15 text-white/85 hover:border-white/40 hover:text-white"
              }`}
            >
              {a.label}
            </button>
          );
        })}
      </div>

      <ul className="mt-4 divide-y divide-white/8 border-t border-white/10">
        {shown.map((t) => (
          <li key={t.name}>
            <Link
              href={t.href}
              className="group grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-0.5 py-3 outline-none focus-visible:rounded-lg focus-visible:ring-3 focus-visible:ring-mint"
            >
              <span className="text-body font-semibold text-white group-hover:text-mint">{t.name}</span>
              <span
                className={`row-span-2 rounded-full px-2.5 py-0.5 text-caption font-semibold ${
                  t.who === "learn" ? "bg-mint/15 text-mint" : "bg-sun/15 text-sun"
                }`}
              >
                {t.who === "learn" ? "Learners" : "Schools"}
              </span>
              <span className="text-footnote text-ink-fg-2">{t.what}</span>
            </Link>
          </li>
        ))}
      </ul>
      <p role="status" className="min-h-[1lh] pt-3 text-footnote text-ink-fg-2">
        {shown.length === 0 ? "Nothing matches yet. Ask maava AI anyway." : ""}
      </p>
      <Link href="/chat" className="btn btn-primary mt-1 min-h-11 w-full text-callout">
        Try maava AI
      </Link>
    </div>
  );
}
