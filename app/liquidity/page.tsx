import { EmptyState } from "@/components/empty-state";

export default function Page() {
  return (
    <section className="section">
      <span className="tag">Liquidity</span>
      <h2>Liquidity pools</h2>
      <EmptyState
        illustration="pools"
        heading="No pools available yet"
        description="Liquidity pools open here as they launch. Provide capital to earn yield from financed invoices once the first pool is live."
        cta={{ label: "Explore the roadmap", href: "/roadmap" }}
      />
    </section>
  );
}
