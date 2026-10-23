import Link from "next/link";
import { connection } from "next/server";
import { Reveal } from "./Reveal";
import { countries } from "@/lib/countries";
import { getCommunityWall } from "@/lib/community-wall";

const roleLabels: Record<string, string> = {
  student: "Student",
  developer: "Developer",
  contributor: "Contributor",
  educator: "Educator",
  volunteer: "Volunteer",
  organisation: "Organisation",
  funder: "Partner",
};

/** The country's flag, from its two-letter code. */
const flag = (code: string) => String.fromCodePoint(...[...code.toUpperCase()].map((c) => 0x1f1a5 + c.charCodeAt(0)));

/** Volunteers, students, teachers and other supporters who chose to appear on the home page. */
export async function CommunityWall() {
  // Render per request, not at build: Supabase's settings exist only at runtime, so a build-time
  // render was always empty. The data itself stays cached (src/lib/community-wall.ts).
  await connection();
  const wall = await getCommunityWall();
  const people = wall?.people ?? [];

  return (
    <section id="community" className="bg-bg px-4 py-16 sm:px-6 sm:py-24 lg:py-32">
      <div className="mx-auto max-w-[1100px]">
        <Reveal className="mx-auto max-w-[760px] text-center">
          <p className="text-callout font-semibold text-fg-2 sm:text-body">Our community</p>
          <h2 className="mt-2 font-display text-display text-balance">
            If you want to help, <span className="text-brand">you belong here.</span>
          </h2>
          <p className="mt-5 text-lede text-pretty text-fg-2">
            Anyone with the desire to make a difference can be part of maavaDao. No title, degree or line of code
            needed. Volunteers, students, teachers, parents and supporters stand alongside our developers, and every one
            of them helps children in need.
          </p>
        </Reveal>

        {people.length > 0 ? (
          <Reveal delay={80} className="mt-10 sm:mt-14">
            <p className="text-center text-callout text-fg-2">
              {wall!.total === 1 ? "1 person is" : `${wall!.total.toLocaleString("en-GB")} people are`} helping so far
              {wall!.total > people.length ? `. Here are the newest ${people.length}.` : "."}
            </p>
            <ul aria-label="Supporters" className="mt-6 flex flex-wrap justify-center gap-2 sm:gap-3">
              {people.map((p) => {
                const country = countries.find((c) => c.code === p.country)?.name ?? p.country;
                return (
                  <li key={p.username} className="flex min-h-14 max-w-full items-center gap-3 rounded-full bg-bg-alt py-2 pr-5 pl-2">
                    <span
                      aria-hidden="true"
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-gold to-ember text-callout font-semibold text-white uppercase"
                    >
                      {p.username.slice(0, 1)}
                    </span>
                    <span className="min-w-0 leading-tight">
                      <span className="block truncate text-callout font-medium">{p.username}</span>
                      <span className="block truncate text-footnote text-fg-2">
                        {roleLabels[p.role] ?? "Supporter"} · <span aria-hidden="true">{flag(p.country)}</span>{" "}
                        {country}
                      </span>
                    </span>
                  </li>
                );
              })}
            </ul>
          </Reveal>
        ) : (
          <Reveal delay={80} className="mt-10 text-center text-body text-fg-2 sm:mt-14">
            Our community wall is just getting started. Yours could be the first name on it.
          </Reveal>
        )}

        <Reveal delay={120} className="mt-10 flex flex-wrap justify-center gap-3">
          <Link
            href="/get-involved"
            className="press inline-flex min-h-12 items-center rounded-full bg-cta px-6 text-body font-medium text-white hover:bg-cta-hover"
          >
            {people.length > 0 ? "Join them" : "Be the first"}
          </Link>
          <Link
            href="/get-involved#refer"
            className="press inline-flex min-h-12 items-center rounded-full border border-line bg-field px-6 text-body font-medium hover:border-cta"
          >
            Refer a school or orphanage
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
