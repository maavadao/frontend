import Anthropic from "@anthropic-ai/sdk";
import { CHAT_SYSTEM, chatModel, parseTurns, takeChatAllowance } from "@/lib/chat";
import { getClaims } from "@/lib/supabase/server";

/** Marks a problem in the streamed reply; the chat view shows what follows it as an error. */
const ERROR_MARK = "\u0000";

let client: Anthropic | undefined;

/**
 * Streams Claude's reply as plain text. Members only (any signed-in member),
 * with a daily allowance. The browser sends the whole conversation each time;
 * nothing is stored on our side.
 */
export async function POST(request: Request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json({ error: "Chat isn't switched on yet. Please check back soon." }, { status: 503 });
  }

  const { claims } = await getClaims().catch(() => ({ claims: null }));
  if (!claims) return Response.json({ error: "Sign in to chat." }, { status: 401 });

  const body = await request.json().catch(() => null);
  const parsed = parseTurns(body?.messages);
  if ("error" in parsed) return Response.json({ error: parsed.error }, { status: 400 });

  const allowance = takeChatAllowance(claims.sub);
  if (!allowance.ok) {
    return Response.json(
      { error: `You've used today's ${allowance.limit} messages. Your allowance resets at midnight (UTC).` },
      { status: 429 },
    );
  }

  client ??= new Anthropic();
  const stream = client.beta.messages.stream(
    {
      model: chatModel(),
      max_tokens: 16000,
      system: [{ type: "text", text: CHAT_SYSTEM, cache_control: { type: "ephemeral" } }],
      messages: parsed.turns,
      output_config: { effort: "low" },
      // If a safety classifier declines, the API retries on a fallback model it picks.
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
    },
    { signal: request.signal },
  );

  const encoder = new TextEncoder();
  const body$ = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (text: string) => controller.enqueue(encoder.encode(text));
      try {
        stream.on("text", send);
        const message = await stream.finalMessage();
        if (message.stop_reason === "refusal") {
          send(`${ERROR_MARK}Claude couldn't help with that request. Try asking in a different way.`);
        } else if (message.stop_reason === "max_tokens") {
          send(`${ERROR_MARK}The reply was cut short because it got too long. Ask Claude to continue.`);
        }
      } catch (err) {
        if (!request.signal.aborted) {
          console.error("chat stream failed", err);
          const busy = err instanceof Anthropic.RateLimitError || err instanceof Anthropic.InternalServerError;
          send(
            `${ERROR_MARK}${busy ? "Claude is busy right now. Please try again in a moment." : "Something went wrong. Please try again."}`,
          );
        }
      } finally {
        controller.close();
      }
    },
    cancel() {
      stream.abort();
    },
  });

  return new Response(body$, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Chat-Remaining": String(allowance.remaining),
    },
  });
}
