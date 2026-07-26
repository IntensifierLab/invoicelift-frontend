/**
 * Base URL of the invoicelift-backend REST API (the `/v1` facade). Override
 * with `NEXT_PUBLIC_API_BASE_URL` in deployments where the backend isn't on
 * localhost:8080 (the backend's own default — see `invoicelift-backend`'s
 * `src/config/env.ts`).
 */
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/+$/, "") ?? "http://localhost:8080/v1";
