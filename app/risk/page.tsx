import { EmptyState } from "@/components/empty-state";

export default function Page() {
  return (
    <section className="section">
      <span className="tag">Risk</span>
      <h2>Repayment monitoring</h2>
      <EmptyState
        illustration="repayments"
        heading="No repayments to monitor"
        description="Underwriting signals and repayment activity surface here once invoices are financed. There is nothing to track yet."
        cta={{ label: "View underwriting docs", href: "/docs" }}
      />
    </section>
  );
}
