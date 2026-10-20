"use client";

import { useEffect, useRef, useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "./Icon";

/**
 * Search field for a server-filtered list page. Results update as you type (the URL is replaced,
 * so typing doesn't fill history); without JavaScript it's a plain GET form. `keep` holds the
 * other filters to carry along, such as the category; empty values are left out.
 */
export function SearchField({
  action,
  q,
  keep = {},
  label,
}: {
  action: string;
  q: string;
  keep?: Record<string, string>;
  label: string;
}) {
  const router = useRouter();
  const [value, setValue] = useState(q);
  const [pending, startTransition] = useTransition();
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Follow the URL when it changes from outside the field (the back button), but not when it's
  // just catching up with what was typed.
  const [seenQ, setSeenQ] = useState(q);
  const [sent, setSent] = useState(q);
  if (q !== seenQ) {
    setSeenQ(q);
    if (q !== sent) {
      setSent(q);
      setValue(q);
    }
  }
  useEffect(() => () => clearTimeout(timer.current), []);

  function go(next: string) {
    const params = new URLSearchParams();
    if (next.trim()) params.set("q", next.trim());
    for (const [k, v] of Object.entries(keep)) if (v) params.set(k, v);
    setSent(next.trim());
    const qs = params.toString();
    startTransition(() => router.replace(qs ? `${action}?${qs}` : action, { scroll: false }));
  }

  function onChange(next: string) {
    setValue(next);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => go(next), 180);
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    clearTimeout(timer.current);
    go(value);
  }

  return (
    <form action={action} role="search" onSubmit={onSubmit} className="relative w-full sm:max-w-[26rem]">
      <label>
        <span className="sr-only">{label}</span>
        <Icon
          name="search"
          className={`pointer-events-none absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-fg-2 transition-opacity duration-200 ${pending ? "opacity-40" : ""}`}
        />
        <input
          type="search"
          name="q"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={label}
          autoComplete="off"
          enterKeyHint="search"
          className="h-11 w-full rounded-full border border-line bg-field pr-4 pl-10 text-callout outline-none transition-[box-shadow,border-color] duration-200 focus:border-cta focus:ring-4 focus:ring-cta/20"
        />
      </label>
      {Object.entries(keep).map(([k, v]) => v && <input key={k} type="hidden" name={k} value={v} />)}
    </form>
  );
}
