import Link from "next/link";

export default function NotFound() {
  return (
    <section className="section forbidden">
      <span className="tag">404 &middot; Not found</span>
      <h2>This page doesn&apos;t exist.</h2>
      <p style={{ color: "var(--muted)" }}>
        The link you followed may be broken, or the page may have moved.
      </p>
      <Link href="/" className="cta">
        Back to home
      </Link>
    </section>
  );
}
