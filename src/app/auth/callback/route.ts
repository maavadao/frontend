import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { safeNext, siteOrigin } from "@/lib/urls";

/** Google and GitHub return here. Swap the one-time code for a session, then send new members to onboarding. */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const next = safeNext(searchParams.get("next"));
  const origin = siteOrigin(request);
  const code = searchParams.get("code");

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const { data: profile } = await supabase.from("profiles").select("id").eq("id", data.user.id).maybeSingle();
      const to = profile ? next : `/onboarding?next=${encodeURIComponent(next)}`;
      return NextResponse.redirect(`${origin}${to}`);
    }
  }

  // Supabase sends people back with error_code=otp_expired when an email link was already used,
  // opened in another browser, or opened by a mail scanner first.
  const expired = searchParams.get("error_code") === "otp_expired" || searchParams.get("error") === "access_denied";
  return NextResponse.redirect(`${origin}/login?error=${expired ? "expired" : "callback"}&next=${encodeURIComponent(next)}`);
}
