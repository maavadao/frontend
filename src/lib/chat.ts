/**
 * maavaDao Chat: free access to Claude for the community and students, served by
 * POST /api/chat. The Anthropic key and limits are read on the server at runtime
 * (Secret Manager on Cloud Run, .env.local locally); the browser never sees the key.
 */

/** One turn of a conversation, as the browser sends it. Kept in the browser only. */
export type ChatTurn = { role: "user" | "assistant"; content: string };

/** Model, overridable with CHAT_MODEL. */
export const chatModel = () => process.env.CHAT_MODEL || "claude-opus-5-5";

/** Messages a member can send in a day, overridable with CHAT_DAILY_LIMIT. */
export const chatDailyLimit = () => Number(process.env.CHAT_DAILY_LIMIT) || 50;

/** Limits on what one request may carry, so a single request can't run up a large bill. */
export const CHAT_LIMITS = {
  /** Longest single message, in characters. */
  message: 8_000,
  /** Most turns sent back as history. */
  turns: 40,
  /** Whole conversation, in characters. */
  total: 60_000,
} as const;

export const CHAT_SYSTEM = `You are maavaDao Chat, a free assistant that maavaDao (maavadao.com) offers to its community: students, teachers, educators, developers and volunteers. maavaDao is a community-governed ecosystem of agentic AI and blockchain technologies for education; a share of every success funds education for deserving children, orphans and street children.

Help people learn, teach, research, write and build. Explain clearly and patiently, and adapt to the person's level: many are students, some are young, and English may not be their first language. When someone is learning, help them understand rather than just handing over answers to homework, unless they ask for the answer directly. Be honest when you're unsure, and say so rather than guessing. Use British spelling. Keep answers focused; use Markdown (headings, lists, code blocks) where it helps readability.`;

/** Checks a conversation from the browser. Returns the cleaned turns, or an error to show. */
export function parseTurns(input: unknown): { turns: ChatTurn[] } | { error: string } {
  if (!Array.isArray(input) || input.length === 0) return { error: "Send at least one message." };
  if (input.length > CHAT_LIMITS.turns) {
    return { error: "This conversation is too long. Start a new chat to keep going." };
  }
  const turns: ChatTurn[] = [];
  let total = 0;
  for (const [i, t] of input.entries()) {
    const role = i % 2 === 0 ? "user" : "assistant";
    if (!t || typeof t !== "object" || t.role !== role || typeof t.content !== "string") {
      return { error: "That conversation couldn't be read. Start a new chat." };
    }
    const content = t.content.trim();
    if (!content) return { error: "Messages can't be empty." };
    if (role === "user" && content.length > CHAT_LIMITS.message) {
      return { error: `Messages can be up to ${CHAT_LIMITS.message.toLocaleString("en-GB")} characters.` };
    }
    total += content.length;
    turns.push({ role, content });
  }
  if (turns.at(-1)!.role !== "user") return { error: "The last message must be yours." };
  if (total > CHAT_LIMITS.total) {
    return { error: "This conversation is too long. Start a new chat to keep going." };
  }
  return { turns };
}

/**
 * Per-member daily count, kept in this server's memory. It resets when the
 * instance restarts and isn't shared between Cloud Run instances, so it's a
 * guard against runaway use rather than an exact quota.
 */
const usage = new Map<string, { day: string; count: number }>();

export function takeChatAllowance(userId: string) {
  const day = new Date().toISOString().slice(0, 10);
  const limit = chatDailyLimit();
  const entry = usage.get(userId);
  const count = entry?.day === day ? entry.count : 0;
  if (count >= limit) return { ok: false as const, limit };
  usage.set(userId, { day, count: count + 1 });
  if (usage.size > 10_000) {
    for (const [id, e] of usage) if (e.day !== day) usage.delete(id);
  }
  return { ok: true as const, remaining: limit - count - 1, limit };
}
