import type { Metadata } from "next";
import Link from "next/link";
import { Icon, type IconName } from "@/components/Icon";
import { ReferralForm, SupporterForm, WithdrawReferral } from "@/components/GetInvolved";
import { Reveal } from "@/components/Reveal";
import { countries } from "@/lib/countries";
import { timeAgo } from "@/lib/repos";
import { getClaims } from "@/lib/supabase/server";
import { helpWays, isHelpWay, referralKinds } from "@/lib/supporters";

export const metadata: Metadata = {
  title: "Get involved",
  description:
    "Everyone is welcome at maavaDao. Volunteer, refer a school or orphanage, teach, translate or spread the word, and help children in need.",
};

const icons: Record<string, IconName> = {
  volunteer: "hand",
  refer: "school",
  teach: "people",
  spread: "signal",
  translate: "globe",
  fundraise: "heart",
  feedback: "star",
};

const STATUS: Record<string, { label: string; className: string }> = {
  new: { label: "Received", className: "bg-fg/8 text-fg-2" },
  contacted: { label: "We've been in touch", className: "bg-[#0a84ff]/12 text-[#0a64d6] dark:text-[#64aaff]" },
  supporting: { label: "Supported by maava", className: "bg-[#34c759]/15 text-[#1d7a35] dark:text-[#4cd964]" },
  closed: { label: "Closed", className: "bg-fg/8 text-fg-2" },
};

type Referral = { id: number; kind: string; name: string; place: string; country: string; status: string; created_at: string };

async function member() {
  const { supabase, claims } = await getClaims();
  if (!claims) return null;
  const { data: profile } = await supabase.from("profiles").select("username, country").eq("id", claims.sub).maybeSingle();
  if (!profile) return { profile: null } as const;
  const [supporter, referrals] = await Promise.all([
    supabase.from("supporters").select("ways, availability, skills, message, show_on_wall").eq("user_id", claims.sub).maybeSingle(),
    supabase
      .from("referrals")
      .select("id, kind, name, place, country, status, created_at")
      .eq("user_id", claims.sub)
      .order("created_at", { ascending: false }),
  ]);
  return {
    profile: profile as { username: string; country: string },
    supporter: supporter.data as {
      ways: string[];
      availability: string | null;
      skills: string | null;
      message: string | null;
      show_on_wall: boolean;
    } | null,
    referrals: (referrals.data as Referral[] | null) ?? [],
  };
}

export default async function GetInvolvedPage({ searchParams }: PageProps<"/get-involved">) {
  const { welcome, way } = await searchParams;
  // Ways picked on the home page arrive as ?way=refer&way=teach.
  const picked = [way ?? []].flat().filter(isHelpWay);
  const here = `/get-involved${picked.length ? `?${picked.map((w) => `way=${w}`).join("&")}` : ""}`;
  const me = await member().catch(() => null);

  return (
    <main className="bg-bg-alt px-4 pt-28 pb-20 sm:px-6 sm:pt-32 sm:pb-28 lg:pb-36">
      <div className="mx-auto max-w-[1100px]">
        <Reveal className="mx-auto max-w-[760px] text-center">
          <p className="text-callout font-semibold text-fg-2 sm:text-body">Get involved</p>
          <h1 className="mt-2 font-display text-display text-balance">
            Everyone is <span className="text-brand">welcome</span> here.
          </h1>
          <p className="mt-5 text-lede text-pretty text-fg-2">
            You don&apos;t need to write code to belong to maavaDao. Volunteers, students, teachers, parents and anyone
            who cares are as much a part of this community as developers. Every hour you give, every school or orphanage
            you tell us about, helps a child in need.
          </p>
        </Reveal>

        {welcome && me?.profile && (
          <Reveal className="mx-auto mt-10 max-w-[760px] rounded-[28px] bg-surface p-6 text-center sm:p-8">
            <p className="text-title">Welcome to maavaDao, {me.profile.username}!</p>
            <p className="mt-2 text-body text-pretty text-fg-2">
              Thank you for joining. Tell us how you&apos;d like to help below, and the team will be in touch.
            </p>
          </Reveal>
        )}

        <Reveal delay={80} as="ul" className="mt-10 gallery sm:mt-14 sm:grid sm:grid-cols-2 sm:gap-5 lg:grid-cols-4">
          {helpWays.map((w) => (
            <li key={w.id} className="flex h-full flex-col rounded-[28px] bg-surface p-6">
              <span className="flex h-11 w-11 items-center justify-center rounded-[12px] bg-bg-alt text-cta">
                <Icon name={icons[w.id]} className="h-6 w-6" />
              </span>
              <h2 className="mt-4 text-headline">{w.label}</h2>
              <p className="mt-1.5 text-callout text-pretty text-fg-2">{w.hint}.</p>
            </li>
          ))}
          <li className="flex h-full flex-col rounded-[28px] bg-surface p-6">
            <span className="flex h-11 w-11 items-center justify-center rounded-[12px] bg-bg-alt text-cta">
              <Icon name="code" className="h-6 w-6" />
            </span>
            <h2 className="mt-4 text-headline">Build with us</h2>
            <p className="mt-1.5 text-callout text-pretty text-fg-2">
              Developers can improve or add{" "}
              <Link href="/agents" className="text-link hover:underline">
                maava Community Agents
              </Link>{" "}
              and earn from them.
            </p>
          </li>
        </Reveal>

        <div className="mx-auto mt-12 grid max-w-[760px] gap-6 sm:mt-16">
          {!me ? (
            <Reveal className="rounded-[28px] bg-surface p-6 text-center sm:p-10">
              <h2 className="text-title">Join to get involved</h2>
              <p className="mt-2 text-body text-pretty text-fg-2">
                Create a free account with your email, Google or GitHub. It takes a minute, and then you can tell us how
                you&apos;d like to help and refer schools and orphanages.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <Link
                  href={`/signup?next=${encodeURIComponent(here)}`}
                  className="press inline-flex min-h-12 items-center rounded-full bg-cta px-6 text-body font-medium text-white hover:bg-cta-hover"
                >
                  Join maavaDao
                </Link>
                <Link
                  href={`/login?next=${encodeURIComponent(here)}`}
                  className="press inline-flex min-h-12 items-center rounded-full border border-line bg-field px-6 text-body font-medium hover:border-cta"
                >
                  Sign in
                </Link>
              </div>
            </Reveal>
          ) : !me.profile ? (
            <Reveal className="rounded-[28px] bg-surface p-6 text-center sm:p-10">
              <h2 className="text-title">One more step</h2>
              <p className="mt-2 text-body text-fg-2">Choose a username and your country, then come back here.</p>
              <Link
                href={`/onboarding?next=${encodeURIComponent(here)}`}
                className="press mt-6 inline-flex min-h-12 items-center rounded-full bg-cta px-6 text-body font-medium text-white hover:bg-cta-hover"
              >
                Finish setting up
              </Link>
            </Reveal>
          ) : (
            <>
              <Reveal className="rounded-[28px] bg-surface p-6 sm:p-8">
                <SupporterForm
                  isNew={!me.supporter}
                  initial={{
                    ways: me.supporter?.ways ?? picked,
                    availability: me.supporter?.availability ?? "",
                    skills: me.supporter?.skills ?? "",
                    message: me.supporter?.message ?? "",
                    showOnWall: me.supporter?.show_on_wall ?? true,
                  }}
                />
              </Reveal>

              <Reveal className="scroll-mt-24 rounded-[28px] bg-surface p-6 sm:p-8">
                <h2 id="refer" className="scroll-mt-28 text-title">
                  Refer a school or orphanage
                </h2>
                <p className="mt-2 mb-5 text-body text-pretty text-fg-2">
                  Know a school, orphanage or community group whose children could use free AI tools or maava&apos;s
                  support? Tell us about it. Only the maavaDao team sees your referrals.
                </p>
                <ReferralForm defaultCountry={me.profile.country} />
              </Reveal>

              {me.referrals.length > 0 && (
                <section aria-labelledby="your-referrals" className="rounded-[28px] bg-surface p-6 sm:p-8">
                  <h2 id="your-referrals" className="text-title">
                    Your referrals
                  </h2>
                  <ul className="mt-4 divide-y divide-line">
                    {me.referrals.map((r) => {
                      const status = STATUS[r.status] ?? STATUS.new;
                      return (
                        <li key={r.id} className="flex flex-wrap items-center gap-x-3 gap-y-1 py-3">
                          <div className="min-w-0 flex-1">
                            <p className="text-body font-medium [overflow-wrap:anywhere]">{r.name}</p>
                            <p className="text-footnote text-fg-2">
                              {referralKinds.find((k) => k.id === r.kind)?.label} · {r.place},{" "}
                              {countries.find((c) => c.code === r.country)?.name ?? r.country} · {timeAgo(r.created_at)}
                            </p>
                          </div>
                          <span className={`rounded-full px-2.5 py-0.5 text-caption font-medium ${status.className}`}>
                            {status.label}
                          </span>
                          {r.status === "new" && <WithdrawReferral id={r.id} />}
                        </li>
                      );
                    })}
                  </ul>
                </section>
              )}
            </>
          )}
        </div>
      </div>
    </main>
  );
}
