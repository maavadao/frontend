import { notFound } from "next/navigation";
import { RepoDetail } from "@/components/RepoDetail";
import { RepoSheet } from "@/components/RepoSheet";
import { getRepo } from "@/lib/repos";

/** A repo opened from the list: the detail in a sheet over it. Opened directly, /repos/[slug] shows the full page instead. */
export default async function RepoModal({ params }: PageProps<"/repos/[slug]">) {
  const { slug } = await params;
  const found = await getRepo(slug);
  if (!found) notFound();
  return (
    <RepoSheet title={found.repo.name}>
      <RepoDetail slug={slug} />
    </RepoSheet>
  );
}
