import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
};

export default function Page() {
  return (
    <section className="section">
      <span className="tag">Legal</span>
      <h2>Terms of Service</h2>
      <p style={{ color: "var(--muted)" }}>
        Scaffold page — replace with production terms of service content and
        legal review before mainnet launch.
      </p>
      <p style={{ color: "var(--muted)" }}>
        InvoiceLift is invoice financing infrastructure built on Stellar. Use
        of this application is subject to the terms published here once
        finalized; nothing on this page constitutes financial or legal
        advice.
      </p>
    </section>
  );
}
