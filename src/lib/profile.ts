import { isCountry } from "./countries";

export type ProfileErrors = Partial<Record<"username" | "country" | "role" | "terms" | "form", string>>;

export const usernamePattern = /^[a-z0-9_]{3,20}$/;

/** How a member is joining, drawn from the mission's audiences. Ids are stored; keep them in sync with the migration. */
export const roles = [
  { id: "student", label: "A student or learner", hint: "Learn with agents built for you" },
  { id: "developer", label: "An AI developer", hint: "Build and list agents for education" },
  { id: "contributor", label: "An open-source contributor", hint: "Review code, translate, report safety issues" },
  { id: "educator", label: "A school, orphanage or educator", hint: "Use agents free of charge with your learners" },
  { id: "volunteer", label: "A volunteer or supporter", hint: "Refer schools and orphanages, give your time, spread the word" },
  { id: "organisation", label: "A small business or community organisation", hint: "Use practical agents without commercial costs" },
  { id: "funder", label: "A funder, NGO or partner", hint: "Support the mission and see verifiable impact" },
] as const;

export type Role = (typeof roles)[number]["id"];

export const isRole = (id: string): id is Role => roles.some((r) => r.id === id);

type Input = { username?: string; country?: string; role?: string; terms?: string };

/** Shared by the onboarding form (inline) and its Server Action (authoritative). */
export function validateProfile(d: Input): ProfileErrors {
  const e: ProfileErrors = {};
  const username = d.username ?? "";
  if (username.length < 3 || username.length > 20) e.username = "Use 3 to 20 characters.";
  else if (!usernamePattern.test(username)) e.username = "Use lowercase letters, numbers and underscores only.";
  if (!isCountry(d.country ?? "")) e.country = "Choose your country.";
  if (!isRole(d.role ?? "")) e.role = "Choose how you're joining.";
  if (d.terms !== "on") e.terms = "Please agree to continue.";
  return e;
}

/** Roles that help in ways other than code. After onboarding they go to the get-involved form. */
export const supporterRoles: readonly Role[] = ["student", "educator", "volunteer", "organisation", "funder"];
