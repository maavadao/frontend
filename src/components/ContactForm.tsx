"use client";

import { useState, type FormEvent } from "react";
import { Field } from "./Field";
import { hasEmail, site } from "@/lib/site";

const topics = [
  "Become a founding contributor",
  "List an AI agent",
  "Education partner or pilot community",
  "Funder, NGO or partner",
  "Something else",
];

/** No backend yet: submitting opens the visitor's mail app with the message prefilled. */
export function ContactForm() {
  const [sent, setSent] = useState(false);

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const subject = `[${data.get("topic")}] from ${data.get("name")}`;
    const body = `${data.get("message")}\n\n— ${data.get("name")} (${data.get("email")})`;
    const to = hasEmail ? site.email : "";
    window.location.href = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setSent(true);
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-3 sm:grid-cols-2">
      <Field label="Your name" name="name" autoComplete="name" required />
      <Field label="Email" name="email" type="email" autoComplete="email" required />
      <label className="relative sm:col-span-2">
        <span className="sr-only">Topic</span>
        <select
          name="topic"
          defaultValue={topics[0]}
          className="h-14 w-full appearance-none rounded-xl border border-line bg-field px-4 text-body outline-none transition-[box-shadow,border-color] duration-200 focus:border-teal focus:ring-4 focus:ring-mint/50"
        >
          {topics.map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
        <span className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-fg-2" aria-hidden="true">
          ⌄
        </span>
      </label>
      <label className="sm:col-span-2">
        <span className="sr-only">Message</span>
        <textarea
          name="message"
          required
          rows={4}
          placeholder="Tell us how you'd like to help, or what your school or community needs."
          className="w-full resize-none rounded-xl border border-line bg-field px-4 py-3.5 text-body outline-none transition-[box-shadow,border-color] duration-200 placeholder:text-fg-2 focus:border-teal focus:ring-4 focus:ring-mint/50"
        />
      </label>
      <div className="flex flex-wrap items-center gap-4 sm:col-span-2">
        <button
          type="submit"
          className="btn btn-primary px-6 py-3 text-body"
        >
          Send message
        </button>
        <p className="text-callout text-fg-2" aria-live="polite">
          {sent
            ? hasEmail
              ? "Your mail app should open with the message ready to send."
              : "Your mail app should open with the message ready to send — add a recipient, since our address isn't public yet."
            : hasEmail
              ? <>Or write to <a className="text-link hover:underline" href={`mailto:${site.email}`}>{site.email}</a></>
              : `Email: ${site.email}`}
        </p>
      </div>
    </form>
  );
}
