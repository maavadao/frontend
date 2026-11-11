/**
 * The maavaDao icon: a mint "M" with rounded joints, the orange dot above it
 * and an open book beneath. Drawn to match public/brand/maavadao-icon.png;
 * the exported files and when to use each are in public/brand/icons/README.md.
 */
export type LogoVariant = "slate" | "navy" | "mint" | "white" | "glyph" | "glyph-light";

const palettes: Record<LogoVariant, { tile?: string; edge?: string; m: string; book: string; dot: string }> = {
  slate: { tile: "#1e293b", m: "#5eead4", book: "#ffffff", dot: "#fdba74" },
  navy: { tile: "#0f172a", m: "#5eead4", book: "#ffffff", dot: "#fdba74" },
  mint: { tile: "#5eead4", m: "#0f172a", book: "#0f172a", dot: "#f97316" },
  white: { tile: "#ffffff", edge: "#dfe5ee", m: "#0d9488", book: "#0f172a", dot: "#f97316" },
  glyph: { m: "#5eead4", book: "#ffffff", dot: "#fdba74" },
  "glyph-light": { m: "#0d9488", book: "#0f172a", dot: "#f97316" },
};

export function LogoMark({ className = "h-7 w-7", variant = "slate" }: { className?: string; variant?: LogoVariant }) {
  const p = palettes[variant];
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
      {p.tile && <rect width="100" height="100" rx="20" fill={p.tile} />}
      {p.edge && <rect x="0.75" y="0.75" width="98.5" height="98.5" rx="19.25" fill="none" stroke={p.edge} strokeWidth="1.5" />}
      <path
        d="M28 65 L37 36.5 L50 55 L63 36.5 L72.5 65"
        stroke={p.m}
        strokeWidth="7"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <circle cx="50" cy="27" r="3.6" fill={p.dot} />
      <path
        d="M24.5 73 Q37.25 67.5 50 73 Q62.75 67.5 75.5 73"
        stroke={p.book}
        strokeWidth="4.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

/** Mark and name. `onDark` for navy grounds: white "maava", mint "Dao", as in the logo. */
export function Wordmark({ onDark = false, large = false }: { onDark?: boolean; large?: boolean }) {
  return (
    <span className={`flex items-center whitespace-nowrap ${large ? "gap-3" : "gap-2"}`}>
      <LogoMark className={`shrink-0 ${large ? "h-11 w-11" : "h-7 w-7"}`} />
      <span className={`leading-none font-extrabold tracking-[-0.035em] ${large ? "text-[1.75rem]" : "text-[1.1875rem]"}`}>
        <span className={onDark ? "text-white" : "text-fg"}>maava</span>
        <span className={onDark ? "text-mint" : "text-teal"}>Dao</span>
      </span>
    </span>
  );
}
