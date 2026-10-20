"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getClaims } from "@/lib/supabase/server";

export type DirectoryErrors = Partial<Record<"display_name" | "bio" | "website" | "form", string>>;
export type DirectoryValues = { display_name: string; bio: string; website: string; show_country: boolean };
export type DirectoryState = { errors: DirectoryErrors; values?: DirectoryValues; saved?: boolean };

/** The same limits the database checks. */
function validateDirectory(v: DirectoryValues): DirectoryErrors {
  const e: DirectoryErrors = {};
  if (v.display_name.length > 80) e.display_name = "Use 80 characters or fewer.";
  if (v.bio.length > 280) e.bio = "Use 280 characters or fewer.";
  if (v.website && (!/^https?:\/\/\S+$/.test(v.website) || v.website.length > 200))
    e.website = "Use a full link starting with https://";
  return e;
}

/** Join the directory, or save changes to an existing entry. */
export async function saveDirectoryEntry(_prev: DirectoryState, form: FormData): Promise<DirectoryState> {
  const values: DirectoryValues = {
    display_name: String(form.get("display_name") ?? "").trim(),
    bio: String(form.get("bio") ?? "").trim(),
    website: String(form.get("website") ?? "").trim(),
    show_country: form.get("show_country") === "on",
  };
  const errors = validateDirectory(values);
  if (Object.keys(errors).length) return { errors, values };

  const { supabase, claims } = await getClaims();
  if (!claims) redirect(`/login?next=${encodeURIComponent("/developers/join")}`);

  // Username, role, country and GitHub login are filled in by the database from the member's profile.
  const { error } = await supabase.from("developer_directory").upsert({
    id: claims.sub,
    username: "",
    role: "",
    display_name: values.display_name || null,
    bio: values.bio || null,
    website: values.website || null,
    show_country: values.show_country,
  });
  if (error) return { errors: { form: "We couldn't save your listing. Please try again." }, values };

  revalidatePath("/developers");
  return { errors: {}, values, saved: true };
}

/** Leave the directory: the row is deleted, so nothing about the member stays public. */
export async function leaveDirectory() {
  const { supabase, claims } = await getClaims();
  if (!claims) redirect("/login");
  await supabase.from("developer_directory").delete().eq("id", claims.sub);
  revalidatePath("/developers");
  redirect("/developers/join?left=1");
}
