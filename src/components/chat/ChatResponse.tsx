// Adapted from vercel/chatbot (components/ai-elements/message.tsx, MessageResponse), Copyright 2024 Vercel, Inc., Apache License 2.0.
"use client";

import { memo } from "react";
import { Streamdown } from "streamdown";
import { code } from "@streamdown/code";
import { math } from "@streamdown/math";
import "katex/dist/katex.min.css";

const plugins = { code, math };

/**
 * Renders a reply's Markdown with Streamdown, which copes with Markdown that's
 * still arriving (an unclosed code block or bold mid-stream), highlights code
 * with a copy button, and typesets maths. It sanitises the HTML it produces.
 */
export const ChatResponse = memo(function ChatResponse({ text, streaming }: { text: string; streaming: boolean }) {
  return (
    <Streamdown
      className="chat-response size-full text-body [&>*:first-child]:mt-0 [&>*:last-child]:mb-0"
      plugins={plugins}
      isAnimating={streaming}
      controls={{ code: true, table: true }}
    >
      {text}
    </Streamdown>
  );
});
