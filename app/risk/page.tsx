import type { Metadata } from "next";
import { EmptyState } from "@/components/empty-state";
import { RouteGuard } from "@/components/route-guard";

export const metadata: Metadata = {
  title: "Risk",
  description: "Repayment monitoring and underwriting signals for financed invoices.",
};

export default function Page() {
  return (
    <RouteGuard allow={["lender", "admin"]}>
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
    </RouteGuard>

  );
}
