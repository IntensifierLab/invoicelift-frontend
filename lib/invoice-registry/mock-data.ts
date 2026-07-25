/**
 * Read-only view of the `invoice-registry` contract's state (issue #17).
 * There is no indexer for the deployed contract yet (see
 * `CONTRACT_IDS.invoiceRegistry` in `lib/wallet/contracts.ts`), so this
 * stands in for querying its on-chain events; `findInvoiceRegistryRecords`
 * is written so swapping it for a real RPC/indexer call later is a
 * one-function change — the shape callers rely on stays the same.
 */

export type InvoiceRegistryState = "Draft" | "Verified" | "Financed" | "Repaid";

/** Every state the invoice-registry contract's state machine can reach, in
 * transition order. */
export const REGISTRY_STATES: InvoiceRegistryState[] = ["Draft", "Verified", "Financed", "Repaid"];

export type InvoiceRegistryEvent = {
  state: InvoiceRegistryState;
  /** Stellar transaction hash for the event that caused this transition. */
  txHash: string;
  timestamp: string; // ISO 8601, from the ledger close time
};

export type InvoiceRegistryRecord = {
  invoiceId: string;
  buyerAddress: string;
  smeName: string;
  amount: number;
  currency: string;
  currentState: InvoiceRegistryState;
  /** Ordered oldest -> newest, one entry per state transition reached so far. */
  history: InvoiceRegistryEvent[];
};

const BUYERS = [
  "GABC3PQXHZ4RSOOAOYA6CBFZMR6QMH2HXQVICEQSQ4CBS7Q3XTUOWJ5",
  "GBXY7KLMNOPQRSTUVWXYZAB2CDEFGHIJKLMNOPQRSTUVWXYZAB2CDEF",
  "GCUVWXYZAB2CDEFGHIJKLMNOPQRSTUVWXYZAB2CDEFGHIJKLMNOPQRS",
];
const SMES = ["Lagos Textiles Co", "Kampala Fresh Farms", "Accra Metalworks", "Nairobi Coffee Traders"];

function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function fakeTxHash(seed: number): string {
  let hash = "";
  for (let i = 0; i < 64; i++) {
    hash += Math.floor(seededRandom(seed * 97 + i) * 16).toString(16);
  }
  return hash;
}

function buildHistory(seed: number, reachedState: InvoiceRegistryState): InvoiceRegistryEvent[] {
  const reachedIndex = REGISTRY_STATES.indexOf(reachedState);
  const start = new Date(Date.UTC(2026, 0, 1)).getTime();
  let cursor = start + seed * 3_600_000;

  return REGISTRY_STATES.slice(0, reachedIndex + 1).map((state, i) => {
    cursor += Math.round(seededRandom(seed * 13 + i) * 5 * 86_400_000);
    return {
      state,
      txHash: fakeTxHash(seed * 31 + i),
      timestamp: new Date(cursor).toISOString(),
    };
  });
}

/** Deterministic mock dataset so the demo is stable across runs. */
export const MOCK_REGISTRY_RECORDS: InvoiceRegistryRecord[] = Array.from({ length: 24 }, (_, i) => {
  const n = i + 1;
  const buyerAddress = BUYERS[i % BUYERS.length];
  const smeName = SMES[i % SMES.length];
  const amount = Math.round((500 + seededRandom(n) * 49500) * 100) / 100;
  const reachedState = REGISTRY_STATES[i % REGISTRY_STATES.length];

  return {
    invoiceId: `INV-${1000 + n}`,
    buyerAddress,
    smeName,
    amount,
    currency: "USDC",
    currentState: reachedState,
    history: buildHistory(n, reachedState),
  };
});

/**
 * Finds registry records by exact/prefix invoice ID or by buyer address
 * (case-insensitive substring, since callers may only have a partial
 * address). Empty query returns no results — the viewer requires the caller
 * to search rather than dumping the whole registry.
 */
export function findInvoiceRegistryRecords(query: string): InvoiceRegistryRecord[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  return MOCK_REGISTRY_RECORDS.filter(
    (record) =>
      record.invoiceId.toLowerCase().includes(q) || record.buyerAddress.toLowerCase().includes(q),
  );
}
