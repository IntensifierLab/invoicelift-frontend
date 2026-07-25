export function MetricTile({
  label,
  value,
  sub,
  tone = "default",
}: {
  label: string;
  value: string;
  sub?: string;
  tone?: "default" | "warning";
}) {
  return (
    <div className={`metric-tile${tone === "warning" ? " metric-tile-warning" : ""}`}>
      <span className="metric-tile-label">{label}</span>
      <span className="metric-tile-value">{value}</span>
      {sub && <span className="metric-tile-sub">{sub}</span>}
    </div>
  );
}
