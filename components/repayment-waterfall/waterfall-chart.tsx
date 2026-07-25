import type { RepaymentWaterfallEntry } from "@/lib/repayment-waterfall/mock-data";

function formatCurrency(n: number): string {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

const BUCKETS: { key: keyof RepaymentWaterfallEntry["split"]; label: string; tone: string }[] = [
  { key: "principal", label: "Principal", tone: "principal" },
  { key: "protocolFee", label: "Protocol fee", tone: "fee" },
  { key: "reserve", label: "Reserve", tone: "reserve" },
  { key: "lenderYield", label: "Lender yield", tone: "yield" },
];

/**
 * Stacked horizontal bar showing how one repayment splits across principal,
 * protocol fee, reserve, and lender yield — a plain CSS bar (same convention
 * as `PoolHealthChart`) rather than a charting library dependency.
 */
export function RepaymentWaterfallChart({ entry }: { entry: RepaymentWaterfallEntry }) {
  const { total, segments } = BUCKETS.reduce(
    (acc, bucket) => {
      const amount = entry.split[bucket.key];
      acc.total += amount;
      acc.segments.push({ ...bucket, amount });
      return acc;
    },
    { total: 0, segments: [] as { key: string; label: string; tone: string; amount: number }[] },
  );

  return (
    <div className="waterfall-chart">
      <div className="waterfall-bar" role="img" aria-label={`Repayment split for ${entry.id}`}>
        {segments.map((segment) => (
          <div
            key={segment.key}
            className={`waterfall-segment waterfall-segment-${segment.tone}`}
            style={{ width: `${total === 0 ? 0 : (segment.amount / total) * 100}%` }}
            title={`${segment.label}: ${formatCurrency(segment.amount)}`}
          />
        ))}
      </div>
      <ul className="waterfall-legend">
        {segments.map((segment) => (
          <li key={segment.key}>
            <span className={`waterfall-swatch waterfall-segment-${segment.tone}`} />
            {segment.label}: {formatCurrency(segment.amount)}
          </li>
        ))}
      </ul>
    </div>
  );
}
