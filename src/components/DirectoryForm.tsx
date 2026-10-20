"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { Field } from "./Field";
import { saveDirectoryEntry, type DirectoryValues } from "@/app/developers/join/actions";

export function DirectoryForm({ initial, listed, profilePath }: { initial: DirectoryValues; listed: boolean; profilePath: string }) {
  const [state, action, pending] = useActionState(saveDirectoryEntry, { errors: {} });
  const values = state.values ?? initial;
  const [bio, setBio] = useState(values.bio);
  const isListed = listed || state.saved;

  return (
    <form action={action} className="grid gap-3">
      <Field label="Name to show (optional)" name="display_name" defaultValue={values.display_name} maxLength={80} error={state.errors.display_name} />

      <div>
        <label className="relative block">
          <span className="pointer-events-none absolute top-2.5 left-4 text-caption text-fg-2">Short bio (optional)</span>
          <textarea
            name="bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            maxLength={280}
            rows={4}
            aria-invalid={state.errors.bio ? true : undefined}
            className="w-full resize-none rounded-xl border border-line bg-field px-4 pt-8 pb-3 text-body outline-none transition-[box-shadow,border-color] duration-200 focus:border-cta focus:ring-4 focus:ring-cta/20"
          />
        </label>
        <p className="mt-1.5 flex justify-between px-1 text-footnote text-fg-2">
          <span>{state.errors.bio ?? "What you work on, and what you'd like to build."}</span>
          <span className="tabular-nums">{bio.length}/280</span>
        </p>
      </div>

      <Field label="Website (optional)" name="website" type="url" inputMode="url" defaultValue={values.website} error={state.errors.website} />

      <label className="flex min-h-11 cursor-pointer items-center gap-3 px-1 text-body">
        <input type="checkbox" name="show_country" defaultChecked={values.show_country} className="h-4 w-4 accent-[var(--cta)]" />
        Show my country
      </label>

      {state.errors.form && (
        <p role="alert" className="px-1 text-footnote text-[#e30000] dark:text-[#ff6961]">
          {state.errors.form}
        </p>
      )}
      {state.saved && (
        <p role="status" className="animate-fade px-1 text-footnote text-fg-2">
          Saved.{" "}
          <Link className="text-link hover:underline" href={profilePath}>
            See your profile
          </Link>
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="press mt-2 min-h-12 rounded-full bg-cta px-6 text-body font-medium text-white hover:bg-cta-hover disabled:opacity-60"
      >
        {pending ? "Saving…" : isListed ? "Save changes" : "Join the directory"}
      </button>
    </form>
  );
}
