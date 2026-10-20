import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { RepoDetail } from "@/components/RepoDetail";
import { getRepo } from "@/lib/repos";

export async function generateMetadata({ params }: PageProps<"/repos/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const found = await getRepo(slug);
  if (!found) return { title: "Repo not found" };
  return { title: found.repo.name, description: found.repo.description };
}

/** A repo's own page, for shared links and refreshes. From the list it opens as a sheet instead. */
export default async function RepoPage({ params }: PageProps<"/repos/[slug]">) {
  const { slug } = await params;
  if (!(await getRepo(slug))) notFound();
  return (
    <main className="bg-bg-alt px-4 pt-28 pb-20 sm:px-6 sm:pt-32 sm:pb-28">
      <div className="mx-auto max-w-[880px]">
        <Link href="/repos" className="inline-flex min-h-11 items-center text-callout text-link hover:underline">
          <span aria-hidden="true" className="mr-1">‹</span> Open-source AI repos
        </Link>
        <div className="-mx-4 mt-4 bg-surface px-4 py-6 sm:mx-0 sm:rounded-[28px] sm:p-10">
          <RepoDetail slug={slug} />
        </div>
      </div>
    </main>
  );
}
