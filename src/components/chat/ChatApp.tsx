// Adapted from vercel/chatbot (components/chat/shell.tsx, messages.tsx, suggested-actions.tsx, greeting.tsx,
// hooks/use-active-chat.tsx), Copyright 2024 Vercel, Inc., Apache License 2.0.
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Icon } from "../Icon";
import { ChatInput, type ChatInputHandle } from "./ChatInput";
import { ChatMessage } from "./ChatMessage";
import { ChatSidebar } from "./ChatSidebar";
import { useScrollToBottom } from "./useScrollToBottom";
import type { ChatEvent, ChatModel } from "@/lib/chat";
import {
  loadConversations,
  newId,
  saveConversations,
  titleFor,
  toHistory,
  type Conversation,
  type ShownTurn,
} from "@/lib/chat-history";

const SUGGESTIONS = [
  { title: "Explain photosynthesis", detail: "as if I were 12 years old" },
  { title: "Help me plan a lesson", detail: "on fractions for a Year 5 class" },
  { title: "Quiz me", detail: "on the causes of the First World War" },
  { title: "Review my code", detail: "and explain what I could improve" },
];

/** Reads the newline-delimited JSON events that /api/chat streams. */
async function* readEvents(body: ReadableStream<Uint8Array>) {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";
    for (const line of lines) if (line.trim()) yield JSON.parse(line) as ChatEvent;
  }
  if (buffer.trim()) yield JSON.parse(buffer) as ChatEvent;
}

const MODEL_KEY = "maava_model";

export function ChatApp({ models }: { models: ChatModel[] }) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [streamingId, setStreamingId] = useState<string | null>(null);
  const [remaining, setRemaining] = useState<number | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [model, setModel] = useState("auto");
  const abort = useRef<AbortController | null>(null);
  const input = useRef<ChatInputHandle>(null);
  const { containerRef, isAtBottom, scrollToBottom, pin } = useScrollToBottom();

  useEffect(() => {
    // localStorage only exists in the browser, so history loads after hydration.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setConversations(loadConversations());
    setLoaded(true);
    try {
      const saved = localStorage.getItem(MODEL_KEY);
      if (saved && models.some((m) => m.id === saved && m.available)) setModel(saved);
    } catch {
      // Storage blocked: keep Auto.
    }
  }, [models]);

  function pickModel(id: string) {
    setModel(id);
    try {
      localStorage.setItem(MODEL_KEY, id);
    } catch {
      // Storage blocked: the choice lasts for this visit.
    }
  }

  useEffect(() => {
    if (loaded && !streamingId) saveConversations(conversations);
  }, [conversations, streamingId, loaded]);

  useEffect(() => () => abort.current?.abort(), []);

  const active = conversations.find((c) => c.id === activeId) ?? null;
  const turns = active?.turns ?? [];
  const busy = streamingId !== null;

  const setTurns = useCallback((id: string, update: (turns: ShownTurn[]) => ShownTurn[]) => {
    setConversations((all) =>
      all.map((c) => (c.id === id ? { ...c, turns: update(c.turns), updatedAt: Date.now() } : c)),
    );
  }, []);

  /** Sends `base` (ending on the member's message) and streams the reply into conversation `id`. */
  const run = useCallback(
    async (id: string, base: ShownTurn[]) => {
      const reply: ShownTurn = { role: "assistant", content: "" };
      setTurns(id, () => [...base, reply]);
      setStreamingId(id);
      pin();
      requestAnimationFrame(() => scrollToBottom("smooth"));

      const controller = new AbortController();
      abort.current = controller;
      const patch = (p: Partial<ShownTurn>) => setTurns(id, (t) => [...t.slice(0, -1), { ...t[t.length - 1], ...p }]);

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: toHistory(base), model }),
          signal: controller.signal,
        });
        if (!res.ok || !res.body) {
          const { error } = await res.json().catch(() => ({ error: null }));
          patch({ error: error ?? "Something went wrong. Please try again." });
          return;
        }
        const left = res.headers.get("X-Chat-Remaining");
        if (left !== null) setRemaining(Number(left));

        let content = "";
        let thinking = "";
        for await (const event of readEvents(res.body)) {
          if (event.type === "model") patch({ model: event.text });
          else if (event.type === "text") content += event.text;
          else if (event.type === "thinking") thinking += event.text;
          else patch({ error: event.text });
          if (event.type === "text" || event.type === "thinking") patch({ content, thinking: thinking || undefined });
        }
      } catch {
        if (!controller.signal.aborted) patch({ error: "The connection dropped. Please try again." });
      } finally {
        if (abort.current === controller) abort.current = null;
        setStreamingId(null);
        input.current?.focus();
      }
    },
    [model, pin, scrollToBottom, setTurns],
  );

  function send(text: string) {
    const content = text.trim();
    if (!content || busy) return;
    const user: ShownTurn = { role: "user", content };
    if (active) {
      run(active.id, [...active.turns, user]);
    } else {
      const id = newId();
      setConversations((all) => [{ id, title: titleFor([user]), updatedAt: Date.now(), turns: [] }, ...all]);
      setActiveId(id);
      run(id, [user]);
    }
  }

  /** Replaces the member's message at `index` and asks again from there. */
  function edit(index: number, text: string) {
    if (!active || busy || !text.trim()) return;
    const base = [...active.turns.slice(0, index), { role: "user" as const, content: text.trim() }];
    if (index === 0) setConversations((all) => all.map((c) => (c.id === active.id ? { ...c, title: titleFor(base) } : c)));
    run(active.id, base);
  }

  function regenerate() {
    if (!active || busy) return;
    run(active.id, active.turns.slice(0, -1));
  }

  function select(id: string) {
    setActiveId(id);
    setSidebarOpen(false);
    pin();
    requestAnimationFrame(() => scrollToBottom("instant"));
  }

  function newChat() {
    setActiveId(null);
    setSidebarOpen(false);
    input.current?.focus();
  }

  function remove(id: string) {
    if (id === streamingId) abort.current?.abort();
    setConversations((all) => all.filter((c) => c.id !== id));
    if (id === activeId) setActiveId(null);
  }

  return (
    <div className="flex h-[calc(100dvh-3.25rem)] overflow-hidden">
      <ChatSidebar
        conversations={conversations}
        activeId={activeId}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onSelect={select}
        onNew={newChat}
        onDelete={remove}
      />

      <section aria-label="Chat" className="relative flex min-w-0 flex-1 flex-col bg-bg">
        <div className="flex h-13 shrink-0 items-center gap-1 px-2 sm:px-3">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            aria-label="Show chat history"
            aria-expanded={sidebarOpen}
            aria-controls="chat-history"
            className="press flex h-11 w-11 items-center justify-center rounded-full text-fg-2 hover:text-fg md:hidden"
          >
            <Icon name="sidebar" className="h-5 w-5" />
          </button>
          <h1 className="min-w-0 flex-1 truncate px-1 text-callout font-medium text-fg-2">{active?.title ?? "New chat"}</h1>
          {active && (
            <button
              type="button"
              onClick={newChat}
              aria-label="New chat"
              title="New chat"
              className="press flex h-11 w-11 items-center justify-center rounded-full text-fg-2 hover:text-fg md:hidden"
            >
              <Icon name="plus" className="h-5 w-5" />
            </button>
          )}
        </div>

        <div ref={containerRef} className="flex-1 overflow-y-auto overscroll-contain">
          {turns.length === 0 ? (
            <div className="mx-auto flex min-h-full max-w-[760px] flex-col justify-center px-4 py-10 sm:px-6">
              <div className="text-center">
                <p className="text-callout font-semibold text-fg-2 sm:text-body">maava AI</p>
                <h2 className="mt-2 font-display text-display text-balance">What can I help with?</h2>
                <p className="mx-auto mt-4 max-w-[520px] text-lede text-pretty text-fg-2">
                  Free open AI models for the community and for students. Learn, teach, research, write and build.
                </p>
              </div>
              <ul className="mt-10 grid gap-2 sm:grid-cols-2 sm:gap-3">
                {SUGGESTIONS.map((s) => (
                  <li key={s.title}>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => send(`${s.title} ${s.detail}`)}
                      className="press flex min-h-14 w-full flex-col items-start rounded-2xl bg-bg-alt px-4 py-3 text-left hover:bg-fg/6"
                    >
                      <span className="text-callout font-medium">{s.title}</span>
                      <span className="text-callout text-fg-2">{s.detail}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <ol className="mx-auto grid max-w-[760px] gap-7 px-4 pt-4 pb-10 sm:px-6" aria-live="polite">
              {turns.map((t, i) => (
                <ChatMessage
                  key={`${active?.id}-${i}`}
                  turn={t}
                  streaming={streamingId === active?.id && i === turns.length - 1}
                  busy={busy}
                  isLast={i === turns.length - 1}
                  onEdit={t.role === "user" ? (text) => edit(i, text) : undefined}
                  onRegenerate={t.role === "assistant" ? regenerate : undefined}
                />
              ))}
            </ol>
          )}
        </div>

        <div className="relative shrink-0 px-4 pb-3 sm:px-6 sm:pb-4">
          <button
            type="button"
            onClick={() => scrollToBottom("smooth")}
            aria-label="Scroll to the latest message"
            tabIndex={isAtBottom ? -1 : 0}
            className={`press absolute -top-14 left-1/2 flex h-11 w-11 -translate-x-1/2 items-center justify-center rounded-full bg-surface text-fg-2 shadow-[0_2px_12px_rgb(0_0_0/0.12)] ring-1 ring-line hover:text-fg ${
              isAtBottom || turns.length === 0 ? "pointer-events-none scale-90 opacity-0" : "opacity-100"
            }`}
          >
            <Icon name="arrow-down" className="h-4 w-4" />
          </button>
          <div className="mx-auto max-w-[760px]">
            <ChatInput
              ref={input}
              busy={busy}
              onSend={send}
              onStop={() => abort.current?.abort()}
              models={models}
              model={model}
              onModel={pickModel}
            />
            <p className="mt-2 px-2 text-center text-caption text-pretty text-fg-2">
              AI can make mistakes, so check important facts. Free providers may use what you type to improve their models,
              so don&rsquo;t share personal information.
              {remaining !== null && ` ${remaining} messages left today.`}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
