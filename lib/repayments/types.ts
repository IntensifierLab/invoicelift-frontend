/** Shared types for the real-time repayment status feature (issue #29). */

export type LenderPosition = {
  poolId: string;
  poolName: string;
  /** Outstanding principal still owed to the lender, in USDC. */
  outstanding: number;
  /** Cumulative amount repaid so far, in USDC. */
  repaid: number;
  updatedAt: string; // ISO timestamp
};

export type RepaymentEvent = {
  type: "repayment.updated";
  position: LenderPosition;
};

export type ConnectionState = "connecting" | "live" | "reconnecting" | "polling";
