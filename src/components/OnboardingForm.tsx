"use client";

import { useActionState, useState, type FocusEvent, type FormEvent } from "react";
import { Field } from "./Field";
import { LogoMark } from "./Logo";
import { completeOnboarding } from "@/app/onboarding/actions";
import { countries } from "@/lib/countries";
import { roles, validateProfile, type ProfileErrors } from "@/lib/profile";

type Props = { next: string; suggestedUsername: string; suggestedCountry: string };

export function OnboardingForm({ next, suggestedUsername, suggestedCountry }: Props) {
  const [state, action, pending] = useActionState(completeOnboarding, { errors: {} });
  const [inline, setInline] = useState<ProfileErrors | null>(null);
  const [touched, setTouched] = useState<Set<string>>(new Set());
  // Inline checks take over once the member edits; until then show what the server said.
  const errors = inline ?? state.errors;

  function recheck(form: HTMLFormElement, seen: Set<string>) {
    const d = Object.fromEntries(new FormData(form)) as Record<string, string>;
    const all = validateProfile({ ...d, username: d.username?.trim().toLowerCase() });
    setInline(Object.fromEntries(Object.entries(all).filter(([k]) => seen.has(k))));
  }

  function onBlur(ev: FocusEvent<HTMLFormElement>) {
    const { name, value } = ev.target as EventTarget as HTMLInputElement;
    if (!name || !value) return;
    const seen = new Set(touched).add(name);
    setTouched(seen);
    recheck(ev.currentTarget, seen);
  }

  function onChange(ev: FormEvent<HTMLFormElement>) {
    const { name } = ev.target as EventTarget as HTMLInputElement;
    const seen = ["terms", "country", "role"].includes(name) ? new Set(touched).add(name) : touched;
    if (seen.has(name)) {
      setTouched(seen);
      recheck(ev.currentTarget, seen);
    }
  }

  function onSubmit(ev: FormEvent<HTMLFormElement>) {
    const d = Object.fromEntries(new FormData(ev.currentTarget)) as Record<string, string>;
    const e = validateProfile({ ...d, username: d.username?.trim().toLowerCase() });
    if (Object.keys(e).length) {
      ev.preventDefault();
      setTouched(new Set(["username", "country", "role", "terms"]));
      setInline(e);
    } else {
      setInline(null);
    }
  }

  return (
    <div className="w-full max-w-[420px]">
      <div className="text-center">
        <LogoMark className="mx-auto h-16 w-16 drop-shadow-[0_12px_30px_rgb(127_90_240/0.35)]" />
        <h1 className="mt-6 text-title sm:text-[2rem]">Set up your account</h1>
        <p className="mt-2 text-body text-pretty text-fg-2">
          Welcome! Everyone has a place here, whether you write code or not. Tell us who you are, where you are, and how
          you&apos;d like to take part.
        </p>
      </div>

      <form noValidate action={action} onSubmit={onSubmit} onBlur={onBlur} onChange={onChange} className="mt-8 grid gap-3">
        <input type="hidden" name="next" value={next} />
        <div>
          <Field
            label="Username"
            name="username"
            defaultValue={state.values?.username ?? suggestedUsername}
            autoComplete="username"
            autoCapitalize="none"
            spellCheck={false}
            maxLength={20}
            error={errors.username}
          />
          {!errors.username && (
            <p className="mt-1.5 px-1 text-footnote text-fg-2">Lowercase letters, numbers and underscores, 3 to 20 characters.</p>
          )}
        </div>

        <div>
          <label className="relative block">
            <span className="pointer-events-none absolute top-2.5 left-4 text-caption text-fg-2">Country</span>
            <select
              name="country"
              defaultValue={state.values?.country ?? suggestedCountry}
              autoComplete="country"
              aria-invalid={errors.country ? true : undefined}
              aria-describedby={errors.country ? "f-country-err" : undefined}
              className={`h-14 w-full appearance-none rounded-xl border bg-field px-4 pt-5 text-body outline-none transition-[box-shadow,border-color] duration-200 focus:ring-4 ${
                errors.country ? "border-[#e30000] focus:ring-[#e30000]/15" : "border-line focus:border-cta focus:ring-cta/20"
              }`}
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
          {errors.country && (
            <p id="f-country-err" role="alert" className="animate-fade mt-1.5 px-1 text-footnote text-[#e30000] dark:text-[#ff6961]">
              {errors.country}
            </p>
          )}
        </div>

        <fieldset aria-describedby={errors.role ? "f-role-err" : undefined}>
          <legend className="px-1 pt-2 pb-2 text-callout font-medium">I&apos;m joining as</legend>
          <div className="grid gap-2">
            {roles.map((r) => (
              <label
                key={r.id}
                className="press flex min-h-14 cursor-pointer items-center gap-3 rounded-xl border border-line bg-field px-4 py-2.5 has-checked:border-cta has-checked:ring-4 has-checked:ring-cta/20 has-focus-visible:ring-4 has-focus-visible:ring-cta/20"
              >
                <input
                  type="radio"
                  name="role"
                  value={r.id}
                  defaultChecked={state.values?.role === r.id}
                  className="h-4 w-4 shrink-0 accent-[var(--cta)]"
                />
                <span className="min-w-0">
                  <span className="block text-body">{r.label}</span>
                  <span className="block text-footnote text-fg-2">{r.hint}</span>
                </span>
              </label>
            ))}
          </div>
          {errors.role && (
            <p id="f-role-err" role="alert" className="animate-fade mt-1.5 px-1 text-footnote text-[#e30000] dark:text-[#ff6961]">
              {errors.role}
            </p>
          )}
        </fieldset>

        <label className="flex items-start gap-3 px-1 pt-1 text-callout text-fg-2">
          <input
            type="checkbox"
            name="wall"
            defaultChecked={state.values?.wall ?? true}
            className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--cta)]"
          />
          <span>
            Show me on the community wall on maavadao.com (username, country, how I&apos;m joining and my GitHub picture,
            never my email).
          </span>
        </label>

        <div>
          <label className="flex items-start gap-3 px-1 pt-1 text-callout text-fg-2">
            <input type="checkbox" name="terms" defaultChecked={state.values?.terms} className="mt-0.5 h-4 w-4 accent-[var(--cta)]" />
            <span>I agree to take part in good faith, follow the code of conduct and put children&apos;s safety first.</span>
          </label>
          {errors.terms && <p role="alert" className="mt-1.5 px-1 text-footnote text-[#e30000] dark:text-[#ff6961]">{errors.terms}</p>}
        </div>

        <button
          type="submit"
          disabled={pending}
          className="press mt-2 h-12 rounded-xl bg-cta text-body font-medium text-white hover:bg-cta-hover disabled:opacity-60"
        >
          {pending ? "Saving…" : "Continue"}
        </button>
      </form>

      <div aria-live="polite">
        {errors.form && <p className="animate-fade mt-5 rounded-xl bg-[#f7b733]/15 px-4 py-3 text-callout text-fg">{errors.form}</p>}
      </div>

      <form action="/auth/signout" method="post" className="mt-8 text-center">
        <button type="submit" className="min-h-11 text-callout text-link hover:underline">
          Not you? Sign out
        </button>
      </form>
    </div>
  );
}
