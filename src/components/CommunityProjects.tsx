import { Reveal } from "@/components/Reveal";
import {
  COMMUNITY_AGENTS_REPO,
  getCommunityAgents,
  getRegistryIndex,
  listingHref,
  pricingSummary,
  type RegistryListing,
} from "@/lib/registry";

const isCommunityAgent = (l: RegistryListing) =>
  !!l.links.repository?.toLowerCase().startsWith(COMMUNITY_AGENTS_REPO);

function Card({ listing, label }: { listing: RegistryListing; label: string }) {
  return (
    <a
      href={listingHref(listing)}
      target="_blank"
      rel="noreferrer"
      className="press group flex h-full flex-col rounded-[28px] bg-surface p-6 sm:p-7 motion-safe:hover:-translate-y-1 hover:shadow-[0_20px_50px_-20px_rgb(0_0_0/0.25)]"
    >
      <span className="w-fit rounded-full bg-bg-alt px-2.5 py-1 text-caption font-medium text-fg-2">{label}</span>
      <h3 className="mt-5 text-headline">{listing.name}</h3>
      <p className="mt-3 line-clamp-3 flex-1 text-body text-fg-2">{listing.summary}</p>
      <div className="mt-6 flex items-center justify-between gap-3 text-callout">
        <span className="text-fg-2">{pricingSummary(listing.pricing)}</span>
        <span className="shrink-0 text-link">
          View
          <span className="ml-1 inline-block transition-transform duration-300 group-hover:translate-x-1">›</span>
        </span>
      </div>
    </a>
  );
}

/** Agents from the community-agents index, then the latest from the marketplace. Nothing from forked repos. */
export async function CommunityProjects() {
  const [index, community] = await Promise.all([getRegistryIndex(), getCommunityAgents()]);
  const listings = index?.listings ?? [];
  const others = listings
    .filter((l) => !isCommunityAgent(l))
    .sort((a, b) => b.added.localeCompare(a.added))
    .slice(0, 3);

  return (
    <div>
      <Reveal>
        <h3 className="text-title">Built together</h3>
        <p className="mt-2 text-body text-fg-2">
          Open-source agents the community writes, reviews and maintains in one repository.
        </p>
        {community.length > 0 ? (
          <ul className="gallery mt-6 sm:grid sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
            {community.map((l) => (
              <li key={l.slug}>
                <Card listing={l} label="Community agent" />
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-6 rounded-[28px] bg-surface p-8 text-center text-body text-fg-2 sm:p-12">
            Our first community agents are on their way. Want to help build them?{" "}
            <a className="text-link hover:underline" href={COMMUNITY_AGENTS_REPO} target="_blank" rel="noreferrer">
              Join us on GitHub
            </a>
            .
          </p>
        )}
      </Reveal>

      {others.length > 0 && (
        <Reveal className="mt-14 sm:mt-20">
          <h3 className="text-title">From the marketplace</h3>
          <p className="mt-2 text-body text-fg-2">Agents and tools listed by developers from around the world.</p>
          <ul className="gallery mt-6 sm:grid sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
            {others.map((l) => (
              <li key={`${l.kind}-${l.slug}`}>
                <Card listing={l} label={l.kind === "agent" ? "Agent" : "Tool"} />
              </li>
            ))}
          </ul>
        </Reveal>
      )}

      <Reveal className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-center sm:mt-14">
        <a href="/marketplace" className="group text-body text-link hover:underline">
          Browse the marketplace
          <span className="ml-1 inline-block transition-transform group-hover:translate-x-1">›</span>
        </a>
        <a href={COMMUNITY_AGENTS_REPO} target="_blank" rel="noreferrer" className="group text-body text-link hover:underline">
          Contribute an agent
          <span className="ml-1 inline-block transition-transform group-hover:translate-x-1">›</span>
        </a>
      </Reveal>
    </div>
  );
}
