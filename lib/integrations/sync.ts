import { resolveInvoiceConflict, type LocalInvoice, type SyncedInvoice } from "./conflict-resolution";
import type { AccountingProvider } from "./providers";

/**
 * Fetches unpaid receivables eligible for financing from the connected
 * accounting platform and merges them into the local invoice set via
 * `resolveInvoiceConflict`. Called once right after a successful OAuth
 * connection (see the callback route), and again from the webhook handler
 * whenever the platform reports a status change.
 *
 * `existingByExternalId` and the return value are in-memory here because
 * this repo has no database yet — swap the lookup/persist steps for real
 * reads/writes once one exists; `resolveInvoiceConflict` itself needs no
 * changes.
 */
export async function importEligibleReceivables(
  provider: AccountingProvider,
  accessToken: string,
  existingByExternalId: ReadonlyMap<string, LocalInvoice>
): Promise<LocalInvoice[]> {
  const synced = await fetchUnpaidReceivables(provider, accessToken);

  const results: LocalInvoice[] = [];
  for (const invoice of synced) {
    const resolution = resolveInvoiceConflict(invoice, existingByExternalId.get(invoice.externalId));
    if (resolution.kind !== "unchanged") results.push(resolution.invoice);
  }
  return results;
}

/** Provider-specific unpaid-receivables query, normalized to `SyncedInvoice`. */
async function fetchUnpaidReceivables(
  provider: AccountingProvider,
  accessToken: string
): Promise<SyncedInvoice[]> {
  if (provider === "xero") {
    const response = await fetch(
      'https://api.xero.com/api.xro/2.0/Invoices?where=Type=="ACCREC"&&Status=="AUTHORISED"',
      { headers: { Authorization: `Bearer ${accessToken}`, Accept: "application/json" } }
    );
    if (!response.ok) throw new Error(`Xero invoice fetch failed: ${response.status}`);
    const data = (await response.json()) as { Invoices?: XeroInvoice[] };
    return (data.Invoices ?? []).map(normalizeXeroInvoice);
  }

  // QuickBooks needs the connected realm (company) id, which is returned
  // alongside the OAuth callback and would be looked up from the saved
  // connection here; using a placeholder query shape until that lookup
  // lands with real persistence.
  const response = await fetch(
    "https://quickbooks.api.intuit.com/v3/company/REALM_ID/query?query=" +
      encodeURIComponent("SELECT * FROM Invoice WHERE Balance > '0'"),
    { headers: { Authorization: `Bearer ${accessToken}`, Accept: "application/json" } }
  );
  if (!response.ok) throw new Error(`QuickBooks invoice fetch failed: ${response.status}`);
  const data = (await response.json()) as { QueryResponse?: { Invoice?: QuickBooksInvoice[] } };
  return (data.QueryResponse?.Invoice ?? []).map(normalizeQuickBooksInvoice);
}

type XeroInvoice = {
  InvoiceID: string;
  Total: number;
  CurrencyCode: string;
  DueDate: string;
  Status: string;
  UpdatedDateUTC: string;
};

function normalizeXeroInvoice(inv: XeroInvoice): SyncedInvoice {
  return {
    externalId: inv.InvoiceID,
    amount: inv.Total,
    currency: inv.CurrencyCode,
    dueDate: inv.DueDate,
    paid: inv.Status === "PAID",
    updatedAt: inv.UpdatedDateUTC,
  };
}

type QuickBooksInvoice = {
  Id: string;
  TotalAmt: number;
  CurrencyRef?: { value?: string };
  DueDate: string;
  Balance: number;
  MetaData: { LastUpdatedTime: string };
};

function normalizeQuickBooksInvoice(inv: QuickBooksInvoice): SyncedInvoice {
  return {
    externalId: inv.Id,
    amount: inv.TotalAmt,
    currency: inv.CurrencyRef?.value ?? "USD",
    dueDate: inv.DueDate,
    paid: inv.Balance <= 0,
    updatedAt: inv.MetaData.LastUpdatedTime,
  };
}
