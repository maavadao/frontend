"use client";

import { useActionState, useOptimistic, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteIdea, postIdea, reportIdea, toggleVote } from "@/app/vote/actions";

const LOGIN = `/login?next=${encodeURIComponent("/vote")}`;

/** The vote count, as a button. Tap again to take your vote back. */
export function VoteButton({ id, votes, voted, signedIn }: { id: number; votes: number; voted: boolean; signedIn: boolean }) {
  const router = useRouter();
  const [state, setState] = useOptimistic({ votes, voted });
  const [, start] = useTransition();
  return (
    <button
      type="button"
      aria-pressed={state.voted}
      aria-label={`${state.voted ? "Remove your vote" : "Vote for this idea"}: ${state.votes} vote${state.votes === 1 ? "" : "s"}`}
      onClick={() =>
        signedIn
          ? start(async () => {
              setState({ votes: state.votes + (state.voted ? -1 : 1), voted: !state.voted });
              await toggleVote(id);
            })
          : router.push(LOGIN)
      }
      className={`press flex min-h-16 w-14 shrink-0 flex-col self-start items-center justify-center rounded-2xl border sm:w-16 ${
        state.voted ? "border-cta bg-cta text-white" : "border-line bg-bg-alt text-fg hover:border-cta"
      }`}
    >
      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 15l6-6 6 6" />
      </svg>
      <span className="text-callout font-semibold tabular-nums">{state.votes}</span>
    </button>
  );
}

export function IdeaForm() {
  const [state, action, pending] = useActionState(postIdea, {});
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [lastPosted, setLastPosted] = useState<number | undefined>(undefined);
  if (state.posted && state.posted !== lastPosted) {
    setLastPosted(state.posted);
    setTitle("");
    setBody("");
  }
  const field =
    "w-full rounded-2xl border border-line bg-field px-4 py-3 text-body outline-none transition-[box-shadow,border-color] duration-200 focus:border-cta focus:ring-4 focus:ring-cta/20";
  return (
    <form action={action} className="grid gap-3">
      <label className="grid gap-1.5">
        <span className="text-callout font-medium">Your idea</span>
        <input
          name="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={120}
          placeholder="An AI tutor for maths practice, offline"
          className={`${field} min-h-12`}
        />
      </label>
      <label className="grid gap-1.5">
        <span className="text-callout font-medium">What it does, and who it helps</span>
        <textarea
          name="body"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          maxLength={2000}
          rows={4}
          placeholder="Describe the problem, who would use it, and any open-source repos it could build on…"
          className={`${field} resize-none`}
        />
      </label>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-footnote text-fg-2" role={state.error ? "alert" : undefined}>
          {state.error ?? "Ideas are public, and members can report them."}
        </p>
        <button
          type="submit"
          disabled={pending || title.trim().length < 5 || body.trim().length < 20}
          className="press min-h-11 shrink-0 rounded-full bg-cta px-6 text-callout font-medium text-white hover:bg-cta-hover disabled:opacity-50"
        >
          {pending ? "Posting…" : "Post idea"}
        </button>
      </div>
    </form>
  );
}

/** Delete (your own idea) or report (anyone else's). */
export function IdeaActions({ id, own, signedIn }: { id: number; own: boolean; signedIn: boolean }) {
  const [pending, start] = useTransition();
  const [reported, setReported] = useState(false);
  const [confirming, setConfirming] = useState(false);
  if (!signedIn) return null;
  if (own)
    return confirming ? (
      <span className="flex items-center gap-1">
        <button
          type="button"
          disabled={pending}
          onClick={() => start(() => deleteIdea(id))}
          className="min-h-11 px-2 text-footnote text-[#e30000] hover:underline dark:text-[#ff6961]"
        >
          Delete
        </button>
        <button type="button" onClick={() => setConfirming(false)} className="min-h-11 px-2 text-footnote text-fg-2 hover:underline">
          Cancel
        </button>
      </span>
    ) : (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="min-h-11 px-2 text-footnote text-fg-2 hover:text-fg hover:underline"
      >
        Delete
      </button>
    );
  return reported ? (
    <span className="min-h-11 px-2 text-footnote text-fg-2">Reported. Thank you.</span>
  ) : (
    <button
      type="button"
      disabled={pending}
      onClick={() =>
        start(async () => {
          await reportIdea(id);
          setReported(true);
        })
      }
      className="min-h-11 px-2 text-footnote text-fg-2 hover:text-fg hover:underline"
    >
      Report
    </button>
  );
}
