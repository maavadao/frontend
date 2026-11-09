"use client";

import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { ChatMarkdown } from "./ChatMarkdown";
import type { ChatTurn } from "@/lib/chat";

const STORAGE_KEY = "maava_chat";
const ERROR_MARK = "\u0000";

type Shown = ChatTurn & { error?: string };

const STARTERS = [
  "Explain photosynthesis as if I were 12",
  "Help me plan a lesson on fractions",
  "Quiz me on the causes of the First World War",
  "Review my Python code and explain what to improve",
];

function load(): Shown[] {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

function save(turns: Shown[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(turns));
  } catch {
    // Private windows can refuse storage; the chat still works for this visit.
  }
}

/** The conversation to send: completed turns only, ending on the member's message. */
function history(turns: Shown[]): ChatTurn[] {
  const out: ChatTurn[] = [];
  for (const t of turns) {
    if (t.role === "assistant" && !t.content.trim()) {
      out.pop(); // A reply that never arrived: drop the question it answered too.
      continue;
    }
    out.push({ role: t.role, content: t.content });
  }
  return out;
}

export function ChatView() {
  const [turns, setTurns] = useState<Shown[]>([]);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [remaining, setRemaining] = useState<number | null>(null);
  const abort = useRef<AbortController | null>(null);
  const input = useRef<HTMLTextAreaElement>(null);
  const end = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Restore the last conversation after hydration (localStorage isn't available on the server).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTurns(load());
  }, []);

  useEffect(() => {
    if (!busy) save(turns);
    end.current?.scrollIntoView({ block: "end", behavior: busy ? "auto" : "smooth" });
  }, [turns, busy]);

  useEffect(() => () => abort.current?.abort(), []);

  const resize = () => {
    const el = input.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
  };

  async function send(text: string) {
    const content = text.trim();
    if (!content || busy) return;
    const next: Shown[] = [...turns, { role: "user", content }];
    setTurns([...next, { role: "assistant", content: "" }]);
    setDraft("");
    requestAnimationFrame(resize);
    setBusy(true);

    const controller = new AbortController();
    abort.current = controller;
    const update = (reply: Partial<Shown>) =>
      setTurns((all) => [...all.slice(0, -1), { ...all[all.length - 1], ...reply }]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history(next) }),
        signal: controller.signal,
      });
      if (!res.ok || !res.body) {
        const { error } = await res.json().catch(() => ({ error: null }));
        update({ error: error ?? "Something went wrong. Please try again." });
        return;
      }
      const left = res.headers.get("X-Chat-Remaining");
      if (left !== null) setRemaining(Number(left));

      const reader = res.body.pipeThrough(new TextDecoderStream()).getReader();
      let reply = "";
      for (;;) {
        const { value, done } = await reader.read();
        if (done) break;
        reply += value;
        const [answer, error] = reply.split(ERROR_MARK);
        update({ content: answer, error });
      }
    } catch {
      if (!controller.signal.aborted) update({ error: "The connection dropped. Please try again." });
    } finally {
      abort.current = null;
      setBusy(false);
      input.current?.focus();
    }
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    send(draft);
  }

  function onKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      send(draft);
    }
  }

  function newChat() {
    abort.current?.abort();
    setTurns([]);
    setRemaining(null);
    input.current?.focus();
  }

  return (
    <div className="mx-auto flex min-h-[calc(100svh-3.25rem)] w-full max-w-[760px] flex-col">
      <div className="flex-1 px-4 pt-8 pb-6 sm:px-6 sm:pt-12">
        {turns.length === 0 ? (
          <div className="pt-6 text-center sm:pt-14">
            <p className="text-callout font-semibold text-fg-2 sm:text-body">maavaDao Chat</p>
            <h1 className="mt-2 font-display text-display text-balance">Ask Claude anything.</h1>
            <p className="mx-auto mt-4 max-w-[520px] text-lede text-pretty text-fg-2">
              Free for the community and for students. Learn, teach, research, write and build.
            </p>
            <ul className="mt-10 grid gap-2 text-left sm:grid-cols-2 sm:gap-3">
              {STARTERS.map((s) => (
                <li key={s}>
                  <button
                    type="button"
                    onClick={() => send(s)}
                    className="press flex min-h-14 w-full items-center rounded-2xl bg-surface px-4 py-3 text-left text-callout hover:text-fg"
                  >
                    {s}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <ol className="grid gap-6" aria-live="polite">
            {turns.map((t, i) =>
              t.role === "user" ? (
                <li key={i} className="flex justify-end">
                  <p className="max-w-[85%] rounded-3xl bg-cta px-4 py-2.5 text-body whitespace-pre-wrap text-white [overflow-wrap:anywhere]">
                    {t.content}
                  </p>
                </li>
              ) : (
                <li key={i} className="text-body [overflow-wrap:anywhere]">
                  <span className="sr-only">Claude:</span>
                  {t.content ? (
                    <ChatMarkdown text={t.content} />
                  ) : busy && i === turns.length - 1 ? (
                    <span className="inline-flex gap-1 py-2" aria-label="Claude is writing">
                      {[0, 150, 300].map((d) => (
                        <span key={d} className="h-2 w-2 animate-pulse rounded-full bg-fg-2" style={{ animationDelay: `${d}ms` }} />
                      ))}
                    </span>
                  ) : null}
                  {t.error && (
                    <p role="alert" className="mt-2 rounded-2xl bg-surface px-4 py-3 text-callout text-accent-text">
                      {t.error}
                    </p>
                  )}
                </li>
              ),
            )}
          </ol>
        )}
        <div ref={end} />
      </div>

      <div className="sticky bottom-0 bg-gradient-to-t from-bg-alt from-70% to-transparent px-4 pt-6 pb-4 sm:px-6 sm:pb-6">
        <form onSubmit={onSubmit} className="flex items-end gap-2 rounded-[28px] bg-surface p-2 shadow-[0_1px_8px_rgb(0_0_0/0.08)]">
          <label htmlFor="chat-input" className="sr-only">
            Message Claude
          </label>
          <textarea
            id="chat-input"
            ref={input}
            rows={1}
            value={draft}
            maxLength={8000}
            onChange={(e) => {
              setDraft(e.target.value);
              resize();
            }}
            onKeyDown={onKeyDown}
            placeholder="Message Claude"
            className="max-h-[200px] min-h-11 flex-1 resize-none bg-transparent px-3 py-2.5 text-body outline-none placeholder:text-fg-2"
          />
          {busy ? (
            <button
              type="button"
              onClick={() => abort.current?.abort()}
              className="press flex h-11 shrink-0 items-center rounded-full bg-fg px-4 text-callout font-medium text-bg"
            >
              Stop
            </button>
          ) : (
            <button
              type="submit"
              disabled={!draft.trim()}
              className="press flex h-11 shrink-0 items-center rounded-full bg-cta px-4 text-callout font-medium text-white hover:bg-cta-hover disabled:opacity-40"
            >
              Send
            </button>
          )}
        </form>
        <div className="mt-2 flex min-h-11 flex-wrap items-center justify-between gap-x-4 px-2 text-caption text-fg-2">
          <p>
            Claude can make mistakes, so check important facts.
            {remaining !== null && ` ${remaining} messages left today.`}
          </p>
          {turns.length > 0 && (
            <button type="button" onClick={newChat} className="press -mx-2 min-h-11 px-2 text-link hover:underline">
              New chat
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
