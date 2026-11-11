// Adapted from vercel/chatbot (components/chat/multimodal-input.tsx), Copyright 2024 Vercel, Inc., Apache License 2.0.
"use client";

import { forwardRef, useImperativeHandle, useRef, useState, type FormEvent } from "react";
import { Icon } from "../Icon";
import { CHAT_LIMITS, type ChatModel } from "@/lib/chat";

export type ChatInputHandle = { focus: () => void };

type Props = {
  busy: boolean;
  onSend: (text: string) => void;
  onStop: () => void;
  models: ChatModel[];
  model: string;
  onModel: (id: string) => void;
};

/** The prompt box: grows with its text, Enter sends, Shift+Enter adds a line, Stop ends a reply, and the menu picks a model. */
export const ChatInput = forwardRef<ChatInputHandle, Props>(
  function ChatInput({ busy, onSend, onStop, models, model, onModel }, handle) {
    const [draft, setDraft] = useState("");
    const ref = useRef<HTMLTextAreaElement>(null);
    useImperativeHandle(handle, () => ({ focus: () => ref.current?.focus() }), []);

    const resize = () => {
      const el = ref.current;
      if (!el) return;
      el.style.height = "auto";
      el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
    };

    const send = () => {
      if (busy || !draft.trim()) return;
      onSend(draft);
      setDraft("");
      requestAnimationFrame(resize);
    };

    const nearLimit = draft.length > CHAT_LIMITS.message * 0.9;

    return (
      <form
        onSubmit={(e: FormEvent) => {
          e.preventDefault();
          send();
        }}
        className="card p-2"
      >
        <label htmlFor="chat-input" className="sr-only">
          Message maava AI
        </label>
        <textarea
          id="chat-input"
          ref={ref}
          rows={1}
          value={draft}
          maxLength={CHAT_LIMITS.message}
          autoFocus
          onChange={(e) => {
            setDraft(e.target.value);
            resize();
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
              e.preventDefault();
              send();
            }
          }}
          placeholder="Ask maava AI anything"
          className="block max-h-[200px] min-h-11 w-full resize-none bg-transparent px-3 pt-2.5 pb-1 text-body outline-none placeholder:text-fg-2"
        />
        <div className="flex items-center justify-between gap-2 pl-1">
          <div className="flex min-w-0 items-center gap-2">
            {models.length > 1 && (
              <>
                <label htmlFor="chat-model" className="sr-only">
                  Model
                </label>
                <select
                  id="chat-model"
                  value={model}
                  onChange={(e) => onModel(e.target.value)}
                  title={models.find((m) => m.id === model)?.description}
                  className="min-h-11 max-w-[60vw] truncate rounded-full bg-transparent px-2 text-callout text-fg-2 outline-none hover:bg-fg/6 hover:text-fg focus-visible:ring-2 focus-visible:ring-link sm:min-h-9 sm:max-w-[240px]"
                >
                  {models.map((m) => (
                    <option key={m.id} value={m.id} disabled={!m.available}>
                      {m.label}
                      {m.available ? "" : " (not available)"}
                    </option>
                  ))}
                </select>
              </>
            )}
            <span className="truncate text-caption text-fg-2" aria-live="polite">
              {nearLimit ? `${(CHAT_LIMITS.message - draft.length).toLocaleString("en-GB")} characters left` : ""}
            </span>
          </div>
          {busy ? (
            <button
              type="button"
              onClick={onStop}
              aria-label="Stop the reply"
              className="press flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-fg text-bg sm:h-9 sm:w-9"
            >
              <span className="h-3 w-3 rounded-[3px] bg-current" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={!draft.trim()}
              aria-label="Send"
              className="btn btn-primary h-11 w-11 shrink-0 !rounded-full disabled:bg-fg/15 disabled:text-fg-2 sm:h-9 sm:w-9"
            >
              <Icon name="arrow-up" className="h-4.5 w-4.5" />
            </button>
          )}
        </div>
      </form>
    );
  },
);
