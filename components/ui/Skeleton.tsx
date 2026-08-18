type SkeletonProps = {
  className?: string;
  width?: string | number;
  height?: string | number;
};

/** A single shimmering placeholder block. Compose these to match the shape
 * of the real content being loaded (see MetricTileSkeleton/ListSkeleton
 * below for ready-made shapes used across the data-fetching pages). */
export function Skeleton({ className, width, height }: SkeletonProps) {
  return (
    <span
      className={["skeleton", className].filter(Boolean).join(" ")}
      style={{ width, height }}
    />
  );
}

/** Placeholder for a MetricTile-shaped card (label + big value + sub text). */
export function MetricTileSkeleton() {
  return (
    <div className="tile skeleton-tile" aria-hidden="true">
      <Skeleton width="60%" height="0.85rem" />
      <Skeleton width="80%" height="1.6rem" className="skeleton-tile-value" />
      <Skeleton width="45%" height="0.8rem" />
    </div>
  );
}

type DataSkeletonProps = {
  /** Screen-reader label describing what's loading, e.g. "pool underwriting dashboard". */
  label: string;
  tiles?: number;
  rows?: number;
};

/** Full-page skeleton: a row of metric-tile placeholders plus a few list
 * rows, matching the metrics-grid + list layout used on the lender and
 * systemic-risk dashboards. Marked `aria-busy` so assistive tech announces
 * the loading state instead of reading empty/placeholder content. */
export function DataSkeleton({ label, tiles = 4, rows = 3 }: DataSkeletonProps) {
  return (
    <div aria-busy="true" aria-label={`Loading ${label}`} className="skeleton-page">
      <div className="grid">
        {Array.from({ length: tiles }).map((_, i) => (
          <MetricTileSkeleton key={i} />
        ))}
      </div>
      <div className="skeleton-list">
        {Array.from({ length: rows }).map((_, i) => (
          <Skeleton key={i} height="2.5rem" className="skeleton-row" />
        ))}
      </div>
    </div>
  );
}
