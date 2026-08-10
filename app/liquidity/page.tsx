"use client";

import { RepaymentStatus } from "@/components/repayment-status";
import { RepaymentWsProvider, useRepayments } from "@/components/repayment-ws-provider";
import { RouteGuard } from "@/components/route-guard";
import { LiquiditySkeleton } from "@/components/liquidity-skeleton";

/** Renders the live positions grid, or a skeleton while the transport connects. */
function LiquidityContent() {
  const { connectionState } = useRepayments();
  if (connectionState === "connecting") {
    return <LiquiditySkeleton />;
  }
  return <RepaymentStatus />;
}

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
          <LiquidityContent />
        </RepaymentWsProvider>
      </section>
    </RouteGuard>
  );
}
