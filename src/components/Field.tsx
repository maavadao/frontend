import type { InputHTMLAttributes } from "react";

/** Text input with an Apple-style floating label. */
export function Field({
  label,
  error,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { label: string; name: string; error?: string }) {
  const id = `f-${props.name}`;
  return (
    <div>
      <div className="relative">
        <input
          id={id}
          placeholder=" "
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-err` : undefined}
          {...props}
          className={`peer h-14 w-full rounded-xl border bg-field px-4 pt-5 text-body outline-none transition-[box-shadow,border-color] duration-200 focus:ring-4 ${
            error ? "border-danger focus:ring-danger/15" : "border-line focus:border-teal focus:ring-mint/50"
          }`}
        />
        <label
          htmlFor={id}
          className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-body text-fg-2 transition-all duration-300 ease-[var(--ease-spring)] peer-focus:top-4 peer-focus:text-caption peer-[:not(:placeholder-shown)]:top-4 peer-[:not(:placeholder-shown)]:text-caption"
        >
          {label}
        </label>
      </div>
      {error && (
        <p id={`${id}-err`} role="alert" className="animate-fade mt-1.5 px-1 text-footnote text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
