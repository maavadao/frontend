// Adapted from vercel/chatbot (components/chat/sidebar-history.tsx, sidebar-history-item.tsx), Copyright 2024 Vercel, Inc., Apache License 2.0.
"use client";

import { Icon } from "../Icon";
import { groupByDate, type Conversation } from "@/lib/chat-history";

/**
 * Past conversations, grouped by date. A column beside the chat on wide
 * screens; a sheet that slides over it on phones.
 */
export function ChatSidebar({
  conversations,
  activeId,
  open,
  onClose,
  onSelect,
  onNew,
  onDelete,
}: {
  conversations: Conversation[];
  activeId: string | null;
  open: boolean;
  onClose: () => void;
  onSelect: (id: string) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
}) {
  const groups = groupByDate(conversations.filter((c) => c.turns.length));

  return (
    <>
      <div
        aria-hidden="true"
        onClick={onClose}
        className={`fixed inset-0 top-13 z-30 bg-ink/40 transition-opacity duration-300 md:hidden ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />
      <aside
        id="chat-history"
        aria-label="Chat history"
        className={`fixed top-13 bottom-0 left-0 z-40 flex w-[min(300px,85vw)] flex-col bg-bg-alt transition-transform duration-500 ease-[var(--ease-spring)] md:static md:z-auto md:w-[260px] md:translate-x-0 md:border-r md:border-line md:transition-none ${
          open ? "translate-x-0" : "-translate-x-full"
        } ${open ? "" : "max-md:invisible"}`}
      >
        <div className="p-3">
          <button
            type="button"
            onClick={onNew}
            className="press flex min-h-11 w-full items-center gap-2 rounded-full bg-surface px-4 text-callout font-medium ring-1 ring-line hover:text-fg"
          >
            <Icon name="plus" className="h-4 w-4" />
            New chat
          </button>
        </div>
        <nav aria-label="Conversations" className="flex-1 overflow-y-auto px-3 pb-4">
          {groups.length === 0 ? (
            <p className="px-3 py-2 text-footnote text-fg-2">
              Your chats appear here. They&rsquo;re saved in this browser only.
            </p>
          ) : (
            groups.map((g) => (
              <section key={g.label} className="mt-3 first:mt-0">
                <h2 className="px-3 py-1.5 text-caption font-medium text-fg-2">{g.label}</h2>
                <ul>
                  {g.items.map((c) => {
                    const active = c.id === activeId;
                    return (
                      <li key={c.id} className="group/item relative">
                        <button
                          type="button"
                          onClick={() => onSelect(c.id)}
                          aria-current={active ? "page" : undefined}
                          className={`flex min-h-11 w-full items-center rounded-xl py-2 pr-11 pl-3 text-left text-callout sm:min-h-9 ${
                            active ? "bg-fg/8 text-fg" : "text-fg/80 hover:bg-fg/5 hover:text-fg"
                          }`}
                        >
                          <span className="truncate">{c.title}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => onDelete(c.id)}
                          aria-label={`Delete “${c.title}”`}
                          title="Delete"
                          className="press absolute top-0 right-0 flex h-11 w-11 items-center justify-center rounded-xl text-fg-2 hover:text-accent-text sm:h-9 sm:w-9 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover/item:opacity-100 [@media(hover:hover)]:focus-visible:opacity-100"
                        >
                          <Icon name="trash" className="h-4 w-4" />
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </section>
            ))
          )}
        </nav>
      </aside>
    </>
  );
}
