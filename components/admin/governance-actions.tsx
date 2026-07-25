import type { GovernanceAction } from "@/lib/admin/systemic-risk";

/** Recommended governance actions surfaced from alerts + pool correlations
 * (issue #36's final acceptance criterion) -- concrete next steps, not just
 * raw metrics, for the protocol admins who own the response. */
export function GovernanceActions({ actions }: { actions: GovernanceAction[] }) {
  if (actions.length === 0) {
    return <p className="lender-empty">No systemic risk conditions require governance action right now.</p>;
  }

  return (
    <ul className="governance-actions-list">
      {actions.map((item, i) => (
        <li key={i} className={`governance-action governance-action-${item.severity}`}>
          <span className="tag">{item.severity === "high" ? "Act now" : "Monitor"}</span>
          <p>{item.action}</p>
        </li>
      ))}
    </ul>
  );
}
