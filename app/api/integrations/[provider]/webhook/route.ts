import { createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { getConnection } from "@/lib/integrations/connection-store";
import { isAccountingProvider, PROVIDER_CONFIG } from "@/lib/integrations/providers";
import { importEligibleReceivables } from "@/lib/integrations/sync";

/**
 * Receives status-change notifications from the accounting platform (issue
 * #34) and triggers a re-sync. Both Xero and QuickBooks sign webhook bodies
 * with an HMAC-SHA256 of the raw payload against a shared secret configured
 * in each platform's developer console; verification here mirrors that.
 */
export async function POST(request: NextRequest, { params }: { params: Promise<{ provider: string }> }) {
  const { provider } = await params;
  if (!isAccountingProvider(provider)) {
    return NextResponse.json({ error: "Unknown provider" }, { status: 404 });
  }

  const config = PROVIDER_CONFIG[provider];
  const secret = process.env[config.webhookSecretEnv];
  const rawBody = await request.text();
  const signature = request.headers.get(config.webhookSignatureHeader);

  if (!secret) {
    // Not configured yet — accept nothing rather than skip verification.
    return NextResponse.json({ error: "Webhook not configured" }, { status: 503 });
  }
  if (!signature || !isValidSignature(rawBody, signature, secret)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const connection = await getConnection(provider);
  if (!connection) {
    // We got a valid, signed event for a provider we're not (or no longer)
    // connected to. Not an error on the sender's side — just nothing to do.
    return NextResponse.json({ status: "ignored" }, { status: 200 });
  }

  try {
    await importEligibleReceivables(provider, connection.accessToken, new Map());
  } catch (error) {
    console.error(`[integrations/${provider}] webhook-triggered sync failed`, error);
    // Still 200: the platform should not retry-storm us for a downstream
    // failure on our side once the signature/event itself was accepted.
  }

  return NextResponse.json({ status: "ok" }, { status: 200 });
}

function isValidSignature(rawBody: string, signature: string, secret: string): boolean {
  const expected = createHmac("sha256", secret).update(rawBody).digest("base64");
  const expectedBuf = Buffer.from(expected);
  const actualBuf = Buffer.from(signature);
  if (expectedBuf.length !== actualBuf.length) return false;
  return timingSafeEqual(expectedBuf, actualBuf);
}
