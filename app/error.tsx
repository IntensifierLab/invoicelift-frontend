"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Runtime errors have nowhere else to surface yet (no error-reporting
    // integration wired up); log so they're at least visible in devtools.
    console.error(error);
  }, [error]);

  return (
    <section className="section forbidden">
      <span className="tag">Something went wrong</span>
      <h2>An unexpected error occurred.</h2>
      <p style={{ color: "var(--muted)" }}>
        Try again, or head back to the home page if the problem persists.
      </p>
      <button type="button" className="cta-secondary" onClick={() => reset()}>
        Retry
      </button>
    </section>
  );
}
