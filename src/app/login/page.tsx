import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthForm } from "@/components/AuthForm";
import { getClaims } from "@/lib/supabase/server";
import { safeNext } from "@/lib/urls";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const { next, error } = await searchParams;
  const to = safeNext(typeof next === "string" ? next : null);
  const { claims } = await getClaims();
  if (claims) redirect(`/onboarding?next=${encodeURIComponent(to)}`);

  return (
    <main className="flex min-h-svh items-center justify-center bg-bg-alt px-4 pt-24 pb-16">
      <AuthForm mode="login" next={to} error={error === "callback" || error === "signin" || error === "expired" ? error : undefined} />
    </main>
  );
}
