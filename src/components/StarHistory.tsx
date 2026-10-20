"use client";

import { useId, useRef, useState, type PointerEvent } from "react";

type Point = [number, number];

const number = new Intl.NumberFormat("en-GB");
const compact = new Intl.NumberFormat("en-GB", { notation: "compact", maximumFractionDigits: 1 });
const dateOf = (day: number) => new Date(day * 86_400_000);
const longDate = (day: number) => dateOf(day).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
const shortDate = (day: number) => dateOf(day).toLocaleDateString("en-GB", { month: "short", year: "numeric" });

const W = 640;
const H = 200;

/** A "nice" top for the y-axis: 1, 2 or 5 × a power of ten, at or above max. */
function niceTop(max: number) {
  if (max <= 0) return 1;
  const p = 10 ** Math.floor(Math.log10(max));
  return [1, 2, 5, 10].map((m) => m * p).find((v) => v >= max)!;
}

/** Star history as an area chart, with a crosshair and tooltip that follow the pointer. */
export function StarHistory({ points, note }: { points: Point[]; note: string }) {
  const box = useRef<HTMLDivElement>(null);
  const fillId = useId();
  const [hover, setHover] = useState<number | null>(null);

  if (points.length < 2) {
    return (
      <div className="rounded-[20px] bg-bg-alt p-6 text-center">
        <p className="text-body text-fg-2">
          maavaDao records stars every day
          {points[0] ? `, starting at ${number.format(points[0][1])} on ${longDate(points[0][0])}` : ""}. The chart appears
          from the second day.
        </p>
      </div>
    );
  }

  const [x0, x1] = [points[0][0], points[points.length - 1][0]];
  const top = niceTop(Math.max(...points.map((p) => p[1])));
  const x = (d: number) => ((d - x0) / Math.max(1, x1 - x0)) * W;
  const y = (s: number) => H - (s / top) * H;
  const line = points.map(([d, s], i) => `${i ? "L" : "M"}${x(d).toFixed(1)},${y(s).toFixed(1)}`).join("");
  const area = `${line}L${W},${H}L0,${H}Z`;

  function onMove(e: PointerEvent<HTMLDivElement>) {
    const rect = box.current?.getBoundingClientRect();
    if (!rect) return;
    const day = x0 + ((e.clientX - rect.left) / rect.width) * (x1 - x0);
    let best = 0;
    points.forEach(([d], i) => {
      if (Math.abs(d - day) < Math.abs(points[best][0] - day)) best = i;
    });
    setHover(best);
  }

  const h = hover != null ? points[hover] : null;
  const hx = h ? (x(h[0]) / W) * 100 : 0;
  const table = points.length > 12 ? points.filter((_, i) => i % Math.ceil(points.length / 12) === 0 || i === points.length - 1) : points;

  return (
    <figure>
      <div className="relative pl-12">
        {[1, 0.5, 0].map((f) => (
          <div key={f} className="pointer-events-none absolute right-0 left-12 border-t border-line" style={{ top: `${(1 - f) * 100}%` }}>
            <span className="absolute -top-2 -left-12 w-10 text-right text-caption text-fg-2 tabular-nums">{compact.format(top * f)}</span>
          </div>
        ))}
        <div
          ref={box}
          className="relative h-[200px] touch-pan-y"
          onPointerMove={onMove}
          onPointerDown={onMove}
          onPointerLeave={() => setHover(null)}
        >
          <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="h-full w-full overflow-visible text-link" aria-hidden="true">
            <defs>
              <linearGradient id={fillId} x1="0" x2="0" y1="0" y2="1">
                <stop offset="0" stopColor="currentColor" stopOpacity="0.22" />
                <stop offset="1" stopColor="currentColor" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d={area} fill={`url(#${fillId})`} />
            <path d={line} fill="none" stroke="currentColor" strokeWidth="2" vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
          </svg>
          {h && (
            <>
              <div className="pointer-events-none absolute top-0 bottom-0 w-px bg-fg-2/40" style={{ left: `${hx}%` }} />
              <div
                className="pointer-events-none absolute h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-link ring-2 ring-surface"
                style={{ left: `${hx}%`, top: `${(y(h[1]) / H) * 100}%` }}
              />
              <div
                role="status"
                className="pointer-events-none absolute -top-2 z-10 -translate-y-full rounded-xl bg-fg px-3 py-1.5 text-footnote whitespace-nowrap text-bg shadow-lg"
                style={{ left: `clamp(0px, calc(${hx}% - 3.5rem), calc(100% - 7rem))` }}
              >
                <span className="font-semibold tabular-nums">{number.format(h[1])}</span> stars · {longDate(h[0])}
              </div>
            </>
          )}
        </div>
      </div>
      <div className="mt-2 flex justify-between pl-12 text-caption text-fg-2">
        <span>{shortDate(x0)}</span>
        <span>{shortDate(x1)}</span>
      </div>
      <figcaption className="mt-3 text-footnote text-pretty text-fg-2">{note}</figcaption>
      <details className="mt-2 text-footnote text-fg-2">
        <summary className="inline-flex min-h-11 cursor-pointer items-center text-link">Show as a table</summary>
        <table className="mt-1 w-full max-w-[320px] text-left tabular-nums">
          <thead>
            <tr>
              <th className="py-1 font-medium">Date</th>
              <th className="py-1 text-right font-medium">Stars</th>
            </tr>
          </thead>
          <tbody>
            {table.map(([d, s]) => (
              <tr key={d} className="border-t border-line">
                <td className="py-1">{longDate(d)}</td>
                <td className="py-1 text-right">{number.format(s)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </figure>
  );
}
