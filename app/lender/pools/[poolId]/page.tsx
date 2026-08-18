import { notFound } from "next/navigation";
import { PoolDetail } from "@/components/lender/pool-detail";
import { RouteGuard } from "@/components/route-guard";
import { findPool } from "@/lib/lender/pools-catalog";

export default async function LenderPoolDetailPage({
  params,
}: {
  params: Promise<{ poolId: string }>;
}) {
  const { poolId } = await params;
  const pool = findPool(poolId);
  if (!pool) notFound();

  return (
    <RouteGuard allow={["lender", "admin"]}>
      <section className="section">
        <span className="tag">Lenders</span>
        <PoolDetail pool={pool} />
      </section>
    </RouteGuard>
  );
}
