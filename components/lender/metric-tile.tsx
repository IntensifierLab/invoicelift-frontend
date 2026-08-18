import { Tooltip } from "@/components/ui/Tooltip";

export function MetricTile({
  label,
  value,
  sub,
  tone = "default",
  tooltip,
}: {
  label: string;
  value: string;
  sub?: string;
  tone?: "default" | "warning";
  tooltip?: string;
}) {
  return (
    <div className={`metric-tile${tone === "warning" ? " metric-tile-warning" : ""}`}>
      <span className="metric-tile-label">
        {tooltip ? <Tooltip content={tooltip}>{label}</Tooltip> : label}
      </span>
      <span className="metric-tile-value">{value}</span>
      {sub && <span className="metric-tile-sub">{sub}</span>}
    </div>
  );
}
