import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthForm } from "@/components/AuthForm";
import { ChatDemo } from "@/components/ChatDemo";
import { getClaims } from "@/lib/supabase/server";
import { safeNext } from "@/lib/urls";

export const metadata: Metadata = { title: "Join" };

export default async function SignupPage({ searchParams }: PageProps<"/signup">) {
  const { next, error } = await searchParams;
  const to = safeNext(typeof next === "string" ? next : null);
  const { claims } = await getClaims();
  if (claims) redirect(`/onboarding?next=${encodeURIComponent(to)}`);

  const err = error === "callback" || error === "signin" || error === "expired" ? error : undefined;

  // The form on the left and a looping maava AI demo on the right.
  return (
    <main className="bg-bg-alt px-4 pt-24 pb-16 sm:px-6 lg:flex lg:min-h-svh lg:items-center">
      <div className="mx-auto grid w-full max-w-[1100px] items-center gap-10 lg:grid-cols-2 lg:gap-16">
        <div className="flex justify-center">
          <AuthForm mode="signup" next={to} error={err} />
        </div>
        <div className="mx-auto w-full max-w-[520px]">
          <ChatDemo />
        </div>
      </div>
    </main>
  );
}
