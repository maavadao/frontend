import { CHAT_SYSTEM, isModelId, parseTurns, takeChatAllowance, type ChatEvent } from "@/lib/chat";
import { routerEnv, routerHeaders } from "@/lib/free-llm-router";
import { thinkTagSplitter } from "@/lib/think-tags";
import { getClaims } from "@/lib/supabase/server";

type Delta = { content?: string | null; reasoning_content?: string | null; reasoning?: string | null };
type Chunk = { choices?: { delta?: Delta; finish_reason?: string | null }[]; error?: { message?: string } };

/**
 * Streams a maava AI reply as newline-delimited JSON (`ChatEvent`s). Members
 * only (any signed-in member), with a daily allowance. The reply comes from
 * maavaDao's free-llm-router, which picks a free provider; this route turns its
 * OpenAI-style stream into our events. Nothing is stored on our side.
 */
export async function POST(request: Request) {
  const router = routerEnv();
  if (!router) {
    return Response.json({ error: "maava AI isn't switched on yet. Please check back soon." }, { status: 503 });
  }

  const { claims } = await getClaims().catch(() => ({ claims: null }));
  if (!claims) return Response.json({ error: "Sign in to chat." }, { status: 401 });

  const body = await request.json().catch(() => null);
  const parsed = parseTurns(body?.messages);
  if ("error" in parsed) return Response.json({ error: parsed.error }, { status: 400 });
  const model = isModelId(body?.model) ? body.model : "auto";

  const allowance = takeChatAllowance(claims.sub);
  if (!allowance.ok) {
    return Response.json(
      { error: `You've used today's ${allowance.limit} messages. Your allowance resets at midnight (UTC).` },
      { status: 429 },
    );
  }

  let upstream: Response;
  try {
    upstream = await fetch(`${router.url}/v1/chat/completions`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Router-User": claims.sub, ...routerHeaders(router.token) },
      body: JSON.stringify({
        model,
        stream: true,
        messages: [{ role: "system", content: CHAT_SYSTEM }, ...parsed.turns],
      }),
      signal: request.signal,
    });
  } catch {
    return Response.json({ error: "maava AI can't be reached right now. Please try again in a moment." }, { status: 502 });
  }
  if (!upstream.ok || !upstream.body) {
    const detail = (await upstream.json().catch(() => null)) as Chunk | null;
    const message =
      upstream.status === 429 || upstream.status === 503 || upstream.status === 404
        ? detail?.error?.message
        : null;
    return Response.json(
      { error: message ?? "Something went wrong. Please try again." },
      { status: upstream.status === 429 ? 429 : 502 },
    );
  }

  const provider = upstream.headers.get("X-Router-Provider");
  const answeredBy = upstream.headers.get("X-Router-Model");
  const encoder = new TextEncoder();
  const source = upstream.body;

  const events = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (event: ChatEvent) => controller.enqueue(encoder.encode(`${JSON.stringify(event)}\n`));
      if (provider && answeredBy) send({ type: "model", text: `${answeredBy} · ${provider}` });

      const reader = source.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let finish: string | null | undefined;
      let wrote = false;
      const reply = thinkTagSplitter((kind, text) => {
        if (kind === "text" && text.trim()) wrote = true;
        send({ type: kind, text });
      });
      const handle = (line: string) => {
        if (!line.startsWith("data:")) return;
        const data = line.slice(5).trim();
        if (!data || data === "[DONE]") return;
        let chunk: Chunk;
        try {
          chunk = JSON.parse(data);
        } catch {
          return;
        }
        if (chunk.error) {
          send({ type: "error", text: "The model stopped with an error. Please try again." });
          return;
        }
        const choice = chunk.choices?.[0];
        const thinking = choice?.delta?.reasoning_content ?? choice?.delta?.reasoning;
        if (thinking) send({ type: "thinking", text: thinking });
        if (choice?.delta?.content) reply.push(choice.delta.content);
        if (choice?.finish_reason) finish = choice.finish_reason;
      };

      try {
        for (;;) {
          const { value, done } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split(/\r?\n/);
          buffer = lines.pop() ?? "";
          lines.forEach(handle);
        }
        handle(buffer);
        reply.end();
        if (finish === "length") {
          send({ type: "error", text: "The reply was cut short because it got too long. Ask maava AI to continue." });
        } else if (finish === "content_filter") {
          send({ type: "error", text: "The model couldn't help with that request. Try asking in a different way." });
        } else if (!wrote) {
          send({ type: "error", text: "The model didn't reply. Please try again, or pick another model." });
        }
      } catch {
        if (!request.signal.aborted) send({ type: "error", text: "The connection dropped. Please try again." });
      } finally {
        controller.close();
      }
    },
    cancel() {
      void source.cancel();
    },
  });

  return new Response(events, {
    headers: {
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Chat-Remaining": String(allowance.remaining),
    },
  });
}
