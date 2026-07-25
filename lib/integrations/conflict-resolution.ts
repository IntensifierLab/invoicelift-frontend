/**
 * Conflict resolution for invoices synced from an accounting platform
 * (issue #34). Strategy is documented in detail in `docs/integrations.md`;
 * summary:
 *
 *   - Financial fields (amount, currency, due date, paid/unpaid status) are
 *     owned by the accounting platform — the incoming record always wins,
 *     since Xero/QuickBooks is the source of truth for money that actually
 *     moved.
 *   - Platform-local fields (financing status, lender assignment, on-chain
 *     registry id) are owned by InvoiceLift — the local record always wins,
 *     since the accounting platform has no concept of them.
 *   - Ties are broken by `updatedAt`: last write wins, but only within a
 *     field's own ownership above. A record with no local counterpart is a
 *     straight insert.
 */

export type SyncedInvoice = {
  externalId: string;
  amount: number;
  currency: string;
  dueDate: string; // ISO date
  paid: boolean;
  updatedAt: string; // ISO timestamp, from the accounting platform
};

export type LocalInvoice = {
  externalId: string;
  amount: number;
  currency: string;
  dueDate: string;
  paid: boolean;
  updatedAt: string;
  /** InvoiceLift-owned fields the accounting platform knows nothing about. */
  financingStatus: "unfinanced" | "requested" | "financed" | "repaid";
  registryId: string | null;
};

export type ConflictResolution =
  | { kind: "insert"; invoice: LocalInvoice }
  | { kind: "update"; invoice: LocalInvoice; changedFields: string[] }
  | { kind: "unchanged"; invoice: LocalInvoice };

/**
 * Merges an incoming accounting-platform record with the local record (if
 * any). Pure function — no I/O — so it's trivial to unit test and to reuse
 * from both the webhook handler and a future bulk-import job.
 */
export function resolveInvoiceConflict(
  incoming: SyncedInvoice,
  local: LocalInvoice | undefined
): ConflictResolution {
  if (!local) {
    return {
      kind: "insert",
      invoice: {
        ...incoming,
        financingStatus: "unfinanced",
        registryId: null,
      },
    };
  }

  // The accounting platform is authoritative for financial fields; skip the
  // merge entirely if it has nothing newer than what we already applied.
  if (incoming.updatedAt <= local.updatedAt) {
    return { kind: "unchanged", invoice: local };
  }

  const changedFields: string[] = [];
  const merged: LocalInvoice = { ...local };

  for (const field of ["amount", "currency", "dueDate", "paid"] as const) {
    if (incoming[field] !== local[field]) {
      changedFields.push(field);
      (merged as unknown as Record<string, unknown>)[field] = incoming[field];
    }
  }
  merged.updatedAt = incoming.updatedAt;

  if (changedFields.length === 0) {
    return { kind: "unchanged", invoice: local };
  }

  return { kind: "update", invoice: merged, changedFields };
}
