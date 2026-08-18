/**
 * Sample invoice dataset for the paginated list (issue #20). There is no
 * indexer/API yet, so this stands in for a server-side page of results;
 * `queryInvoices` below is written so swapping it for a real fetch later is a
 * one-function change.
 */

export type InvoiceStatus = "pending" | "financed" | "repaid" | "overdue";

export type Invoice = {
  id: string;
  buyer: string;
  smeName: string;
  amount: number;
  currency: string;
  status: InvoiceStatus;
  dueDate: string; // ISO date
};

const BUYERS = ["Acme Trading Ltd", "Northwind Foods", "Globex Retail", "Umbrella Logistics", "Initech Supplies"];
const SMES = ["Lagos Textiles Co", "Kampala Fresh Farms", "Accra Metalworks", "Nairobi Coffee Traders", "Dakar Craft Exports"];
const STATUSES: InvoiceStatus[] = ["pending", "financed", "repaid", "overdue"];

function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

/** Deterministic mock dataset so the demo/tests are stable across runs. */
export const MOCK_INVOICES: Invoice[] = Array.from({ length: 87 }, (_, i) => {
  const n = i + 1;
  const buyer = BUYERS[i % BUYERS.length];
  const smeName = SMES[i % SMES.length];
  const status = STATUSES[i % STATUSES.length];
  const amount = Math.round((500 + seededRandom(n) * 49500) * 100) / 100;
  const dueOffsetDays = Math.floor(seededRandom(n * 7) * 120) - 30;
  const due = new Date(Date.UTC(2026, 0, 1));
  due.setUTCDate(due.getUTCDate() + dueOffsetDays);

  return {
    id: `INV-${1000 + n}`,
    buyer,
    smeName,
    amount,
    currency: "USDC",
    status,
    dueDate: due.toISOString().slice(0, 10),
  };
});

export type InvoiceFilters = {
  q?: string;
  status?: InvoiceStatus;
  buyer?: string;
  minAmount?: number;
  maxAmount?: number;
  dueBefore?: string;
  dueAfter?: string;
};

export type InvoiceQuery = InvoiceFilters & {
  page: number;
  pageSize: number;
};

export type InvoicePage = {
  rows: Invoice[];
  total: number;
  page: number;
  pageSize: number;
};

/** Filters, searches, and paginates the mock dataset. Swap the body for a
 * real API call when the indexer ships — the signature stays the same. */
export function queryInvoices(query: InvoiceQuery): InvoicePage {
  const { q, status, buyer, minAmount, maxAmount, dueBefore, dueAfter, page, pageSize } = query;

  let rows = MOCK_INVOICES;

  if (q) {
    const needle = q.trim().toLowerCase();
    rows = rows.filter(
      (inv) => inv.id.toLowerCase().includes(needle) || inv.smeName.toLowerCase().includes(needle)
    );
  }
  if (status) rows = rows.filter((inv) => inv.status === status);
  if (buyer) rows = rows.filter((inv) => inv.buyer === buyer);
  if (minAmount !== undefined) rows = rows.filter((inv) => inv.amount >= minAmount);
  if (maxAmount !== undefined) rows = rows.filter((inv) => inv.amount <= maxAmount);
  if (dueAfter) rows = rows.filter((inv) => inv.dueDate >= dueAfter);
  if (dueBefore) rows = rows.filter((inv) => inv.dueDate <= dueBefore);

  const total = rows.length;
  const start = (page - 1) * pageSize;
  const pageRows = rows.slice(start, start + pageSize);

  return { rows: pageRows, total, page, pageSize };
}

export function uniqueBuyers(): string[] {
  return Array.from(new Set(MOCK_INVOICES.map((inv) => inv.buyer))).sort();
}

/** Looks up a single invoice by id (issue #32's detail/PDF view). */
export function findInvoiceById(id: string): Invoice | undefined {
  return MOCK_INVOICES.find((inv) => inv.id === id);
}
