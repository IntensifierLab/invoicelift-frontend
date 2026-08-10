"use client";

import { useCallback, useRef, useState } from "react";

interface TooltipProps {
  /** The visible term the user hovers or focuses on. */
  children: React.ReactNode;
  /** The explanation shown in the tooltip popup. */
  content: string;
  /** Optional: place the tooltip above or below the trigger. */
  position?: "top" | "bottom";
}

/**
 * Reusable tooltip for financial/DeFi terms.
 *
 * - Visible on hover and keyboard focus (Tab).
 * - Closes on Escape or blur.
 * - Uses pure CSS for the floating popup (no extra dependencies).
 */
export function Tooltip({
  children,
  content,
  position = "top",
}: TooltipProps) {
  const [open, setOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const triggerRef = useRef<HTMLSpanElement>(null);

  const show = useCallback(() => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpen(true);
  }, []);

  const hide = useCallback(() => {
    // Small delay so the user can move the mouse from the trigger to the
    // tooltip itself without it disappearing.
    closeTimer.current = setTimeout(() => setOpen(false), 80);
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        triggerRef.current?.blur();
      }
    },
    [],
  );

  return (
    <span
      ref={triggerRef}
      className="tooltip-trigger"
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="tooltip"
      aria-describedby={open ? `tooltip-${cssSafe(content)}` : undefined}
    >
      {children}
      {open && (
        <span
          id={`tooltip-${cssSafe(content)}`}
          className={`tooltip-popup tooltip-popup--${position}`}
          role="tooltip"
        >
          {content}
        </span>
      )}
    </span>
  );
}

/** Crude CSS-safe identifier — just enough for aria-describedby uniqueness. */
function cssSafe(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 60);
}