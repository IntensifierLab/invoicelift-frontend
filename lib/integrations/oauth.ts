import { PROVIDER_CONFIG, redirectUriFor, type AccountingProvider } from "./providers";

// Server-only: reads client secrets from process.env and calls provider
// token endpoints directly. Only import this from Route Handlers, never
// from a Client Component.

export type TokenResponse = {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  token_type: string;
  /** Xero-specific: the connected tenant. Absent for QuickBooks. */
  scope?: string;
};

/** Builds the provider authorization URL for the OAuth2 redirect step. */
export function buildAuthorizeUrl(
  provider: AccountingProvider,
  { state, origin }: { state: string; origin: string }
): string {
  const config = PROVIDER_CONFIG[provider];
  const clientId = process.env[config.clientIdEnv];
  if (!clientId) {
    throw new Error(
      `${config.label} is not configured: set ${config.clientIdEnv} to enable this integration.`
    );
  }

  const params = new URLSearchParams({
    response_type: "code",
    client_id: clientId,
    redirect_uri: redirectUriFor(provider, origin),
    scope: config.scopes.join(" "),
    state,
  });

  return `${config.authorizeUrl}?${params.toString()}`;
}

/** Exchanges an authorization code for an access/refresh token pair. */
export async function exchangeCodeForToken(
  provider: AccountingProvider,
  { code, origin }: { code: string; origin: string }
): Promise<TokenResponse> {
  const config = PROVIDER_CONFIG[provider];
  const clientId = process.env[config.clientIdEnv];
  const clientSecret = process.env[config.clientSecretEnv];
  if (!clientId || !clientSecret) {
    throw new Error(`${config.label} is not configured: missing client credentials.`);
  }

  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: redirectUriFor(provider, origin),
  });

  const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  const response = await fetch(config.tokenUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${basicAuth}`,
    },
    body: body.toString(),
  });

  if (!response.ok) {
    throw new Error(`${config.label} token exchange failed: ${response.status} ${await response.text()}`);
  }

  return (await response.json()) as TokenResponse;
}
