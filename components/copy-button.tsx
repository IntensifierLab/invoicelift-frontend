"use client";

import { useState, useCallback, useRef } from "react";

interface CopyButtonProps {
  /** The text to copy to clipboard. */
  text: string;
  /** Accessible label for the button — describes what is being copied. */
  label: string;
}

/**
 * A small, inline copy-to-clipboard button with a brief "Copied!"
 * confirmation state. Uses `navigator.clipboard.writeText` with a
 * `document.execCommand("copy")` fallback for older browsers.
 *
 * Accessible: `aria-label` describes the action, and the confirmation
 * is announced via a live region (aria-live="polite").
 */
export function CopyButton({ text, label }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleCopy = useCallback(async () => {
    // Clear any pending timer so the "Copied!" state doesn't get
    // prematurely cleared if the user clicks rapidly.
    if (timerRef.current) clearTimeout(timerRef.current);

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
    } catch {
      // Fallback for older browsers
      try {
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.style.position = "fixed";
        ta.style.left = "-9999px";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
        setCopied(true);
      } catch {
        // Clipboard not available — silently fail
        return;
      }
    }

    timerRef.current = setTimeout(() => setCopied(false), 1800);
  }, [text]);

  return (
    <span className="copy-button-wrapper" style={{ position: "relative" }}>
      <button
        type="button"
        onClick={handleCopy}
        aria-label={`${label} — ${copied ? "Copied!" : "Copy to clipboard"}`}
        className="copy-button"
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: "24px",
          height: "24px",
          padding: 0,
          border: "none",
          background: "transparent",
          cursor: "pointer",
          color: "var(--color-muted, #888)",
          borderRadius: "4px",
          transition: "color 0.15s, background 0.15s",
          verticalAlign: "middle",
          marginLeft: "6px",
          fontSize: "14px",
          lineHeight: 1,
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.color = "var(--color-accent, #ffc684)";
          (e.currentTarget as HTMLElement).style.background = "var(--color-surface-hover, rgba(255,198,132,0.08))";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.color = "var(--color-muted, #888)";
          (e.currentTarget as HTMLElement).style.background = "transparent";
        }}
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
        </svg>
      </button>

      {/* "Copied!" tooltip */}
      {copied && (
        <span
          role="status"
          aria-live="polite"
          className="copy-button-tooltip"
          style={{
            position: "absolute",
            bottom: "calc(100% + 4px)",
            left: "50%",
            transform: "translateX(-50%)",
            whiteSpace: "nowrap",
            fontSize: "11px",
            padding: "2px 6px",
            borderRadius: "4px",
            background: "var(--color-surface-raised, #333)",
            color: "var(--color-text, #fff)",
            pointerEvents: "none",
            zIndex: 10,
          }}
        >
          Copied!
        </span>
      )}
    </span>
  );
}