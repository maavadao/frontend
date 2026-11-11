"use client";

import { useLayoutEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { Icon } from "./Icon";
import { REGISTRY_REPO, formatCount, listingHref, pricingSummary, type RegistryListing } from "@/lib/registry";

const kinds = ["All", "Agents", "Tools"] as const;
type Kind = (typeof kinds)[number];

const sorts = { trending: "Trending", stars: "Most starred", recent: "Recently updated", name: "Name" } as const;
type Sort = keyof typeof sorts;

/** Segmented control whose thumb springs to the selected segment from wherever it currently is. */
function Segmented({ value, onChange }: { value: Kind; onChange: (v: Kind) => void }) {
  const refs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [thumb, setThumb] = useState<{ x: number; w: number } | null>(null);

  useLayoutEffect(() => {
    const measure = () => {
      const el = refs.current[value];
      if (el) setThumb({ x: el.offsetLeft, w: el.offsetWidth });
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [value]);

  function onKey(e: KeyboardEvent) {
    const i = kinds.indexOf(value);
    const next = e.key === "ArrowRight" ? i + 1 : e.key === "ArrowLeft" ? i - 1 : -1;
    if (next < 0 || next >= kinds.length) return;
    e.preventDefault();
    onChange(kinds[next]);
    refs.current[kinds[next]]?.focus();
  }

  return (
    <div
      role="tablist"
      aria-label="Filter by kind"
      onKeyDown={onKey}
      className="relative mx-auto mb-8 flex w-fit gap-1 rounded-full bg-surface p-1 shadow-[0_1px_2px_rgb(0_0_0/0.06)] sm:mb-12"
    >
      {thumb && (
        <span
          aria-hidden="true"
          className="absolute top-1 bottom-1 left-0 rounded-full bg-fg transition-[translate,width] duration-[640ms] ease-[var(--ease-spring)] motion-reduce:transition-none"
          style={{ translate: `${thumb.x}px 0`, width: thumb.w }}
        />
      )}
      {kinds.map((k) => (
        <button
          key={k}
          ref={(el) => {
            refs.current[k] = el;
          }}
          role="tab"
          aria-selected={value === k}
          tabIndex={value === k ? 0 : -1}
          onClick={() => onChange(k)}
          className={`press relative shrink-0 rounded-full px-5 py-2 text-callout ${
            value === k ? (thumb ? "text-bg" : "bg-fg text-bg") : "text-fg-2 hover:text-fg"
          }`}
        >
          {k}
        </button>
      ))}
    </div>
  );
}

export function MarketplaceCatalog({ listings, categories }: { listings: RegistryListing[]; categories: Record<string, string> }) {
  const [kind, setKind] = useState<Kind>("All");
  const [sort, setSort] = useState<Sort>("trending");
  const [query, setQuery] = useState("");
  const [freeOnly, setFreeOnly] = useState(false);

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = listings.filter((l) => {
      if (kind === "Agents" && l.kind !== "agent") return false;
      if (kind === "Tools" && l.kind !== "tool") return false;
      if (freeOnly && l.pricing?.education?.price !== "free") return false;
      if (
        q &&
        !(
          l.name.toLowerCase().includes(q) ||
          l.summary.toLowerCase().includes(q) ||
          (l.tags ?? []).some((t) => t.toLowerCase().includes(q))
        )
      )
        return false;
      return true;
    });
    const stars = (l: RegistryListing) => l.stats?.stars ?? 0;
    const by: Record<Sort, (a: RegistryListing, b: RegistryListing) => number> = {
      trending: (a, b) => (b.stats?.stars_gained ?? 0) - (a.stats?.stars_gained ?? 0) || stars(b) - stars(a),
      stars: (a, b) => stars(b) - stars(a),
      recent: (a, b) => (b.stats?.pushed_at ?? "").localeCompare(a.stats?.pushed_at ?? ""),
      name: (a, b) => a.name.localeCompare(b.name),
    };
    return [...filtered].sort(by[sort]);
  }, [listings, kind, sort, query, freeOnly]);

  if (listings.length === 0) {
    return (
      <div className="card p-10 text-center sm:p-16">
        <p className="text-headline">Nothing listed yet.</p>
        <p className="mt-2 text-body text-fg-2">
          Be the first:{" "}
          <a className="text-link hover:underline" href={`${REGISTRY_REPO}/blob/main/templates/agent.yaml`}>
            list an agent
          </a>{" "}
          or{" "}
          <a className="text-link hover:underline" href={`${REGISTRY_REPO}/blob/main/templates/tool.yaml`}>
            a tool
          </a>
          .
        </p>
      </div>
    );
  }

  return (
    <div>
      <Segmented value={kind} onChange={setKind} />

      <div className="mb-8 flex flex-col gap-4 sm:mb-12 sm:flex-row sm:items-center sm:justify-between">
        <label className="relative sm:max-w-[22rem] sm:flex-1">
          <span className="sr-only">Search agents and tools</span>
          <Icon name="search" className="pointer-events-none absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-fg-2" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search agents and tools"
            className="h-11 w-full rounded-full border border-line bg-field pr-4 pl-10 text-callout outline-none transition-[box-shadow,border-color] duration-200 focus:border-teal focus:ring-4 focus:ring-mint/50"
          />
        </label>

        <div className="flex flex-wrap items-center gap-5 text-callout">
          <label className="flex min-h-11 items-center gap-2 text-fg-2">
            <input
              type="checkbox"
              checked={freeOnly}
              onChange={(e) => setFreeOnly(e.target.checked)}
              className="h-4 w-4 rounded accent-teal"
            />
            Free for education only
          </label>
          <label className="flex min-h-11 items-center gap-2 text-fg-2">
            Sort
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as Sort)}
              className="rounded-full border border-line bg-field px-3 py-1.5 text-callout text-fg outline-none"
            >
              {Object.entries(sorts).map(([k, label]) => (
                <option key={k} value={k}>
                  {label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <p className="sr-only" aria-live="polite">
        {shown.length} listed
      </p>

      {shown.length === 0 ? (
        <p className="card p-10 text-center text-body text-fg-2 sm:p-16">
          No matches. Try a different search or filter.
        </p>
      ) : (
        <ul key={kind} className="animate-fade gallery sm:grid sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
          {shown.map((l) => (
            <li key={`${l.kind}-${l.slug}`}>
              <a
                href={listingHref(l)}
                target="_blank"
                rel="noreferrer"
                className="press group flex h-full flex-col card p-6 sm:p-7 motion-safe:hover:-translate-y-1 hover:shadow-[0_20px_50px_-20px_rgb(0_0_0/0.25)]"
              >
                <div className="flex items-start justify-between gap-4">
                  <span className="rounded-full bg-bg-alt px-2.5 py-1 text-caption font-medium text-fg-2">
                    {l.kind === "agent" ? "Agent" : "Tool"}
                  </span>
                  {l.stats && (
                    <span className="flex items-center gap-1 text-caption text-fg-2">
                      <Icon name="star" className="h-3.5 w-3.5" />
                      {formatCount(l.stats.stars)}
                    </span>
                  )}
                </div>
                <p className="mt-5 text-caption font-semibold text-accent-text">
                  {categories[l.category] ?? l.category}
                </p>
                <h3 className="mt-1 text-headline">{l.name}</h3>
                <p className="mt-3 line-clamp-3 flex-1 text-body text-fg-2">{l.summary}</p>
                <div className="mt-6 flex items-center justify-between gap-3 text-callout">
                  <span className="text-fg-2">{pricingSummary(l.pricing)}</span>
                  <span className="shrink-0 text-link">
                    View
                    <span className="ml-1 inline-block transition-transform duration-300 group-hover:translate-x-1">›</span>
                  </span>
                </div>
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
