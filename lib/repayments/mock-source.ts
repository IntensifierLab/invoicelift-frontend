import type { LenderPosition } from "./types";

/** Starting positions shown before any live/polled update arrives. */
export const INITIAL_POSITIONS: LenderPosition[] = [
  { poolId: "pool-1", poolName: "Lagos Textiles Pool", outstanding: 42500, repaid: 7500, updatedAt: new Date(0).toISOString() },
  { poolId: "pool-2", poolName: "Kampala Fresh Farms Pool", outstanding: 18250, repaid: 31750, updatedAt: new Date(0).toISOString() },
  { poolId: "pool-3", poolName: "Accra Metalworks Pool", outstanding: 60000, repaid: 0, updatedAt: new Date(0).toISOString() },
];

/**
 * Stand-in for a `GET /repayments/positions` REST poll, used as the fallback
 * when the WebSocket is unavailable. There is no backend yet, so this
 * simulates gradual repayment progress on top of whatever was last known;
 * swap for a real fetch() once the endpoint exists — the return shape is the
 * contract callers rely on.
 */
export async function fetchPositionsSnapshot(current: LenderPosition[]): Promise<LenderPosition[]> {
  await new Promise((resolve) => setTimeout(resolve, 150));

  return current.map((position) => {
    if (position.outstanding <= 0) return position;
    const tick = Math.min(position.outstanding, Math.round(position.outstanding * 0.02));
    return {
      ...position,
      outstanding: position.outstanding - tick,
      repaid: position.repaid + tick,
      updatedAt: new Date().toISOString(),
    };
  });
}
