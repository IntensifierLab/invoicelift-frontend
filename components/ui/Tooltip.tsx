"use client";

import { useId, useState } from "react";

type TooltipProps = {
  content: string;
  children: React.ReactNode;
};

/** Reusable, keyboard-accessible tooltip. Shows on hover *or* focus (so
 * keyboard/screen-reader users get the same explanation as mouse users),
 * and wires up `aria-describedby` rather than relying on the browser's
 * native `title` attribute (which is inconsistent across screen readers). */
export function Tooltip({ content, children }: TooltipProps) {
  const [open, setOpen] = useState(false);
  const id = useId();

  return (
    <span
      className="tooltip-wrapper"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
    >
      <span tabIndex={0} aria-describedby={id} className="tooltip-trigger">
        {children}
      </span>
      <span role="tooltip" id={id} className="tooltip-bubble" hidden={!open}>
        {content}
      </span>
    </span>
  );
}
