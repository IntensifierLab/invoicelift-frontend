/**
 * Per-repayment waterfall breakdown (issue #18): how each buyer repayment is
 * split across principal, protocol fee, reserve, and lender yield by the
 * `repayment-waterfall` contract (see `CONTRACT_IDS.repaymentWaterfall` in
 * `lib/wallet/contracts.ts`). There is no indexer for it yet, so this stands
 * in for querying its on-chain events; `listRepaymentWaterfallEntries` is
 * written so swapping it for a real RPC/indexer call later is a
 * one-function change.
 */

export type RepaymentWaterfallSplit = {
  principal: number;
  protocolFee: number;
  reserve: number;
  lenderYield: number;
};

export type RepaymentWaterfallEntry = {
  id: string;
  poolId: string;
  poolName: string;
  invoiceId: string;
  totalAmount: number;
  split: RepaymentWaterfallSplit;
  txHash: string;
  timestamp: string; // ISO 8601
};

const POOLS = [
  { poolId: "pool-1", poolName: "Lagos Textiles Pool" },
  { poolId: "pool-2", poolName: "Kampala Fresh Farms Pool" },
  { poolId: "pool-3", poolName: "Accra Metalworks Pool" },
];

function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function fakeTxHash(seed: number): string {
  let hash = "";
  for (let i = 0; i < 64; i++) {
    hash += Math.floor(seededRandom(seed * 61 + i) * 16).toString(16);
  }
  return hash;
}

/** Splits a total repayment using a fixed waterfall policy: protocol fee and
 * reserve are taken off the top as percentages, the remainder splits between
 * principal recovery and lender yield. Mirrors the priority order the
 * repayment-waterfall contract applies on-chain. */
function splitAmount(total: number, seed: number): RepaymentWaterfallSplit {
  const protocolFee = Math.round(total * 0.02 * 100) / 100;
  const reserve = Math.round(total * 0.05 * 100) / 100;
  const remainder = total - protocolFee - reserve;
  const yieldShare = 0.15 + seededRandom(seed) * 0.1; // 15-25% of the remainder
  const lenderYield = Math.round(remainder * yieldShare * 100) / 100;
  const principal = Math.round((remainder - lenderYield) * 100) / 100;

  return { principal, protocolFee, reserve, lenderYield };
}

/** Deterministic mock dataset so the demo is stable across runs. */
export const MOCK_WATERFALL_ENTRIES: RepaymentWaterfallEntry[] = Array.from({ length: 40 }, (_, i) => {
  const n = i + 1;
  const pool = POOLS[i % POOLS.length];
  const totalAmount = Math.round((200 + seededRandom(n) * 9800) * 100) / 100;
  const dayOffset = Math.floor(seededRandom(n * 5) * 180);
  const timestamp = new Date(Date.UTC(2026, 0, 1) + dayOffset * 86_400_000).toISOString();

  return {
    id: `RPY-${2000 + n}`,
    poolId: pool.poolId,
    poolName: pool.poolName,
    invoiceId: `INV-${1000 + ((n * 3) % 87) + 1}`,
    totalAmount,
    split: splitAmount(totalAmount, n),
    txHash: fakeTxHash(n),
    timestamp,
  };
});

export type RepaymentWaterfallFilters = {
  poolId?: string;
  from?: string; // ISO date, inclusive
  to?: string; // ISO date, inclusive
};

/** Filters the mock dataset, newest first. */
export function listRepaymentWaterfallEntries(
  filters: RepaymentWaterfallFilters = {},
): RepaymentWaterfallEntry[] {
  const { poolId, from, to } = filters;

  return MOCK_WATERFALL_ENTRIES.filter((entry) => {
    if (poolId && entry.poolId !== poolId) return false;
    if (from && entry.timestamp.slice(0, 10) < from) return false;
    if (to && entry.timestamp.slice(0, 10) > to) return false;
    return true;
  }).sort((a, b) => b.timestamp.localeCompare(a.timestamp));
}

export function uniquePools(): { poolId: string; poolName: string }[] {
  return POOLS;
}
