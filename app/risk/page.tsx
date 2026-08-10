"use client";

import { useEffect, useState } from "react";
import { EmptyState } from "@/components/empty-state";
import { RouteGuard } from "@/components/route-guard";
import { Skeleton, SkeletonBlock } from "@/components/ui/skeleton";

export default function Page() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(t);
  }, []);

  if (loading) {
    return (
      <RouteGuard allow={["lender", "admin"]}>
        <section className="section">
          <span className="tag">Risk</span>
          <h2>Repayment monitoring</h2>
          <div className="skeleton-card" style={{ minHeight: 180 }}>
            <SkeletonBlock lines={1} />
            <Skeleton width="40%" height={14} />
          </div>
        </section>
      </RouteGuard>
    );
  }

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
