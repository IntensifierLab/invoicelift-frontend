"use client";

import { useRepayments } from "@/components/repayment-ws-provider";

const STATE_LABELS: Record<string, string> = {
  connecting: "Connecting…",
  live: "Live",
  reconnecting: "Reconnecting…",
  polling: "Polling (live updates unavailable)",
};

/** Lender position cards, updated in real time via `RepaymentWsProvider`. */
export function RepaymentStatus() {
  const { positions, connectionState } = useRepayments();

  return (
    <div>
      <div className={`repayment-connection repayment-connection-${connectionState}`}>
        <span className="repayment-connection-dot" aria-hidden />
        {STATE_LABELS[connectionState]}
      </div>
      <div className="grid">
        {positions.map((position) => (
          <div className="card" key={position.poolId}>
            <h3>{position.poolName}</h3>
            <p>
              Outstanding: {position.outstanding.toLocaleString(undefined, { minimumFractionDigits: 2 })} USDC
            </p>
            <p>Repaid: {position.repaid.toLocaleString(undefined, { minimumFractionDigits: 2 })} USDC</p>
          </div>
        ))}
      </div>
    </div>
  );
}
