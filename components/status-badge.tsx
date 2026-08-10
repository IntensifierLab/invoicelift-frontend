"use client";

/**
 * Status badge component with consistent colour coding for invoice states.
 * Maps status strings to predetermined colours and labels.
 *
 * Usage:
 *   <StatusBadge status="financed" />
 *   <StatusBadge status="Draft" />
 */

export type StatusBadgeProps = {
  /** The status string (case-insensitive). */
  status: string;
};

/** Known statuses and their display metadata. */
export const STATUS_META: Record<string, { label: string; className: string }> = {
  draft: { label: "Draft", className: "status-draft" },
  pending: { label: "Pending", className: "status-draft" },
  verified: { label: "Verified", className: "status-verified" },
  financed: { label: "Financed", className: "status-financed" },
  repaid: { label: "Repaid", className: "status-repaid" },
  defaulted: { label: "Defaulted", className: "status-defaulted" },
  overdue: { label: "Overdue", className: "status-defaulted" },
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const meta = STATUS_META[status.toLowerCase()] ?? {
    label: status,
    className: "status-draft",
  };

  return (
    <span className={`status-badge ${meta.className}`}>
      <span className="status-badge-dot" aria-hidden />
      {meta.label}
    </span>
  );
}
