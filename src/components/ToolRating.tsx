"use client";

import { useOptimistic, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { rateTool } from "@/app/directory/actions";
import { Icon } from "./Icon";

const LABELS = ["", "Poor", "Fair", "Good", "Great", "Outstanding"];

/** Five tappable stars for a tool. Tap your current score again to clear it. */
export function ToolRating({ slug, mine, signedIn }: { slug: string; mine: number | null; signedIn: boolean }) {
  const router = useRouter();
  const [score, setScore] = useOptimistic(mine);
  const [preview, setPreview] = useState<number | null>(null);
  const [, start] = useTransition();
  const shown = preview ?? score ?? 0;

  function rate(n: number) {
    start(async () => {
      setScore(score === n ? null : n);
      await rateTool(slug, n);
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
            onClick={() => (signedIn ? rate(n) : router.push(`/login?next=${encodeURIComponent(`/directory/${slug}`)}`))}
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
