// Adapted from vercel/chatbot (components/ai-elements/reasoning.tsx), Copyright 2024 Vercel, Inc., Apache License 2.0.
"use client";

import { useEffect, useRef, useState } from "react";
import { Icon } from "../Icon";

/**
 * The model's reasoning, when it shares it: open while it streams, then folded away
 * under "Thought for N seconds" once the reply starts.
 */
export function ChatReasoning({ text, thinking }: { text: string; thinking: boolean }) {
  const [open, setOpen] = useState(thinking);
  const [seconds, setSeconds] = useState<number | null>(null);
  const started = useRef<number | null>(null);

  useEffect(() => {
    if (thinking) {
      started.current ??= Date.now();
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setOpen(true);
    } else if (started.current !== null) {
      setSeconds(Math.max(1, Math.round((Date.now() - started.current) / 1000)));
      started.current = null;
      setOpen(false);
    }
  }, [thinking]);

  const label = thinking
    ? "Thinking…"
    : seconds !== null
      ? `Thought for ${seconds} second${seconds === 1 ? "" : "s"}`
      : "Thoughts";

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="press -mx-2 flex min-h-11 items-center gap-1.5 rounded-full px-2 text-callout text-fg-2 hover:text-fg"
      >
        <span className={thinking ? "animate-pulse" : undefined}>{label}</span>
        <Icon name="chevron" className={`h-3.5 w-3.5 transition-transform duration-300 ${open ? "rotate-90" : ""}`} />
      </button>
      {open && (
        <p className="mt-1 border-l-2 border-line pl-4 text-callout whitespace-pre-wrap text-fg-2 [overflow-wrap:anywhere]">
          {text}
        </p>
      )}
    </div>
  );
}
