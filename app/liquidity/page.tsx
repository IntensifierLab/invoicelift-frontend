import type { Metadata } from "next";
import { RepaymentStatus } from "@/components/repayment-status";
import { RepaymentWsProvider } from "@/components/repayment-ws-provider";
import { RouteGuard } from "@/components/route-guard";

export const metadata: Metadata = {
  title: "Liquidity",
  description: "Track your lending positions and live repayment progress on InvoiceLift.",
};

export default function Page() {
  return (
    <RouteGuard allow={["lender", "admin"]}>
      <section className="section">
        <span className="tag">Liquidity</span>
        <h2>Your positions</h2>
        <p style={{ color: "var(--muted)" }}>
          Repayment progress updates live as borrowers repay. If the live
          connection drops, this falls back to polling automatically.
        </p>
        <RepaymentWsProvider>
          <RepaymentStatus />
        </RepaymentWsProvider>
      </section>
    </RouteGuard>
  );
}
