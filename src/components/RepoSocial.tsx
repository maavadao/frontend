"use client";

import { useActionState, useOptimistic, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteComment, postComment, rateRepo, reportComment, setListStatus } from "@/app/repos/actions";
import { Icon } from "./Icon";

const LABELS = ["", "Poor", "Fair", "Good", "Great", "Outstanding"];

/** Five tappable stars. Tap your current score again to clear it. */
export function StarRating({ slug, mine, signedIn }: { slug: string; mine: number | null; signedIn: boolean }) {
  const router = useRouter();
  const [score, setScore] = useOptimistic(mine);
  const [preview, setPreview] = useState<number | null>(null);
  const [, start] = useTransition();
  const shown = preview ?? score ?? 0;

  function rate(n: number) {
    start(async () => {
      setScore(score === n ? null : n);
      await rateRepo(slug, n);
    });
  }

  return (
    <div>
      <div role="radiogroup" aria-label="Your rating" className="flex items-center sm:gap-1" onPointerLeave={() => setPreview(null)}>
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={score === n}
            aria-label={`${n} star${n === 1 ? "" : "s"}: ${LABELS[n]}`}
            onPointerEnter={() => setPreview(n)}
            onClick={() => (signedIn ? rate(n) : router.push(`/login?next=${encodeURIComponent(`/repos/${slug}`)}`))}
            className={`press flex h-11 w-11 items-center justify-center rounded-full ${n <= shown ? "text-[#ff9f0a]" : "text-fg-2/40"} hover:bg-bg-alt`}
          >
            <Icon name="star" className={`h-7 w-7 ${n <= shown ? "[&_path]:fill-current" : ""}`} />
          </button>
        ))}
      </div>
      <p className="mt-1 h-5 px-1 text-footnote text-fg-2" aria-live="polite">
        {preview ? LABELS[preview] : score ? `You rated it ${LABELS[score].toLowerCase()}` : signedIn ? "Tap to rate" : "Sign in to rate"}
      </p>
    </div>
  );
}

const STATUSES = [
  { id: "using", label: "Using" },
  { id: "want", label: "Want to try" },
  { id: "used", label: "Used before" },
] as const;

/** Your list: using, want to try, used before. Tap the selected one again to take it off. */
export function ListStatus({ slug, mine, signedIn }: { slug: string; mine: string | null; signedIn: boolean }) {
  const router = useRouter();
  const [status, setStatus] = useOptimistic(mine);
  const [, start] = useTransition();
  return (
    <div role="group" aria-label="My list" className="grid w-full grid-cols-3 gap-1 rounded-full bg-surface p-1 sm:flex sm:w-fit">
      {STATUSES.map((s) => (
        <button
          key={s.id}
          type="button"
          aria-pressed={status === s.id}
          onClick={() =>
            signedIn
              ? start(async () => {
                  setStatus(status === s.id ? null : s.id);
                  await setListStatus(slug, s.id);
                })
              : router.push(`/login?next=${encodeURIComponent(`/repos/${slug}`)}`)
          }
          className={`press flex min-h-11 items-center justify-center rounded-full px-2 text-center text-footnote leading-tight sm:min-h-9 sm:px-4 sm:text-callout sm:whitespace-nowrap ${
            status === s.id ? "bg-fg text-bg" : "text-fg-2 hover:text-fg"
          }`}
        >
          {s.label}
        </button>
      ))}
    </div>
  );
}

export function CommentForm({ slug }: { slug: string }) {
  const [state, action, pending] = useActionState(postComment.bind(null, slug), {});
  const [body, setBody] = useState("");
  const [lastPosted, setLastPosted] = useState<number | undefined>(undefined);
  if (state.posted && state.posted !== lastPosted) {
    setLastPosted(state.posted);
    setBody("");
  }
  return (
    <form action={action} className="grid gap-2">
      <label className="sr-only" htmlFor={`comment-${slug}`}>
        Add a comment
      </label>
      <textarea
        id={`comment-${slug}`}
        name="body"
        value={body}
        onChange={(e) => setBody(e.target.value)}
        maxLength={2000}
        rows={3}
        placeholder="Share how you use it, a tip, or a question…"
        className="w-full resize-none rounded-2xl border border-line bg-field px-4 py-3 text-body outline-none transition-[box-shadow,border-color] duration-200 focus:border-cta focus:ring-4 focus:ring-cta/20"
      />
      <div className="flex items-center justify-between gap-3">
        <p className="text-footnote text-fg-2" role={state.error ? "alert" : undefined}>
          {state.error ?? "Be kind. Comments are public, and members can report them."}
        </p>
        <button
          type="submit"
          disabled={pending || !body.trim()}
          className="press min-h-11 shrink-0 rounded-full bg-cta px-5 text-callout font-medium text-white hover:bg-cta-hover disabled:opacity-50"
        >
          {pending ? "Posting…" : "Post"}
        </button>
      </div>
    </form>
  );
}

/** Delete (your own comment) or report (anyone else's). */
export function CommentActions({ slug, id, own, signedIn }: { slug: string; id: number; own: boolean; signedIn: boolean }) {
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
          onClick={() => start(() => deleteComment(slug, id))}
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
          await reportComment(slug, id);
          setReported(true);
        })
      }
      className="min-h-11 px-2 text-footnote text-fg-2 hover:text-fg hover:underline"
    >
      Report
    </button>
  );
}
