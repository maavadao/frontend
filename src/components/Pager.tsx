import Link from "next/link";

const number = new Intl.NumberFormat("en-GB");

/** Previous · "2 of 40" · Next, for server-paginated lists. */
export function Pager({ page, pages, href }: { page: number; pages: number; href: (page: number) => string }) {
  if (pages <= 1) return null;
  const pill = "flex min-h-11 items-center rounded-full px-5 text-callout";
  return (
    <nav aria-label="Pages" className="mt-10 flex items-center justify-center gap-3 sm:mt-14">
      {page > 1 ? (
        <Link href={href(page - 1)} className={`press ${pill} bg-surface text-fg hover:bg-bg`}>
          <span aria-hidden="true" className="mr-1">‹</span> Previous
        </Link>
      ) : (
        <span className={`${pill} text-fg-2/50`}>
          <span aria-hidden="true" className="mr-1">‹</span> Previous
        </span>
      )}
      <span className="text-callout text-fg-2 tabular-nums">
        {page} of {number.format(pages)}
      </span>
      {page < pages ? (
        <Link href={href(page + 1)} className={`press ${pill} bg-surface text-fg hover:bg-bg`}>
          Next <span aria-hidden="true" className="ml-1">›</span>
        </Link>
      ) : (
        <span className={`${pill} text-fg-2/50`}>
          Next <span aria-hidden="true" className="ml-1">›</span>
        </span>
      )}
    </nav>
  );
}
