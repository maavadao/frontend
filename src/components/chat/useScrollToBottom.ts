// Adapted from vercel/chatbot (hooks/use-scroll-to-bottom.tsx), Copyright 2024 Vercel, Inc., Apache License 2.0.

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Keeps a scroll container pinned to the bottom while a reply streams in, but
 * lets go as soon as the reader scrolls up, and reports whether they're at the
 * bottom so a "scroll to bottom" button can appear.
 */
export function useScrollToBottom() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const atBottom = useRef(true);
  const userScrolling = useRef(false);

  const scrollToBottom = useCallback((behavior: ScrollBehavior = "smooth") => {
    const el = containerRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior });
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    let timer: ReturnType<typeof setTimeout>;
    const onScroll = () => {
      userScrolling.current = true;
      clearTimeout(timer);
      const bottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 100;
      atBottom.current = bottom;
      setIsAtBottom(bottom);
      timer = setTimeout(() => (userScrolling.current = false), 150);
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      el.removeEventListener("scroll", onScroll);
      clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const follow = () => {
      if (!atBottom.current || userScrolling.current) return;
      requestAnimationFrame(() => el.scrollTo({ top: el.scrollHeight, behavior: "instant" }));
    };
    const mutations = new MutationObserver(follow);
    mutations.observe(el, { childList: true, subtree: true, characterData: true });
    const sizes = new ResizeObserver(follow);
    sizes.observe(el);
    for (const child of el.children) sizes.observe(child);
    return () => {
      mutations.disconnect();
      sizes.disconnect();
    };
  }, []);

  /** Pin to the bottom again, for a new message or a different conversation. */
  const pin = useCallback(() => {
    atBottom.current = true;
    userScrolling.current = false;
    setIsAtBottom(true);
  }, []);

  return { containerRef, isAtBottom, scrollToBottom, pin };
}
