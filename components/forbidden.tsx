export function Forbidden({ message }: { message?: string }) {
  return (
    <section className="section forbidden">
      <span className="tag">403 &middot; Forbidden</span>
      <h2>You don&apos;t have access to this page.</h2>
      <p style={{ color: "var(--muted)" }}>
        {message ?? "Your connected wallet isn't assigned a role that can view this page."}
      </p>
    </section>
  );
}
