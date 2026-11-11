import type { ChatModel } from "./chat";

/**
 * maavaDao's free-llm-router (github.com/maavadao/free-llm-router): one OpenAI-compatible
 * endpoint over free-tier LLM providers. LLM_ROUTER_URL and LLM_ROUTER_TOKEN are
 * read on the server at runtime (Secret Manager on Cloud Run, .env.local locally).
 */
export function routerEnv() {
  const url = process.env.LLM_ROUTER_URL?.replace(/\/$/, "");
  const token = process.env.LLM_ROUTER_TOKEN;
  return url ? { url, token } : null;
}

export const routerHeaders = (token?: string): Record<string, string> =>
  // Not Authorization: Cloud Run would check a Bearer token as a Google identity token.
  token ? { "X-Router-Token": token } : {};

/** The models members can pick, from the router's /v1/models (cached for a minute). */
export async function listModels(): Promise<ChatModel[]> {
  const env = routerEnv();
  if (!env) return [];
  try {
    const res = await fetch(`${env.url}/v1/models`, {
      headers: routerHeaders(env.token),
      next: { revalidate: 60 },
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return [];
    const body = (await res.json()) as {
      data?: { id: string; label?: string; description?: string; available?: boolean; may_train?: boolean }[];
    };
    return (body.data ?? []).map((m) => ({
      id: m.id,
      label: m.label ?? m.id,
      description: m.description ?? "",
      available: m.available !== false,
      mayTrain: m.may_train === true,
    }));
  } catch {
    return [];
  }
}
