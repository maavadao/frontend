// Adapted from vercel/chatbot (components/chat/message.tsx, message-actions.tsx), Copyright 2024 Vercel, Inc., Apache License 2.0.
"use client";

import { memo, useEffect, useRef, useState, type ReactNode } from "react";
import { Icon, type IconName } from "../Icon";
import { ChatReasoning } from "./ChatReasoning";
import { ChatResponse } from "./ChatResponse";
import type { ShownTurn } from "@/lib/chat-history";
import { CHAT_LIMITS } from "@/lib/chat";

function Action({ icon, label, onClick }: { icon: IconName; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className="press flex h-11 w-11 items-center justify-center rounded-full text-fg-2 hover:bg-fg/6 hover:text-fg sm:h-8 sm:w-8"
    >
      <Icon name={icon} className="h-4 w-4" />
    </button>
  );
}

function CopyAction({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(t);
  }, [copied]);
  return (
    <Action
      icon={copied ? "check" : "copy"}
      label={copied ? "Copied" : "Copy"}
      onClick={() => navigator.clipboard?.writeText(text).then(() => setCopied(true), () => {})}
    />
  );
}

/** Actions sit under each message: always visible on touch screens, on hover with a mouse. */
function Actions({ children, align }: { children: ReactNode; align: "start" | "end" }) {
  return (
    <div
      className={`-my-1 flex gap-0.5 transition-opacity duration-200 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover/message:opacity-100 [@media(hover:hover)]:group-focus-within/message:opacity-100 ${
        align === "end" ? "justify-end" : "-ml-2 sm:-ml-1.5"
      }`}
    >
      {children}
    </div>
  );
}

function EditBox({ initial, onSave, onCancel }: { initial: string; onSave: (text: string) => void; onCancel: () => void }) {
  const [text, setText] = useState(initial);
  const ref = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.focus();
    el.setSelectionRange(el.value.length, el.value.length);
    el.style.height = `${Math.min(el.scrollHeight, 320)}px`;
  }, []);
  return (
    <form
      className="w-full rounded-3xl bg-surface p-3 shadow-[0_1px_8px_rgb(0_0_0/0.08)]"
      onSubmit={(e) => {
        e.preventDefault();
        if (text.trim()) onSave(text);
      }}
    >
      <label htmlFor="chat-edit" className="sr-only">
        Edit your message
      </label>
      <textarea
        id="chat-edit"
        ref={ref}
        value={text}
        maxLength={CHAT_LIMITS.message}
        onChange={(e) => {
          setText(e.target.value);
          e.target.style.height = "auto";
          e.target.style.height = `${Math.min(e.target.scrollHeight, 320)}px`;
        }}
        onKeyDown={(e) => {
          if (e.key === "Escape") onCancel();
          if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
            e.preventDefault();
            if (text.trim()) onSave(text);
          }
        }}
        className="w-full resize-none bg-transparent px-2 py-1 text-body outline-none"
      />
      <div className="mt-2 flex justify-end gap-2">
        <button type="button" onClick={onCancel} className="press min-h-11 rounded-full px-4 text-callout text-fg-2 hover:text-fg sm:min-h-9">
          Cancel
        </button>
        <button
          type="submit"
          disabled={!text.trim()}
          className="press min-h-11 rounded-full bg-cta px-4 text-callout font-medium text-white hover:bg-cta-hover disabled:opacity-40 sm:min-h-9"
        >
          Send
        </button>
      </div>
    </form>
  );
}

function Writing() {
  return (
    <span className="inline-flex h-7 items-center gap-1" aria-label="maava AI is writing">
      {[0, 150, 300].map((d) => (
        <span key={d} className="h-2 w-2 animate-pulse rounded-full bg-fg-2" style={{ animationDelay: `${d}ms` }} />
      ))}
    </span>
  );
}

export const ChatMessage = memo(function ChatMessage({
  turn,
  streaming,
  busy,
  isLast,
  onEdit,
  onRegenerate,
}: {
  turn: ShownTurn;
  /** This is the reply that's arriving now. */
  streaming: boolean;
  /** A reply is arriving somewhere in this conversation. */
  busy: boolean;
  isLast: boolean;
  onEdit?: (text: string) => void;
  onRegenerate?: () => void;
}) {
  const [editing, setEditing] = useState(false);

  if (turn.role === "user") {
    return (
      <li className="group/message flex flex-col items-end gap-1.5">
        <span className="sr-only">You:</span>
        {editing && onEdit ? (
          <EditBox
            initial={turn.content}
            onCancel={() => setEditing(false)}
            onSave={(text) => {
              setEditing(false);
              onEdit(text);
            }}
          />
        ) : (
          <>
            <p className="max-w-[85%] rounded-3xl rounded-br-lg bg-bg-alt px-4 py-2.5 text-body whitespace-pre-wrap [overflow-wrap:anywhere]">
              {turn.content}
            </p>
            {!busy && (
              <Actions align="end">
                {onEdit && <Action icon="pencil" label="Edit" onClick={() => setEditing(true)} />}
                <CopyAction text={turn.content} />
              </Actions>
            )}
          </>
        )}
      </li>
    );
  }

  const thinkingNow = streaming && !!turn.thinking && !turn.content;
  return (
    <li className="group/message flex gap-3 sm:gap-4">
      <span
        aria-hidden="true"
        className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-bg-alt text-fg-2 ring-1 ring-line"
      >
        <Icon name="sparkle" className="h-3.5 w-3.5" />
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-2 [overflow-wrap:anywhere]">
        <span className="sr-only">maava AI:</span>
        {turn.thinking && <ChatReasoning text={turn.thinking} thinking={thinkingNow} />}
        {turn.content ? (
          <ChatResponse text={turn.content} streaming={streaming} />
        ) : streaming && !turn.thinking ? (
          <Writing />
        ) : null}
        {turn.error && (
          <p role="alert" className="rounded-2xl bg-bg-alt px-4 py-3 text-callout text-accent-text">
            {turn.error}
          </p>
        )}
        {!streaming && (turn.content || (isLast && onRegenerate)) && (
          <div className="flex flex-wrap items-center gap-x-2">
            <Actions align="start">
              {turn.content && <CopyAction text={turn.content} />}
              {isLast && onRegenerate && !busy && <Action icon="retry" label="Regenerate reply" onClick={onRegenerate} />}
            </Actions>
            {turn.model && <span className="text-caption text-fg-2">{turn.model}</span>}
          </div>
        )}
      </div>
    </li>
  );
});
