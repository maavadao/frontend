import type { ChatTurn } from "./chat";

/**
 * Chat history for maava AI, kept in the member's own browser
 * (localStorage). Nothing is stored on our servers, so clearing site data or
 * switching device starts fresh.
 */

/** A turn as the chat view shows it: an assistant turn can also carry who answered, thinking and an error. */
export type ShownTurn = ChatTurn & { model?: string; thinking?: string; error?: string };

export type Conversation = { id: string; title: string; updatedAt: number; turns: ShownTurn[] };

const KEY = "maava_chats";
const LEGACY_KEY = "maava_chat";
/** Oldest conversations past this are dropped, so storage stays small. */
const MAX = 50;

export function loadConversations(): Conversation[] {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) ?? "null");
    if (Array.isArray(saved)) return saved.filter(isConversation);
    // The first version of the chat kept one conversation under another key.
    const legacy = JSON.parse(localStorage.getItem(LEGACY_KEY) ?? "null");
    localStorage.removeItem(LEGACY_KEY);
    if (Array.isArray(legacy) && legacy.length) {
      return [{ id: newId(), title: titleFor(legacy), updatedAt: Date.now(), turns: legacy }];
    }
  } catch {
    // Unreadable or blocked storage: start with no history.
  }
  return [];
}

export function saveConversations(all: Conversation[]) {
  try {
    const kept = [...all].sort((a, b) => b.updatedAt - a.updatedAt).slice(0, MAX);
    localStorage.setItem(KEY, JSON.stringify(kept));
  } catch {
    // Private windows can refuse storage; the chat still works for this visit.
  }
}

export function newId() {
  return typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}${Math.random().toString(36).slice(2)}`;
}

/** The first message, trimmed to a sidebar-sized title. */
export function titleFor(turns: ChatTurn[]) {
  const first = turns.find((t) => t.role === "user")?.content.replace(/\s+/g, " ").trim() ?? "";
  return first.length > 60 ? `${first.slice(0, 57).trimEnd()}…` : first || "New chat";
}

/** Groups conversations for the sidebar, newest first. */
export function groupByDate(all: Conversation[], now = new Date()) {
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const day = 86_400_000;
  const groups: { label: string; items: Conversation[] }[] = [
    { label: "Today", items: [] },
    { label: "Yesterday", items: [] },
    { label: "Previous 7 days", items: [] },
    { label: "Previous 30 days", items: [] },
    { label: "Older", items: [] },
  ];
  for (const c of [...all].sort((a, b) => b.updatedAt - a.updatedAt)) {
    const at = c.updatedAt;
    const i = at >= start ? 0 : at >= start - day ? 1 : at >= start - 7 * day ? 2 : at >= start - 30 * day ? 3 : 4;
    groups[i].items.push(c);
  }
  return groups.filter((g) => g.items.length);
}

/** The conversation to send: completed turns only, ending on the member's latest message. */
export function toHistory(turns: ShownTurn[]): ChatTurn[] {
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

function isConversation(c: unknown): c is Conversation {
  return !!c && typeof c === "object" && typeof (c as Conversation).id === "string" && Array.isArray((c as Conversation).turns);
}
