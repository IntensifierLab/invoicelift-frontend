import { PoolBrowser } from "@/components/lender/pool-browser";
import { RouteGuard } from "@/components/route-guard";

export default function LenderPoolsPage() {
  return (
    <RouteGuard allow={["lender", "admin"]}>
      <section className="section">
        <span className="tag">Lenders</span>
        <h2>Browse pools</h2>
        <PoolBrowser />
      </section>
    </RouteGuard>
  );
}
