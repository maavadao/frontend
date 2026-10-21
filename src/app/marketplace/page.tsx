import type { Metadata } from "next";
import { Reveal } from "@/components/Reveal";
import { MarketplaceCatalog } from "@/components/MarketplaceCatalog";
import { getRegistryIndex, REGISTRY_REPO } from "@/lib/registry";

export const metadata: Metadata = {
  title: "Marketplace",
  description:
    "AI agents and tools built by the community. Free for schools, colleges, universities, teachers and students.",
};

export default async function MarketplacePage() {
  const index = await getRegistryIndex();
  const listings = index?.listings ?? [];
  const categories = index?.categories ?? {};

  return (
    <main className="bg-bg-alt px-4 pt-28 pb-20 sm:px-6 sm:pt-32 sm:pb-28 lg:pb-36">
      <div className="mx-auto max-w-[1100px]">
        <Reveal className="mx-auto max-w-[760px] text-center">
          <p className="text-callout font-semibold text-fg-2 sm:text-body">Marketplace</p>
          <h1 className="mt-2 font-display text-display text-balance">AI agents and tools, built by the community.</h1>
          <p className="mt-5 text-lede text-pretty text-fg-2">
            Free for schools, colleges, universities, teachers and students, to teach, learn, research and inform.
            When a listing is monetised, 60% of the revenue rewards the people who built it, and 40% helps children in need.
          </p>
        </Reveal>

        <Reveal delay={100} className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <a
            href={`${REGISTRY_REPO}/blob/main/templates/agent.yaml`}
            className="press rounded-full bg-cta px-6 py-3 text-body font-medium text-white hover:bg-cta-hover"
          >
            List your agent
          </a>
          <a
            href={`${REGISTRY_REPO}/blob/main/templates/tool.yaml`}
            className="press rounded-full bg-surface px-6 py-3 text-body font-medium text-fg hover:bg-bg"
          >
            List your tool
          </a>
        </Reveal>

        <Reveal delay={150} className="mt-14 sm:mt-20">
          <MarketplaceCatalog listings={listings} categories={categories} />
        </Reveal>
      </div>
    </main>
  );
}
