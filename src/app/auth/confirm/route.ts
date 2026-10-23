import type { EmailOtpType } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { NEXT_COOKIE } from "@/lib/auth";
import { safeNext, siteOrigin } from "@/lib/urls";

/**
 * The link in the sign-in email lands here. It carries a one-time token hash rather than a PKCE
 * code, so it works in any browser or mail app, not only the one that asked for the email.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const origin = siteOrigin(request);
  const tokenHash = searchParams.get("token_hash");
  const type = (searchParams.get("type") ?? "email") as EmailOtpType;
  const cookieStore = await cookies();
  const next = safeNext(searchParams.get("next") ?? cookieStore.get(NEXT_COOKIE)?.value);

  if (tokenHash) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type });
    if (!error && data.user) {
      cookieStore.delete(NEXT_COOKIE);
      const { data: profile } = await supabase.from("profiles").select("id").eq("id", data.user.id).maybeSingle();
      return NextResponse.redirect(`${origin}${profile ? next : `/onboarding?next=${encodeURIComponent(next)}`}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=expired&next=${encodeURIComponent(next)}`);
}
