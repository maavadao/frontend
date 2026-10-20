"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";

/**
 * The repo detail, opened over the list. On phones it's a sheet that rises from the bottom; on
 * larger screens a centred card. It closes on the close button, a tap outside, Escape or Back,
 * and leaves along the path it came in on.
 */
export function RepoSheet({ title, children }: { title: string; children: ReactNode }) {
  const router = useRouter();
  const panel = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  const close = useCallback(() => {
    setOpen(false);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setTimeout(() => router.back(), reduce ? 0 : 220);
  }, [router]);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setOpen(true));
    const previous = document.activeElement as HTMLElement | null;
    panel.current?.focus();
    const html = document.documentElement;
    const overflow = html.style.overflow;
    html.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("keydown", onKey);
      html.style.overflow = overflow;
      previous?.focus();
    };
  }, [close]);

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center sm:p-6" role="presentation">
      <div
        aria-hidden="true"
        onClick={close}
        className={`absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300 motion-reduce:transition-none ${open ? "opacity-100" : "opacity-0"}`}
      />
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        className={`relative max-h-[92svh] w-full overflow-y-auto overscroll-contain rounded-t-[28px] bg-surface px-5 pt-3 pb-10 shadow-[0_30px_80px_-20px_rgb(0_0_0/0.5)] outline-none transition-[translate,scale,opacity] duration-500 ease-[var(--ease-spring)] motion-reduce:transition-none sm:max-h-[88svh] sm:max-w-[880px] sm:rounded-[28px] sm:px-10 sm:pt-10 ${
          open ? "translate-y-0 opacity-100 sm:scale-100" : "translate-y-full opacity-100 sm:translate-y-4 sm:scale-[0.97] sm:opacity-0"
        }`}
      >
        <div aria-hidden="true" className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-fg-2/30 sm:hidden" />
        <button
          type="button"
          onClick={close}
          aria-label="Close"
          className="press absolute top-3 right-3 flex h-11 w-11 items-center justify-center rounded-full bg-bg-alt text-fg-2 hover:text-fg sm:top-5 sm:right-5"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <path d="M6 6l12 12M18 6 6 18" />
          </svg>
        </button>
        {children}
      </div>
    </div>
  );
}
