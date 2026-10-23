"use client";

import { useActionState } from "react";
import { suggestTool, type SuggestState } from "@/app/ai-tools/actions";
import { Field } from "./Field";

/** "Suggest a tool": members send a web address and an optional note; the team adds it to the directory. */
export function SuggestTool() {
  const [state, action, pending] = useActionState<SuggestState, FormData>(suggestTool, {});
  if (state.sent)
    return (
      <p role="status" className="rounded-2xl bg-bg-alt p-5 text-body">
        Thank you. We&rsquo;ll look at it and add it to the directory.
      </p>
    );
  return (
    <form action={action} className="grid gap-3">
      <Field label="Web address (https://…)" name="website" type="url" inputMode="url" required maxLength={300} error={state.error} />
      <label className="sr-only" htmlFor="suggest-note">
        What it does (optional)
      </label>
      <textarea
        id="suggest-note"
        name="note"
        rows={3}
        maxLength={500}
        placeholder="What it does and who it helps (optional)"
        className="w-full resize-none rounded-2xl border border-line bg-field px-4 py-3 text-body outline-none transition-[box-shadow,border-color] duration-200 focus:border-cta focus:ring-4 focus:ring-cta/20"
      />
      <div>
        <button
          type="submit"
          disabled={pending}
          className="press min-h-11 rounded-full bg-cta px-6 text-body font-medium text-white hover:bg-cta-hover disabled:opacity-50"
        >
          {pending ? "Sending…" : "Suggest this tool"}
        </button>
      </div>
    </form>
  );
}
