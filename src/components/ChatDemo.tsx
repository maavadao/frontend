"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { LogoMark } from "@/components/Logo";

/** A scripted loop of what maava AI does. Illustration only; nothing here calls the model. */
const script = [
  {
    q: "Explain photosynthesis like I'm 10.",
    a: "Plants are like tiny kitchens. They take sunlight, water and air, and cook their own food, sugar, while giving out the oxygen we breathe. Want a quick quiz on it?",
  },
  {
    q: "Make me a 3-day revision plan for fractions.",
    a: "Day 1: what fractions mean, with pizza examples. Day 2: adding and comparing. Day 3: word problems and a short test. I can write the questions for you.",
  },
  {
    q: "Help me write a reminder email to parents.",
    a: "Dear parents, a quick reminder that term fees are due on Friday. Please reply if you'd like to talk about a payment plan. Thank you for your support.",
  },
];

const TYPE_MS = 28;

const noSubscribe = () => () => {};
const prefersStill = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export function ChatDemo() {
  const [i, setI] = useState(0);
  const still = useSyncExternalStore(noSubscribe, prefersStill, () => false);
  const turn = script[i];
  // Each turn is its own component (keyed), so its animation state starts fresh without effects resetting it.
  return <Chat key={i} turn={turn} still={still} onDone={() => setI((x) => (x + 1) % script.length)} />;
}

function Chat({ turn, still, onDone }: { turn: (typeof script)[number]; still: boolean; onDone: () => void }) {
  const [asked, setAsked] = useState(false);
  const [typed, setTyped] = useState(0);
  const shown = still ? turn.a.length : typed;
  const showQ = still || asked;

  useEffect(() => {
    if (still) return;
    let tick: ReturnType<typeof setInterval> | undefined;
    const ask = setTimeout(() => setAsked(true), 600);
    const start = setTimeout(() => {
      let n = 0;
      tick = setInterval(() => {
        n += 2;
        setTyped(Math.min(n, turn.a.length));
        if (n >= turn.a.length) clearInterval(tick);
      }, TYPE_MS);
    }, 1500);
    const next = setTimeout(onDone, 1500 + (turn.a.length / 2) * TYPE_MS + 3500);
    return () => {
      clearTimeout(ask);
      clearTimeout(start);
      clearTimeout(next);
      clearInterval(tick);
    };
  }, [still, turn.a.length, onDone]);

  return (
    <div className="tile min-w-0 p-5 shadow-lift ring-1 ring-white/5 sm:p-7" aria-label="Demo of maava AI">
      <div className="flex items-center gap-3">
        <LogoMark className="h-10 w-10 shrink-0 rounded-[10px] ring-1 ring-white/10" />
        <div>
          <p className="text-headline text-white">maava AI</p>
          <p className="text-footnote text-ink-fg-2">Free for students, teachers and the community</p>
        </div>
      </div>
      <div className="mt-6 flex min-h-[19rem] flex-col gap-3" aria-live="off">
        {showQ && (
          <p className="animate-fade ml-auto max-w-[85%] rounded-2xl rounded-br-md bg-mint px-4 py-2.5 text-callout font-medium text-cta-fg">
            {turn.q}
          </p>
        )}
        {shown > 0 && (
          <p className="animate-fade max-w-[92%] rounded-2xl rounded-bl-md bg-ink-2 px-4 py-3 text-callout text-white/90">
            {turn.a.slice(0, shown)}
            {shown < turn.a.length && <span className="ml-0.5 inline-block h-4 w-[2px] translate-y-0.5 bg-mint" />}
          </p>
        )}
      </div>
      <div className="mt-2 rounded-[var(--radius-control)] border border-white/10 bg-ink-2 px-4 py-3 text-body text-ink-fg-2">
        Ask anything…
      </div>
    </div>
  );
}
