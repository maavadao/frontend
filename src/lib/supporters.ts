import { isCountry } from "./countries";

/** Ways to help that need no code. Ids are stored; keep them in sync with the supporters migration. */
export const helpWays = [
  { id: "volunteer", label: "Volunteer your time", hint: "Help at maava's schools, at events or online" },
  { id: "refer", label: "Refer a school or orphanage", hint: "Tell us about children who could use free AI tools or support" },
  { id: "teach", label: "Teach or mentor", hint: "Share what you know with children and young learners" },
  { id: "spread", label: "Spread the word", hint: "Tell friends, schools and your community about maavaDao" },
  { id: "translate", label: "Translate", hint: "Bring agents and learning content into your language" },
  { id: "fundraise", label: "Fundraise or donate", hint: "Help fund Maava School for AI and maava's schools" },
  { id: "feedback", label: "Try agents and give feedback", hint: "As a student, teacher or parent, tell us what works" },
] as const;

export type HelpWay = (typeof helpWays)[number]["id"];
export const isHelpWay = (id: string): id is HelpWay => helpWays.some((w) => w.id === id);

export const availabilities = [
  { id: "month", label: "A few hours a month" },
  { id: "week", label: "A few hours a week" },
  { id: "more", label: "More than that" },
] as const;

export const referralKinds = [
  { id: "school", label: "School" },
  { id: "orphanage", label: "Orphanage" },
  { id: "community", label: "Community group" },
] as const;

export type SupporterErrors = Partial<Record<"ways" | "availability" | "skills" | "message" | "form", string>>;

export function validateSupporter(d: { ways: string[]; availability: string; skills: string; message: string }): SupporterErrors {
  const e: SupporterErrors = {};
  if (!d.ways.length || !d.ways.every(isHelpWay)) e.ways = "Choose at least one way you'd like to help.";
  if (d.availability && !availabilities.some((a) => a.id === d.availability)) e.availability = "Choose how much time you have.";
  if (d.skills.length > 300) e.skills = "Keep this under 300 characters.";
  if (d.message.length > 1000) e.message = "Keep this under 1,000 characters.";
  return e;
}

export type ReferralErrors = Partial<Record<"kind" | "name" | "place" | "country" | "contact" | "consent" | "note" | "form", string>>;

export function validateReferral(d: {
  kind: string;
  name: string;
  place: string;
  country: string;
  contact: string;
  consent: boolean;
  note: string;
}): ReferralErrors {
  const e: ReferralErrors = {};
  if (!referralKinds.some((k) => k.id === d.kind)) e.kind = "Choose what kind of place it is.";
  if (d.name.length < 2 || d.name.length > 120) e.name = "Give its name, in 2 to 120 characters.";
  if (d.place.length < 2 || d.place.length > 120) e.place = "Give its town or city.";
  if (!isCountry(d.country)) e.country = "Choose its country.";
  if (d.contact.length > 200) e.contact = "Keep this under 200 characters.";
  if (d.contact && !d.consent) e.consent = "Only share contact details they've agreed to share.";
  if (d.note.length > 1000) e.note = "Keep this under 1,000 characters.";
  return e;
}
