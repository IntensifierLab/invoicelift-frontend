import { YieldCalculator } from "@/components/yield-calculator";

export const metadata = {
  title: "Yield calculator",
};

export default function Page() {
  return (
    <section className="section">
      <span className="tag">Calculator</span>
      <h2>Estimate your yield</h2>
      <p style={{ color: "var(--muted)" }}>
        See expected returns and a worst-case scenario based on a pool&apos;s historical performance
        before you deposit.
      </p>
      <YieldCalculator />
    </section>
  );
}
