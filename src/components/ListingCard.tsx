import { listingHref, pricingSummary, type RegistryListing } from "@/lib/registry";

/** A marketplace or maava agents listing, linking to its repository or website. */
export function ListingCard({ listing, label }: { listing: RegistryListing; label: string }) {
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
