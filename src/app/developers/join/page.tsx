import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Avatar } from "@/components/Avatar";
import { DirectoryForm } from "@/components/DirectoryForm";
import { developerPath } from "@/lib/developers";
import { getClaims } from "@/lib/supabase/server";
import { leaveDirectory } from "./actions";

export const metadata: Metadata = { title: "Join the developer directory" };

const NEXT = "/developers/join";

export default async function JoinDirectoryPage({ searchParams }: PageProps<"/developers/join">) {
  const { left } = await searchParams;
  const { supabase, claims } = await getClaims();

  if (!claims) {
    return (
      <main className="flex min-h-svh items-center justify-center bg-bg-alt px-4 pt-24 pb-16">
        <div className="w-full max-w-[460px] rounded-[28px] bg-surface p-8 text-center sm:p-10">
          <h1 className="text-title sm:text-[2rem]">Join the developer directory</h1>
          <p className="mt-3 text-body text-pretty text-fg-2">
            Sign in with GitHub and your contributions to open-source AI appear on your profile, so others can find you
            and build maava Community Agents with you.
          </p>
          <Link
            href={`/login?next=${encodeURIComponent(NEXT)}`}
            className="press mt-6 inline-flex min-h-12 items-center rounded-full bg-cta px-6 text-body font-medium text-white hover:bg-cta-hover"
          >
            Sign in to join
          </Link>
        </div>
      </main>
    );
  }

  const { data: profile } = await supabase.from("profiles").select("username").eq("id", claims.sub).maybeSingle();
  if (!profile) redirect(`/onboarding?next=${encodeURIComponent(NEXT)}`);

  const { data: entry } = await supabase
    .from("developer_directory")
    .select("github_login, display_name, bio, website, show_country")
    .eq("id", claims.sub)
    .maybeSingle();

  const githubLogin = (entry?.github_login as string | null) ?? (claims.user_metadata?.user_name as string | undefined) ?? null;
  const providers = (claims.app_metadata?.providers as string[] | undefined) ?? [];
  const hasGithub = providers.includes("github");

  return (
    <main className="flex min-h-svh items-center justify-center bg-bg-alt px-4 pt-24 pb-16">
      <div className="w-full max-w-[460px]">
        <div className="text-center">
          <Avatar login={hasGithub ? githubLogin : null} name={profile.username} size={72} className="mx-auto" />
          <h1 className="mt-5 text-title sm:text-[2rem]">{entry ? "Your directory listing" : "Join the developer directory"}</h1>
          <p className="mt-2 text-body text-pretty text-fg-2">
            {entry
              ? "You're listed on the developers page. Change what you share, or leave at any time."
              : "Choose what to share. Your username and role come from your profile."}
          </p>
          {left && !entry && <p className="mt-3 text-callout text-fg-2">You&rsquo;ve left the directory.</p>}
          {!hasGithub && (
            <p className="mt-3 text-footnote text-pretty text-fg-2">
              You signed in without GitHub, so your profile won&rsquo;t show contributions to open-source repos.
            </p>
          )}
        </div>

        <div className="mt-8 rounded-[28px] bg-surface p-6 sm:p-8">
          <DirectoryForm
            listed={!!entry}
            profilePath={developerPath((hasGithub && githubLogin) || profile.username)}
            initial={{
              display_name: (entry?.display_name as string | null) ?? "",
              bio: (entry?.bio as string | null) ?? "",
              website: (entry?.website as string | null) ?? "",
              show_country: (entry?.show_country as boolean | null) ?? false,
            }}
          />
        </div>

        {entry && (
          <form action={leaveDirectory} className="mt-4 text-center">
            <button type="submit" className="min-h-11 px-4 text-callout text-[#e30000] hover:underline dark:text-[#ff6961]">
              Leave the directory
            </button>
          </form>
        )}

        <p className="mt-6 text-center text-footnote text-fg-2">
          <Link className="text-link hover:underline" href="/developers">
            Back to developers
          </Link>
        </p>
      </div>
    </main>
  );
}
