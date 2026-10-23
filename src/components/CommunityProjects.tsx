import { ListingCard as Card } from "@/components/ListingCard";
import { Reveal } from "@/components/Reveal";
import { MAAVA_AGENTS_REPO, getMaavaAgents, getRegistryIndex, type RegistryListing } from "@/lib/registry";

// Each agent has its own community-agent-<name> repo; older listings point at the index (or its old name).
const AGENT_REPOS = [
  MAAVA_AGENTS_REPO,
  "https://github.com/maavadao/community-agent-",
  "https://github.com/maavadao/maava-agents",
].map((r) => r.toLowerCase());
const isMaavaAgent = (l: RegistryListing) => {
  const repo = l.links.repository?.toLowerCase();
  return !!repo && AGENT_REPOS.some((r) => repo.startsWith(r));
};

/** maava Community Agents, then the latest from the marketplace. Nothing from forked repos. */
export async function CommunityProjects() {
  const [index, community] = await Promise.all([getRegistryIndex(), getMaavaAgents()]);
  const listings = index?.listings ?? [];
  const others = listings
    .filter((l) => !isMaavaAgent(l))
    .sort((a, b) => b.added.localeCompare(a.added))
    .slice(0, 3);

  return (
    <div>
      <Reveal>
        <h3 className="text-title">Built together</h3>
        <p className="mt-2 text-body text-fg-2">
          maava Community Agents: open-source agents for sales, marketing and growth, built and improved by the community.
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
            Our first maava Community Agents are on their way. Want to help build them?{" "}
            <a className="text-link hover:underline" href="/agents">
              Find out how
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
        <a href="/agents" className="group text-body text-link hover:underline">
          Build Community Agents
          <span className="ml-1 inline-block transition-transform group-hover:translate-x-1">›</span>
        </a>
      </Reveal>
    </div>
  );
}
