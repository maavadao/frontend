/**
 * Some open models (Qwen, DeepSeek and others) write their reasoning at the
 * start of the reply between <think> tags instead of in a separate field. This
 * splits a streamed reply into reasoning and answer, coping with tags that
 * arrive split across chunks.
 */
export function thinkTagSplitter(emit: (kind: "thinking" | "text", text: string) => void) {
  const state: { mode: "start" | "think" | "text"; held: string } = { mode: "start", held: "" };
  const OPEN = "<think>";
  const CLOSE = "</think>";

  return {
    push(piece: string) {
      state.held += piece;
      if (state.mode === "start") {
        const trimmed = state.held.trimStart();
        if (OPEN.startsWith(trimmed)) return; // could still be the opening tag
        if (trimmed.startsWith(OPEN)) {
          state.mode = "think";
          state.held = trimmed.slice(OPEN.length);
        } else state.mode = "text";
      }
      if (state.mode === "think") {
        const end = state.held.indexOf(CLOSE);
        if (end === -1) {
          const keep = state.held.length - CLOSE.length; // the closing tag may be split across chunks
          if (keep > 0) {
            emit("thinking", state.held.slice(0, keep));
            state.held = state.held.slice(keep);
          }
          return;
        }
        if (end > 0) emit("thinking", state.held.slice(0, end));
        state.held = state.held.slice(end + CLOSE.length).trimStart();
        state.mode = "text";
      }
      if (state.held) {
        emit("text", state.held);
        state.held = "";
      }
    },
    /** Sends whatever is still held back when the reply ends. */
    end() {
      if (state.held) emit(state.mode === "think" ? "thinking" : "text", state.held);
      state.held = "";
    },
  };
}
