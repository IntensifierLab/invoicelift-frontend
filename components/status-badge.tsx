import styles from "./status-badge.module.css";

export type BadgeStatus = "draft" | "verified" | "financed" | "repaid" | "defaulted";

const LABELS: Record<BadgeStatus, string> = {
  draft: "Draft",
  verified: "Verified",
  financed: "Financed",
  repaid: "Repaid",
  defaulted: "Defaulted",
};

/**
 * Consistent invoice-state badge. Colour is paired with a label (and a
 * distinct dot) rather than used alone, so the state reads correctly for
 * colour-blind users and screen readers.
 */
export function StatusBadge({ status }: { status: BadgeStatus }) {
  return (
    <span className={`${styles.badge} ${styles[status]}`}>
      <span className={styles.icon} aria-hidden />
      {LABELS[status]}
    </span>
  );
}
