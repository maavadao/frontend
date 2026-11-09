import { Fragment, type ReactNode } from "react";

/**
 * A small Markdown renderer for chat replies: paragraphs, headings, bullet and
 * numbered lists, code blocks, and inline bold, italics, code and links. It
 * builds React elements (no HTML strings), so a reply can't inject markup.
 */
export function ChatMarkdown({ text }: { text: string }) {
  const parts = text.split(/^```[^\n]*\n?/m);
  return (
    <div className="grid gap-3">
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <pre
            key={i}
            className="overflow-x-auto rounded-2xl bg-bg-alt px-4 py-3 font-mono text-footnote leading-relaxed whitespace-pre"
          >
            <code>{part.replace(/\n$/, "")}</code>
          </pre>
        ) : (
          <Fragment key={i}>{blocks(part)}</Fragment>
        ),
      )}
    </div>
  );
}

function blocks(text: string) {
  const out: ReactNode[] = [];
  const lines = text.split("\n");
  let para: string[] = [];
  let list: { ordered: boolean; items: string[] } | null = null;

  const flush = () => {
    if (para.length) {
      out.push(
        <p key={out.length} className="whitespace-pre-line">
          {inline(para.join("\n"))}
        </p>,
      );
    }
    para = [];
    if (list) {
      const items = list.items.map((item, i) => <li key={i}>{inline(item)}</li>);
      out.push(
        list.ordered ? (
          <ol key={out.length} className="grid list-decimal gap-1 pl-6">
            {items}
          </ol>
        ) : (
          <ul key={out.length} className="grid list-disc gap-1 pl-6">
            {items}
          </ul>
        ),
      );
    }
    list = null;
  };

  for (const line of lines) {
    const heading = line.match(/^#{1,6}\s+(.*)/);
    const bullet = line.match(/^\s*[-*+]\s+(.*)/);
    const numbered = line.match(/^\s*\d+[.)]\s+(.*)/);
    if (!line.trim()) {
      flush();
    } else if (heading) {
      flush();
      out.push(
        <p key={out.length} className="text-subhead font-semibold">
          {inline(heading[1])}
        </p>,
      );
    } else if (bullet || numbered) {
      const ordered = !!numbered;
      if (para.length || (list && list.ordered !== ordered)) flush();
      list ??= { ordered, items: [] };
      list.items.push((bullet ?? numbered)![1]);
    } else if (list && /^\s+/.test(line)) {
      list.items[list.items.length - 1] += ` ${line.trim()}`;
    } else {
      if (list) flush();
      para.push(line);
    }
  }
  flush();
  return out;
}

function inline(text: string): ReactNode[] {
  const out: ReactNode[] = [];
  const pattern = /(`[^`\n]+`)|(\*\*[^*\n]+\*\*)|(\*[^*\n]+\*|_[^_\n]+_)|\[([^\]\n]+)\]\((https?:\/\/[^)\s]+)\)/g;
  let last = 0;
  for (const m of text.matchAll(pattern)) {
    if (m.index > last) out.push(text.slice(last, m.index));
    const key = out.length;
    if (m[1]) {
      out.push(
        <code key={key} className="rounded-md bg-bg-alt px-1.5 py-0.5 font-mono text-[0.9em]">
          {m[1].slice(1, -1)}
        </code>,
      );
    } else if (m[2]) {
      out.push(<strong key={key}>{m[2].slice(2, -2)}</strong>);
    } else if (m[3]) {
      out.push(<em key={key}>{m[3].slice(1, -1)}</em>);
    } else {
      out.push(
        <a key={key} href={m[5]} target="_blank" rel="noopener noreferrer nofollow" className="text-link hover:underline">
          {m[4]}
        </a>,
      );
    }
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}
