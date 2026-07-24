/**
 * Accounting-platform OAuth2 provider configuration (issue #34). Xero is
 * primary, QuickBooks secondary — both are standard OAuth2 authorization-code
 * flows against a confidential (server-side) client.
 */

export type AccountingProvider = "xero" | "quickbooks";

export const ACCOUNTING_PROVIDERS: readonly AccountingProvider[] = ["xero", "quickbooks"];

export function isAccountingProvider(value: string): value is AccountingProvider {
  return (ACCOUNTING_PROVIDERS as readonly string[]).includes(value);
}

export type ProviderConfig = {
  label: string;
  authorizeUrl: string;
  tokenUrl: string;
  scopes: string[];
  clientIdEnv: string;
  clientSecretEnv: string;
  /** Header name a webhook signature is delivered under. */
  webhookSignatureHeader: string;
  /** Env var holding the shared secret used to verify webhook signatures. */
  webhookSecretEnv: string;
};

export const PROVIDER_CONFIG: Record<AccountingProvider, ProviderConfig> = {
  xero: {
    label: "Xero",
    authorizeUrl: "https://login.xero.com/identity/connect/authorize",
    tokenUrl: "https://identity.xero.com/connect/token",
    scopes: ["openid", "profile", "accounting.transactions.read", "offline_access"],
    clientIdEnv: "XERO_CLIENT_ID",
    clientSecretEnv: "XERO_CLIENT_SECRET",
    webhookSignatureHeader: "x-xero-signature",
    webhookSecretEnv: "XERO_WEBHOOK_KEY",
  },
  quickbooks: {
    label: "QuickBooks",
    authorizeUrl: "https://appcenter.intuit.com/connect/oauth2",
    tokenUrl: "https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer",
    scopes: ["com.intuit.quickbooks.accounting"],
    clientIdEnv: "QUICKBOOKS_CLIENT_ID",
    clientSecretEnv: "QUICKBOOKS_CLIENT_SECRET",
    webhookSignatureHeader: "intuit-signature",
    webhookSecretEnv: "QUICKBOOKS_WEBHOOK_VERIFIER_TOKEN",
  },
};

/** The redirect URI every provider app must be registered with. */
export function redirectUriFor(provider: AccountingProvider, origin: string): string {
  return `${origin}/api/integrations/${provider}/callback`;
}
