/**
 * Sign-in with Supabase Auth, with no passwords. Google and GitHub: the form posts
 * to /auth/signin and the provider returns to /auth/callback. Email: a Server Action
 * (src/app/auth/email/actions.ts) emails a 6-digit code and a link; the member types
 * the code, or opens the link, which also lands on /auth/callback. First-timers go
 * on to /onboarding to choose a username, country and role.
 */
export type Provider = "google" | "github";

/** Display-only check for the nav: is a Supabase session cookie present? Pages verify on the server. */
export function hasSessionCookie() {
  return document.cookie.split("; ").some((c) => /^sb-.+-auth-token(\.\d+)?=/.test(c));
}
