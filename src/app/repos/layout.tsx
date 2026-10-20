import type { ReactNode } from "react";

/** The repos list, with a slot for the repo detail when it opens over the list. */
export default function ReposLayout({ children, modal }: { children: ReactNode; modal: ReactNode }) {
  return (
    <>
      {children}
      {modal}
    </>
  );
}
