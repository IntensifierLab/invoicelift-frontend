"use client";

import { Skeleton, SkeletonBlock } from "@/components/ui/skeleton";

/**
 * LenderDashboardSkeleton — mirrors the layout of the lender/portfolio
 * dashboard (metric tiles row + pool chart + tables) so the loading state
 * intercepts the same visual space as the real content.
 */
export function LenderDashboardSkeleton() {
  return (
    <div role="status" aria-busy="true" aria-label="Loading portfolio">
      <div className="grid lender-metrics">
        {Array.from({ length: 4 }).map((_, i) => (
          <div className="skeleton-metric-tile" key={i}>
            <Skeleton width={110} height={12} />
            <Skeleton width={90} height={26} />
            <Skeleton width={140} height={12} />
          </div>
        ))}
      </div>

      <div className="section">
        <Skeleton width={180} height={16} style={{ marginBottom: 16 }} />
        <div className="skeleton-card" style={{ minHeight: 220 }}>
          <SkeletonBlock lines={2} />
          <Skeleton width="70%" height={160} />
        </div>
      </div>

      <div className="section">
        <Skeleton width={150} height={16} style={{ marginBottom: 16 }} />
        <div className="skeleton-card">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} width="100%" height={34} style={{ marginBottom: 12 }} />
          ))}
        </div>
      </div>
    </div>
  );
}