import { Suspense } from "react";
import { RepaymentLog } from "@/components/repayment-waterfall/repayment-log";
import { RouteGuard } from "@/components/route-guard";

export const metadata = {
  title: "Repayment Waterfall",
};

export default function Page() {
  return (
    <RouteGuard allow={["lender", "admin"]}>
      <section className="section">
        <span className="tag">Repayments</span>
        <h2>Repayment waterfall</h2>
        <p style={{ color: "var(--muted)" }}>
          How each buyer repayment splits across principal, protocol fee, reserve, and lender yield.
        </p>
        <Suspense fallback={<p style={{ color: "var(--muted)" }}>Loading repayments…</p>}>
          <RepaymentLog />
        </Suspense>
      </section>
    </RouteGuard>
  );
}
