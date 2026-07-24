import { API_BASE_URL } from "./config";

// Mirrors invoicelift-backend's Prisma `Pool` model
// (src/routes/v1/pools.ts / prisma/schema.prisma).
export interface Pool {
  id: string;
  poolId: string;
  totalCapital: number;
  utilisedCapital: number;
  updatedAt: string;
}

// Mirrors `BuyerExposure` in invoicelift-backend's riskAnalyticsService.
export interface BuyerPoolExposure {
  poolId: string;
  exposure: number;
}

export interface BuyerExposure {
  buyerAddress: string;
  totalExposure: number;
  byPool: BuyerPoolExposure[];
}

// Mirrors `SystemicAlert` in invoicelift-backend's riskAnalyticsService.
export type SystemicAlert =
  | { type: "POOL_UTILISATION"; poolId: string; utilisationRatio: number; threshold: number }
  | {
      type: "BUYER_CONCENTRATION";
      buyerAddress: string;
      exposure: number;
      shareOfSystemCapital: number;
      threshold: number;
    };

// Mirrors `DelinquencyStatus`/`DelinquencyRecord` in
// invoicelift-backend's delinquency service.
export type DelinquencyStatus =
  | "grace_period"
  | "restructuring_proposed"
  | "loss_recognised"
  | "resolved";

export interface DelinquencyRecordSummary {
  id: string;
  invoiceId: string;
  poolId: string;
  status: DelinquencyStatus;
  originalAmount: number;
  overdueSince: string;
  createdAt: string;
  updatedAt: string;
}

async function getJson<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: { Accept: "application/json" },
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`${path} responded ${res.status} ${res.statusText}`);
  }
  return res.json() as Promise<T>;
}

export function fetchPools(): Promise<Pool[]> {
  return getJson<Pool[]>("/pools");
}

export function fetchBuyerExposure(): Promise<BuyerExposure[]> {
  return getJson<BuyerExposure[]>("/risk/exposure");
}

export function fetchSystemicAlerts(): Promise<SystemicAlert[]> {
  return getJson<{ alerts: SystemicAlert[] }>("/risk/alerts").then((r) => r.alerts);
}

export function fetchDelinquencyRecords(): Promise<DelinquencyRecordSummary[]> {
  return getJson<{ records: DelinquencyRecordSummary[]; total: number }>("/delinquencies").then(
    (r) => r.records,
  );
}

export interface LenderDashboardData {
  pools: Pool[];
  buyerExposure: BuyerExposure[];
  alerts: SystemicAlert[];
  delinquencies: DelinquencyRecordSummary[];
}

/**
 * Fetches every data source the lender dashboard needs in parallel. Each
 * source is independent (a slow/failing risk endpoint shouldn't blank the
 * pool metrics that already loaded), so callers get a single rejection only
 * when ALL sources fail — see `app/lender/page.tsx` for how partial results
 * are surfaced instead of an all-or-nothing error state.
 */
export async function fetchLenderDashboardData(): Promise<{
  data: Partial<LenderDashboardData>;
  errors: string[];
}> {
  const [pools, buyerExposure, alerts, delinquencies] = await Promise.allSettled([
    fetchPools(),
    fetchBuyerExposure(),
    fetchSystemicAlerts(),
    fetchDelinquencyRecords(),
  ]);

  const errors: string[] = [];
  const data: Partial<LenderDashboardData> = {};

  if (pools.status === "fulfilled") data.pools = pools.value;
  else errors.push(`Pool metrics: ${pools.reason?.message ?? "failed to load"}`);

  if (buyerExposure.status === "fulfilled") data.buyerExposure = buyerExposure.value;
  else errors.push(`SME exposure: ${buyerExposure.reason?.message ?? "failed to load"}`);

  if (alerts.status === "fulfilled") data.alerts = alerts.value;
  else errors.push(`Risk alerts: ${alerts.reason?.message ?? "failed to load"}`);

  if (delinquencies.status === "fulfilled") data.delinquencies = delinquencies.value;
  else errors.push(`Delinquencies: ${delinquencies.reason?.message ?? "failed to load"}`);

  return { data, errors };
}
