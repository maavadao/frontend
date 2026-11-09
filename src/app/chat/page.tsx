import type { Metadata } from "next";
import Link from "next/link";
import { ChatView } from "@/components/ChatView";
import { getClaims } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Chat",
  description:
    "maavaDao Chat: free access to Claude for the maavaDao community and for students. Learn, teach, research, write and build.",
};

export default async function ChatPage() {
  const { claims } = await getClaims().catch(() => ({ claims: null }));

  return (
    <main className="bg-bg-alt pt-13">
      {claims ? (
        <ChatView />
      ) : (
        <div className="mx-auto max-w-[620px] px-4 pt-16 pb-24 text-center sm:px-6 sm:pt-24 sm:pb-32">
          <p className="text-callout font-semibold text-fg-2 sm:text-body">maavaDao Chat</p>
          <h1 className="mt-2 font-display text-display text-balance">Claude, free for our community.</h1>
          <p className="mt-5 text-lede text-pretty text-fg-2">
            We give students, teachers and community members free access to Claude to learn, teach, research and build.
            Joining maavaDao is free.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href={`/signup?next=${encodeURIComponent("/chat")}`}
              className="press flex min-h-11 items-center rounded-full bg-cta px-5 text-body font-medium text-white hover:bg-cta-hover"
            >
              Join maavaDao
            </Link>
            <Link
              href={`/login?next=${encodeURIComponent("/chat")}`}
              className="press flex min-h-11 items-center rounded-full bg-surface px-5 text-body font-medium"
            >
              Sign in
            </Link>
          </div>
        </div>
      )}
    </main>
  );
}
