import type { Metadata } from "next";
import Link from "next/link";
import { ChatApp } from "@/components/chat/ChatApp";
import { listModels } from "@/lib/free-llm-router";
import { getClaims } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "maava AI",
  description:
    "maava AI: free access to open AI models for the maavaDao community and for students. Learn, teach, research, write and build.",
};

export default async function ChatPage() {
  const { claims } = await getClaims().catch(() => ({ claims: null }));
  const models = claims ? await listModels() : [];

  return (
    <main className={claims ? "bg-bg pt-13" : "bg-bg-alt pt-13"} data-app={claims ? "" : undefined}>
      {claims ? (
        <ChatApp models={models} />
      ) : (
        <div className="mx-auto max-w-[620px] px-4 pt-16 pb-24 text-center sm:px-6 sm:pt-24 sm:pb-32">
          <p className="text-callout kicker sm:text-body">maava AI</p>
          <h1 className="mt-2 text-display text-balance">Free AI for our community.</h1>
          <p className="mt-5 text-lede text-pretty text-fg-2">
            maava AI gives students, teachers and community members free access to open AI models to learn, teach,
            research and build.
            Joining maavaDao is free.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href={`/signup?next=${encodeURIComponent("/chat")}`}
              className="btn btn-primary min-h-11 px-5 text-body"
            >
              Join maavaDao
            </Link>
            <Link
              href={`/login?next=${encodeURIComponent("/chat")}`}
              className="btn btn-ghost min-h-11 px-5 text-body"
            >
              Sign in
            </Link>
          </div>
        </div>
      )}
    </main>
  );
}
