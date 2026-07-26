import type { InvoiceNftTransfer } from "@/lib/invoice-nft";

function truncate(address: string): string {
  return address.length > 12 ? `${address.slice(0, 6)}…${address.slice(-4)}` : address;
}

const HOLDER_TONES = ["principal", "fee", "reserve", "yield"] as const;

/**
 * Ownership-timeline bar: one segment per holder, width proportional to how
 * long that holder held the NFT relative to the whole mint-to-now span. Plain
 * CSS bar — same convention as `RepaymentWaterfallChart`/`PoolHealthChart` —
 * rather than a charting library dependency.
 */
export function TransferHistoryChart({ mintDate, transfers }: { mintDate: string; transfers: InvoiceNftTransfer[] }) {
  if (transfers.length === 0) {
    return <p style={{ color: "var(--muted)" }}>No transfers recorded yet — still held by the minter.</p>;
  }

  const start = new Date(mintDate).getTime();
  const end = Date.now();
  const totalSpan = Math.max(end - start, 1);

  const boundaries = [start, ...transfers.map((t) => new Date(t.timestamp).getTime()), end];
  const holders = [transfers[0].from, ...transfers.map((t) => t.to)];

  const segments = holders.map((holder, i) => ({
    holder,
    tone: HOLDER_TONES[i % HOLDER_TONES.length],
    widthPct: (Math.max(boundaries[i + 1] - boundaries[i], 0) / totalSpan) * 100,
  }));

  return (
    <div className="nft-transfer-chart">
      <div className="waterfall-bar" role="img" aria-label="Ownership timeline">
        {segments.map((segment, i) => (
          <div
            key={`${segment.holder}-${i}`}
            className={`waterfall-segment waterfall-segment-${segment.tone}`}
            style={{ width: `${segment.widthPct}%` }}
            title={`${truncate(segment.holder)}`}
          />
        ))}
      </div>
      <ul className="waterfall-legend">
        {segments.map((segment, i) => (
          <li key={`${segment.holder}-legend-${i}`}>
            <span className={`waterfall-swatch waterfall-segment-${segment.tone}`} />
            <span title={segment.holder}>{truncate(segment.holder)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
