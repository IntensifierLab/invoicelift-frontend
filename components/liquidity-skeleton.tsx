"use client";

import { Skeleton, SkeletonBlock } from "@/components/ui/skeleton";

/**
 * LiquiditySkeleton — mirrors the RepaymentStatus grid layout of pool
 * position cards so the loading state feels continuous.
 */
export function LiquiditySkeleton() {
  return (
    <div role="status" aria-busy="true" aria-label="Loading liquidity positions">
      <div className="repayment-connection">
        <span className="repayment-connection-dot" aria-hidden />
        <Skeleton width={120} height={14} />
      </div>
      <div className="grid">
        {Array.from({ length: 4 }).map((_, i) => (
          <div className="skeleton-card" key={i}>
            <Skeleton width="65%" height={18} />
            <SkeletonBlock lines={2} />
          </div>
        ))}
      </div>
    </div>
  );
}