import type { NextRequest } from "next/server";

/** A same-site path to return to after signing in. Anything else falls back to the home page. */
export function safeNext(value: string | null | undefined) {
  return value && value.startsWith("/") && !value.startsWith("//") && !value.startsWith("/\\") ? value : "/";
}

/** The public origin. Behind Cloud Run or another proxy, prefer the forwarded host. */
export function siteOrigin(request: NextRequest) {
  return originFromHeaders(request.headers) ?? request.nextUrl.origin;
}

/** The forwarded public origin behind a proxy, if any. Server Actions fall back to the request's Origin header. */
export function originFromHeaders(headers: Headers) {
  const host = process.env.NODE_ENV !== "development" && headers.get("x-forwarded-host");
  return host ? `${headers.get("x-forwarded-proto") ?? "https"}://${host}` : null;
}
