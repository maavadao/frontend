"use client";

import Link from "next/link";
import { useActionState, useEffect, useState, type ReactNode } from "react";
import { Field } from "./Field";
import { LogoMark } from "./Logo";
import { sendEmailCode, verifyEmailCode } from "@/app/auth/email/actions";
import type { Provider } from "@/lib/auth";

type Mode = "login" | "signup";

const providers: { id: Provider; label: string; className: string; icon: ReactNode }[] = [
  {
    id: "google",
    label: "Google",
    className: "border border-line bg-field hover:bg-bg-alt",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
        <path fill="#4285F4" d="M23.52 12.27c0-.85-.08-1.67-.22-2.45H12v4.64h6.46a5.52 5.52 0 0 1-2.4 3.62v3h3.88c2.27-2.09 3.58-5.17 3.58-8.81z" />
        <path fill="#34A853" d="M12 24c3.24 0 5.96-1.07 7.94-2.92l-3.88-3c-1.07.72-2.45 1.15-4.06 1.15-3.12 0-5.77-2.11-6.71-4.95H1.28v3.1A12 12 0 0 0 12 24z" />
        <path fill="#FBBC05" d="M5.29 14.28A7.2 7.2 0 0 1 4.91 12c0-.79.14-1.56.38-2.28v-3.1H1.28a12 12 0 0 0 0 10.76l4.01-3.1z" />
        <path fill="#EA4335" d="M12 4.77c1.76 0 3.34.61 4.59 1.8l3.44-3.44C17.95 1.19 15.24 0 12 0A12 12 0 0 0 1.28 6.62l4.01 3.1C6.23 6.88 8.88 4.77 12 4.77z" />
      </svg>
    ),
  },
  {
    id: "github",
    label: "GitHub",
    className: "bg-fg text-bg hover:opacity-90",
    icon: (
      <svg viewBox="0 0 16 16" className="h-5 w-5" fill="currentColor" aria-hidden="true">
        <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
      </svg>
    ),
  },
];

const failures = {
  callback: "That sign-in didn't complete. Please try again.",
  signin: "We couldn't reach the sign-in service. Please try again.",
};

type Props = { mode: Mode; next?: string; error?: keyof typeof failures };

export function AuthForm({ mode, next = "/", error }: Props) {
  // The form leaves the page for the provider; keep the chosen button busy until it does.
  const [busy, setBusy] = useState<Provider | null>(null);
  const message = error ? failures[error] : "";

  // Coming back from the provider with the Back button restores this page from cache; un-stick the button.
  useEffect(() => {
    const onShow = (e: PageTransitionEvent) => e.persisted && setBusy(null);
    window.addEventListener("pageshow", onShow);
    return () => window.removeEventListener("pageshow", onShow);
  }, []);
  const isSignup = mode === "signup";

  return (
    <div className="w-full max-w-[420px]">
      <div className="text-center">
        <LogoMark className="mx-auto h-16 w-16 drop-shadow-[0_12px_30px_rgb(127_90_240/0.35)]" />
        <h1 className="mt-6 text-title sm:text-[2rem]">
          {isSignup ? "Join maavaDao" : "Sign in to maavaDao"}
        </h1>
        <p className="mt-2 text-body text-fg-2">
          {isSignup
            ? "Everyone is welcome: developers, volunteers, students, teachers and anyone who wants to help."
            : "Welcome back. Pick up where you left off."}
        </p>
      </div>

      <form
        action="/auth/signin"
        method="post"
        onSubmit={(e) => {
          // Block a second click instead of disabling the buttons: a disabled submitter
          // is left out of the form data, so the server would never see which provider.
          if (busy) return e.preventDefault();
          setBusy(((e.nativeEvent as SubmitEvent).submitter as HTMLButtonElement).value as Provider);
        }}
        className="mt-8 grid gap-3"
      >
        <input type="hidden" name="next" value={next} />
        <input type="hidden" name="mode" value={mode} />
        {providers.map((p) => (
          <button
            key={p.id}
            type="submit"
            name="provider"
            value={p.id}
            aria-disabled={!!busy}
            className={`press flex h-12 items-center justify-center gap-2.5 rounded-xl text-body font-medium aria-disabled:opacity-60 ${p.className}`}
          >
            {p.icon}
            {busy === p.id ? "Connecting…" : `Continue with ${p.label}`}
          </button>
        ))}
      </form>

      <div className="my-6 flex items-center gap-3 text-footnote text-fg-2" aria-hidden="true">
        <span className="h-px flex-1 bg-line" />
        or with your email
        <span className="h-px flex-1 bg-line" />
      </div>
      <EmailSignIn next={next} />

      {isSignup && (
        <p className="mt-5 px-1 text-center text-footnote text-fg-2">
          Next, you&apos;ll choose a username, your country and how you&apos;re joining.
        </p>
      )}

      {isSignup && (
        <div className="mt-8 rounded-2xl bg-surface p-5 text-center">
          <p className="text-headline">Not a developer? You belong here too.</p>
          <p className="mt-1.5 text-callout text-pretty text-fg-2">
            Volunteer, refer a school or orphanage, teach, translate or spread the word. Every bit of help reaches
            children in need.
          </p>
          <Link
            href="/get-involved"
            className="press mt-4 inline-flex min-h-11 items-center rounded-full border border-line bg-field px-5 text-callout font-medium hover:border-cta"
          >
            Open the get-involved form
          </Link>
        </div>
      )}

      <div aria-live="polite">
        {message && <p className="animate-fade mt-5 rounded-xl bg-[#f7b733]/15 px-4 py-3 text-callout text-fg">{message}</p>}
      </div>

      <p className="mt-8 text-center text-callout text-fg-2">
        {isSignup ? "Already a member? " : "New to maavaDao? "}
        <Link href={isSignup ? "/login" : "/signup"} className="text-link hover:underline">
          {isSignup ? "Sign in" : "Create an account"}
        </Link>
      </p>
    </div>
  );
}

/** Sign in with a 6-digit code sent by email. The email's link works too, in the same browser. */
function EmailSignIn({ next }: { next: string }) {
  const [sent, send, sending] = useActionState(sendEmailCode, {});
  // Back to the email field after "Use a different email"; each send starts a fresh code form.
  const [changing, setChanging] = useState(false);
  const [round, setRound] = useState(0);
  if (sent.email && !changing && !sending)
    return <CodeForm key={round} email={sent.email} next={next} onRestart={() => setChanging(true)} />;
  return (
    <form
      action={(f) => {
        setChanging(false);
        setRound((r) => r + 1);
        send(f);
      }}
      className="grid gap-3"
    >
      <input type="hidden" name="next" value={next} />
      <Field
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
        inputMode="email"
        required
        defaultValue={sent.email ?? sent.typed}
        error={sent.error}
      />
      <button
        type="submit"
        disabled={sending}
        className="press h-12 rounded-xl border border-line bg-field text-body font-medium hover:bg-bg-alt disabled:opacity-60"
      >
        {sending ? "Sending…" : "Email me a sign-in code"}
      </button>
    </form>
  );
}

function CodeForm({ email, next, onRestart }: { email: string; next: string; onRestart: () => void }) {
  const [state, verify, verifying] = useActionState(verifyEmailCode, { email });
  return (
    <form action={verify} className="grid gap-3">
      <input type="hidden" name="next" value={next} />
      <p className="px-1 text-callout text-pretty text-fg-2" aria-live="polite">
        We&apos;ve sent a code to <span className="font-medium text-fg">{email}</span>. Enter it here, or open the link in
        the email.
      </p>
      <Field
        label="6-digit code"
        name="code"
        inputMode="numeric"
        autoComplete="one-time-code"
        pattern="[0-9 ]*"
        maxLength={7}
        required
        autoFocus
        error={state.error}
      />
      <button
        type="submit"
        disabled={verifying}
        className="press h-12 rounded-xl bg-cta text-body font-medium text-white hover:bg-cta-hover disabled:opacity-60"
      >
        {verifying ? "Checking…" : "Sign in"}
      </button>
      <button type="button" onClick={onRestart} className="min-h-11 text-callout text-link hover:underline">
        Use a different email, or send a new code
      </button>
    </form>
  );
}
