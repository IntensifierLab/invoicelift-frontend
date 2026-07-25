import { Suspense } from "react";
import { InvoiceRegistryStatusViewer } from "@/components/invoice-registry/status-viewer";

export const metadata = {
  title: "Invoice Registry",
};

// Deliberately not wrapped in RouteGuard: this is a public, read-only view
// of on-chain invoice state, accessible without a connected wallet.
export default function Page() {
  return (
    <section className="section">
      <span className="tag">Registry</span>
      <h2>Invoice registry status</h2>
      <p style={{ color: "var(--muted)" }}>
        Look up any invoice&apos;s on-chain state — no wallet connection required.
      </p>
      <Suspense fallback={<p style={{ color: "var(--muted)" }}>Loading…</p>}>
        <InvoiceRegistryStatusViewer />
      </Suspense>
    </section>
  );
}
