"use client";

import { useState } from "react";

const RESET_DELAY_MS = 1500;

type CopyButtonProps = {
  /** The full, untruncated value to copy — pass the real ID/address even
   * when the visible label next to this button is truncated for display. */
  value: string;
  /** Accessible label, e.g. "Copy invoice ID" or "Copy wallet address". */
  label: string;
  className?: string;
};

/** Copies `value` to the clipboard and shows a "Copied!" tooltip
 * confirmation. Falls back to `document.execCommand` for browsers/contexts
 * (e.g. non-HTTPS) where the async Clipboard API isn't available. */
export function CopyButton({ value, label, className }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy(e: React.MouseEvent) {
    e.stopPropagation();
    e.preventDefault();
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(value);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = value;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), RESET_DELAY_MS);
    } catch {
      // Clipboard access denied/unavailable — silently no-op rather than
      // throwing in the caller's click handler.
    }
  }

  return (
    <span className="copy-button-wrapper">
      <button
        type="button"
        onClick={handleCopy}
        className={["copy-button", className].filter(Boolean).join(" ")}
        aria-label={label}
      >
        {copied ? "✓" : "⧉"}
      </button>
      <span role="status" className="copy-button-tooltip" hidden={!copied}>
        Copied!
      </span>
    </span>
  );
}
