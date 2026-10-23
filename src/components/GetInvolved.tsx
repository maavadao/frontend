"use client";

import { startTransition, useActionState, useState, useTransition, type FormEvent } from "react";
import { Field } from "./Field";
import { saveSupporter, sendReferral, withdrawReferral } from "@/app/get-involved/actions";
import { countries } from "@/lib/countries";
import { availabilities, helpWays, referralKinds } from "@/lib/supporters";

const errorText = "animate-fade mt-1.5 px-1 text-footnote text-[#e30000] dark:text-[#ff6961]";
const area =
  "w-full resize-none rounded-xl border border-line bg-field px-4 py-3.5 text-body outline-none transition-[box-shadow,border-color] duration-200 placeholder:text-fg-2 focus:border-cta focus:ring-4 focus:ring-cta/20";
const choice =
  "press flex min-h-14 cursor-pointer items-center gap-3 rounded-xl border border-line bg-field px-4 py-2.5 has-checked:border-cta has-checked:ring-4 has-checked:ring-cta/20 has-focus-visible:ring-4 has-focus-visible:ring-cta/20";

/**
 * Submit without React's automatic form reset, which would blank these controlled fields
 * (while their state keeps the old values) whenever the server sends back an error.
 */
const keepValues = (dispatch: (form: FormData) => void) => (e: FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  const form = new FormData(e.currentTarget);
  startTransition(() => dispatch(form));
};

type Supporter = { ways: string[]; availability: string; skills: string; message: string; showOnWall: boolean };

/** How the member would like to help. Saving again replaces what they said before. */
export function SupporterForm({ initial, isNew }: { initial: Supporter; isNew: boolean }) {
  const [state, action, pending] = useActionState(saveSupporter, { errors: {} });
  // Controlled, so a failed save keeps what the member chose.
  const [ways, setWays] = useState(new Set(initial.ways));
  const [availability, setAvailability] = useState(initial.availability);
  const [skills, setSkills] = useState(initial.skills);
  const [message, setMessage] = useState(initial.message);
  const [showOnWall, setShowOnWall] = useState(initial.showOnWall);
  const toggle = (id: string) =>
    setWays((w) => {
      const next = new Set(w);
      if (!next.delete(id)) next.add(id);
      return next;
    });

  return (
    <form onSubmit={keepValues(action)} className="grid gap-6">
      <fieldset aria-describedby={state.errors.ways ? "f-ways-err" : undefined}>
        <legend className="px-1 pb-3 text-headline">How would you like to help?</legend>
        <div className="grid gap-2 sm:grid-cols-2">
          {helpWays.map((w) => (
            <label key={w.id} className={choice}>
              <input
                type="checkbox"
                name="way"
                value={w.id}
                checked={ways.has(w.id)}
                onChange={() => toggle(w.id)}
                className="h-4 w-4 shrink-0 accent-[var(--cta)]"
              />
              <span className="min-w-0">
                <span className="block text-body">{w.label}</span>
                <span className="block text-footnote text-fg-2">{w.hint}</span>
              </span>
            </label>
          ))}
        </div>
        {state.errors.ways && (
          <p id="f-ways-err" role="alert" className={errorText}>
            {state.errors.ways}
          </p>
        )}
      </fieldset>

      <fieldset>
        <legend className="px-1 pb-3 text-headline">
          How much time could you give? <span className="text-callout font-normal text-fg-2">Optional</span>
        </legend>
        <div className="flex flex-wrap gap-2">
          {availabilities.map((a) => (
            <label
              key={a.id}
              className="press flex min-h-11 cursor-pointer items-center rounded-full border border-line bg-field px-4 text-callout has-checked:border-cta has-checked:bg-cta has-checked:text-white has-focus-visible:ring-4 has-focus-visible:ring-cta/20"
            >
              <input
                type="radio"
                name="availability"
                value={a.id}
                checked={availability === a.id}
                onChange={() => setAvailability(a.id)}
                className="sr-only"
              />
              {a.label}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="grid gap-3">
        <Field
          label="Skills to share (optional)"
          name="skills"
          value={skills}
          onChange={(e) => setSkills(e.target.value)}
          maxLength={300}
          error={state.errors.skills}
        />
        <label>
          <span className="sr-only">Anything else</span>
          <textarea
            name="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            maxLength={1000}
            rows={3}
            placeholder="Anything else we should know? Languages you speak, where you are, ideas… (optional)"
            className={area}
          />
        </label>
      </div>

      <label className="flex items-start gap-3 px-1 text-callout text-fg-2">
        <input
          type="checkbox"
          name="wall"
          checked={showOnWall}
          onChange={(e) => setShowOnWall(e.target.checked)}
          className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--cta)]"
        />
        <span>
          Show me on the community wall on maavadao.com: your username, country and how you&apos;re joining, never your
          email. You can change this any time.
        </span>
      </label>

      <div className="flex flex-wrap items-center gap-4">
        <button
          type="submit"
          disabled={pending || ways.size === 0}
          className="press min-h-12 rounded-full bg-cta px-6 text-body font-medium text-white hover:bg-cta-hover disabled:opacity-50"
        >
          {pending ? "Saving…" : isNew ? "Count me in" : "Save changes"}
        </button>
        <p className="text-callout text-fg-2" aria-live="polite">
          {state.errors.form ??
            (state.saved ? "Thank you! The maavaDao team will be in touch by email." : "Only the maavaDao team sees your answers.")}
        </p>
      </div>
    </form>
  );
}

/** Refer a school, orphanage or community group that maava could support. */
export function ReferralForm({ defaultCountry }: { defaultCountry: string }) {
  const [state, action, pending] = useActionState(sendReferral, { errors: {} });
  const empty = { kind: "school", name: "", place: "", country: defaultCountry, contact: "", consent: false, note: "" };
  const [v, setV] = useState(empty);
  const [lastSent, setLastSent] = useState<number | undefined>(undefined);
  if (state.sent && state.sent !== lastSent) {
    setLastSent(state.sent);
    setV(empty);
  }
  const set = <K extends keyof typeof v>(k: K, value: (typeof v)[K]) => setV((old) => ({ ...old, [k]: value }));
  const e = state.errors;

  return (
    <form onSubmit={keepValues(action)} className="grid gap-3">
      <fieldset>
        <legend className="sr-only">What kind of place is it?</legend>
        <div className="flex flex-wrap gap-2">
          {referralKinds.map((k) => (
            <label
              key={k.id}
              className="press flex min-h-11 cursor-pointer items-center rounded-full border border-line bg-field px-4 text-callout has-checked:border-cta has-checked:bg-cta has-checked:text-white has-focus-visible:ring-4 has-focus-visible:ring-cta/20"
            >
              <input
                type="radio"
                name="kind"
                value={k.id}
                checked={v.kind === k.id}
                onChange={() => set("kind", k.id)}
                className="sr-only"
              />
              {k.label}
            </label>
          ))}
        </div>
      </fieldset>
      <Field label="Its name" name="name" value={v.name} onChange={(ev) => set("name", ev.target.value)} maxLength={120} error={e.name} />
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Town or city" name="place" value={v.place} onChange={(ev) => set("place", ev.target.value)} maxLength={120} error={e.place} />
        <div>
          <label className="relative block">
            <span className="pointer-events-none absolute top-2.5 left-4 text-caption text-fg-2">Country</span>
            <select
              name="country"
              value={v.country}
              onChange={(ev) => set("country", ev.target.value)}
              className="h-14 w-full appearance-none rounded-xl border border-line bg-field px-4 pt-5 text-body outline-none transition-[box-shadow,border-color] duration-200 focus:border-cta focus:ring-4 focus:ring-cta/20"
            >
              <option value="" disabled>
                Choose…
              </option>
              {countries.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.name}
                </option>
              ))}
            </select>
            <span className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-fg-2" aria-hidden="true">
              ⌄
            </span>
          </label>
          {e.country && <p role="alert" className={errorText}>{e.country}</p>}
        </div>
      </div>
      <Field
        label="How we can reach them (optional)"
        name="contact"
        value={v.contact}
        onChange={(ev) => set("contact", ev.target.value)}
        maxLength={200}
        error={e.contact}
      />
      {v.contact && (
        <div>
          <label className="flex items-start gap-3 px-1 text-callout text-fg-2">
            <input
              type="checkbox"
              name="consent"
              checked={v.consent}
              onChange={(ev) => set("consent", ev.target.checked)}
              className="mt-0.5 h-4 w-4 accent-[var(--cta)]"
            />
            <span>They&apos;ve agreed to me sharing these contact details with maavaDao.</span>
          </label>
          {e.consent && <p role="alert" className={errorText}>{e.consent}</p>}
        </div>
      )}
      <label>
        <span className="sr-only">Why they could use support</span>
        <textarea
          name="note"
          value={v.note}
          onChange={(ev) => set("note", ev.target.value)}
          maxLength={1000}
          rows={3}
          placeholder="How many children, what they need, how you know them… (optional)"
          className={area}
        />
      </label>
      <div className="flex flex-wrap items-center gap-4">
        <button
          type="submit"
          disabled={pending || v.name.trim().length < 2 || v.place.trim().length < 2}
          className="press min-h-12 rounded-full bg-cta px-6 text-body font-medium text-white hover:bg-cta-hover disabled:opacity-50"
        >
          {pending ? "Sending…" : "Send referral"}
        </button>
        <p className="text-callout text-fg-2" aria-live="polite">
          {e.form ?? (state.sent ? "Thank you! We've added it to your referrals below." : "Please don't share children's personal details.")}
        </p>
      </div>
    </form>
  );
}

export function WithdrawReferral({ id }: { id: number }) {
  const [pending, start] = useTransition();
  const [confirming, setConfirming] = useState(false);
  return confirming ? (
    <span className="flex items-center gap-1">
      <button
        type="button"
        disabled={pending}
        onClick={() => start(() => withdrawReferral(id))}
        className="min-h-11 px-2 text-footnote text-[#e30000] hover:underline dark:text-[#ff6961]"
      >
        Withdraw
      </button>
      <button type="button" onClick={() => setConfirming(false)} className="min-h-11 px-2 text-footnote text-fg-2 hover:underline">
        Cancel
      </button>
    </span>
  ) : (
    <button type="button" onClick={() => setConfirming(true)} className="min-h-11 px-2 text-footnote text-fg-2 hover:text-fg hover:underline">
      Withdraw
    </button>
  );
}
