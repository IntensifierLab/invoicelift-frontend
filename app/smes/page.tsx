import { EmptyState } from "@/components/empty-state";

export default function Page() {
  return (
    <section className="section">
      <span className="tag">SMEs</span>
      <h2>Your invoices</h2>
      <EmptyState
        illustration="invoices"
        heading="No invoices yet"
        description="Upload your first invoice to request financing. Approved invoices appear here with their status and the advance available against them."
        cta={{ label: "Upload an invoice", href: "/smes" }}
      />
    </section>
  );
}
