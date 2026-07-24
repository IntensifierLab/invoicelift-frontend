import { cookies } from "next/headers";
import type { AccountingProvider } from "./providers";

/**
 * Scaffold connection storage: an httpOnly cookie per provider holding the
 * access token and its expiry. This repo has no database or per-SME account
 * table yet, so a cookie is the simplest thing that lets the OAuth flow and
 * webhook/import code be real end-to-end today.
 *
 * Before production: replace with a server-side store keyed by the SME's
 * account (Stellar address), encrypt the token at rest, and rotate the
 * refresh token on every use. The cookie's `httpOnly`/`secure`/`sameSite`
 * flags keep it reasonably safe as a bridge, but it is not where long-lived
 * OAuth secrets belong.
 */

type StoredConnection = {
  accessToken: string;
  expiresAt: number; // epoch ms
};

function cookieName(provider: AccountingProvider): string {
  return `il_conn_${provider}`;
}

export async function saveConnection(
  provider: AccountingProvider,
  accessToken: string,
  expiresInSeconds: number
): Promise<void> {
  const store = await cookies();
  const value: StoredConnection = {
    accessToken,
    expiresAt: Date.now() + expiresInSeconds * 1000,
  };
  store.set(cookieName(provider), JSON.stringify(value), {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: expiresInSeconds,
    path: "/",
  });
}

export async function getConnection(provider: AccountingProvider): Promise<StoredConnection | null> {
  const store = await cookies();
  const raw = store.get(cookieName(provider))?.value;
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as StoredConnection;
    if (parsed.expiresAt < Date.now()) return null;
    return parsed;
  } catch {
    return null;
  }
}

export async function isConnected(provider: AccountingProvider): Promise<boolean> {
  return (await getConnection(provider)) !== null;
}
