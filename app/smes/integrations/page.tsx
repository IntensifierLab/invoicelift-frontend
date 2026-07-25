import { isConnected } from "@/lib/integrations/connection-store";
import { ACCOUNTING_PROVIDERS, PROVIDER_CONFIG } from "@/lib/integrations/providers";
import { RouteGuard } from "@/components/route-guard";

export const metadata = {
  title: "Accounting integrations",
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; provider?: string; reason?: string }>;
}) {
  const { status, provider: resultProvider, reason } = await searchParams;
  const connectionStates = await Promise.all(
    ACCOUNTING_PROVIDERS.map(async (provider) => [provider, await isConnected(provider)] as const)
  );

  return (
    <RouteGuard allow={["sme", "admin"]}>
      <section className="section">
        <span className="tag">Integrations</span>
        <h2>Connect your accounting software</h2>
        <p style={{ color: "var(--muted)" }}>
          Connect Xero or QuickBooks to automatically import eligible unpaid
          receivables for financing. Status changes in your accounting
          platform sync back here as they happen.
        </p>

        {status === "connected" && (
          <p className="integration-banner integration-banner-success">
            Connected to {resultProvider ? PROVIDER_CONFIG[resultProvider as "xero" | "quickbooks"]?.label : "your accounting platform"}.
          </p>
        )}
        {status === "error" && (
          <p className="integration-banner integration-banner-error">
            Couldn&apos;t connect{reason ? ` (${reason})` : ""}. Please try again.
          </p>
        )}

        <div className="grid">
          {connectionStates.map(([provider, connected]) => (
            <div className="card" key={provider}>
              <h3>{PROVIDER_CONFIG[provider].label}</h3>
              <p>{connected ? "Connected" : "Not connected"}</p>
              <a href={`/api/integrations/${provider}/authorize`} className="cta">
                {connected ? "Reconnect" : "Connect"} {PROVIDER_CONFIG[provider].label}
              </a>
            </div>
          ))}
        </div>
      </section>
    </RouteGuard>
  );
}
