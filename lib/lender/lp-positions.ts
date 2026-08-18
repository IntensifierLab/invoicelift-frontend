// Client-side LP share ledger for the pool participation flow (issue #19).
// Simulated: there's no deployed pool-deposit contract call wired up yet, so
// a confirmed deposit here just credits shares locally (1 USDC = 1 share at
// par), matching the read-only mock data the rest of app/lender/ uses.
const KEY = "invoicelift:lp-positions";

export interface LpPosition {
  poolId: string;
  shares: number;
}

function readAll(): LpPosition[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]") as LpPosition[];
  } catch {
    return [];
  }
}

export function getPosition(poolId: string): number {
  return readAll().find((p) => p.poolId === poolId)?.shares ?? 0;
}

export function creditDeposit(poolId: string, amountUsdc: number): number {
  const positions = readAll();
  const existing = positions.find((p) => p.poolId === poolId);
  if (existing) {
    existing.shares += amountUsdc;
  } else {
    positions.push({ poolId, shares: amountUsdc });
  }
  localStorage.setItem(KEY, JSON.stringify(positions));
  return getPosition(poolId);
}
