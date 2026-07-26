import { Suspense } from "react";
import { InvoiceList } from "@/components/invoice-list";
import { RouteGuard } from "@/components/route-guard";

export const metadata = {
  title: "Invoices",
};

export default function Page() {
  return (
    <RouteGuard allow={["lender", "admin"]}>
      <section className="section">
        <span className="tag">Invoices</span>
        <h2>Browse invoices</h2>
        <Suspense fallback={<p style={{ color: "var(--muted)" }}>Loading invoices…</p>}>
          <InvoiceList />
        </Suspense>
      </section>
    </RouteGuard>
  );
}
