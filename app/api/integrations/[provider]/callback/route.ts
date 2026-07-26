import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { getConnection, saveConnection } from "@/lib/integrations/connection-store";
import { exchangeCodeForToken } from "@/lib/integrations/oauth";
import { isAccountingProvider } from "@/lib/integrations/providers";
import { importEligibleReceivables } from "@/lib/integrations/sync";

const RESULT_REDIRECT = "/smes/integrations";

/** Completes the OAuth2 flow, then does a best-effort first import. */
export async function GET(request: NextRequest, { params }: { params: Promise<{ provider: string }> }) {
  const { provider } = await params;
  if (!isAccountingProvider(provider)) {
    return NextResponse.json({ error: "Unknown provider" }, { status: 404 });
  }

  const url = request.nextUrl;
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const oauthError = url.searchParams.get("error");

  const store = await cookies();
  const stateCookieName = `il_oauth_state_${provider}`;
  const expectedState = store.get(stateCookieName)?.value;
  store.delete(stateCookieName);

  if (oauthError) {
    return redirectWithStatus(request, provider, "error", oauthError);
  }
  if (!code || !state || !expectedState || state !== expectedState) {
    return redirectWithStatus(request, provider, "error", "invalid_state");
  }

  try {
    const token = await exchangeCodeForToken(provider, { code, origin: url.origin });
    await saveConnection(provider, token.access_token, token.expires_in);

    // Automatic import of eligible unpaid receivables right after connecting.
    // Best-effort: a failure here shouldn't undo a successful OAuth connection.
    try {
      const connection = await getConnection(provider);
      if (connection) {
        await importEligibleReceivables(provider, connection.accessToken, new Map());
      }
    } catch (importError) {
      console.error(`[integrations/${provider}] initial import failed`, importError);
    }

    return redirectWithStatus(request, provider, "connected");
  } catch (error) {
    console.error(`[integrations/${provider}] token exchange failed`, error);
    return redirectWithStatus(request, provider, "error", "token_exchange_failed");
  }
}

function redirectWithStatus(
  request: NextRequest,
  provider: string,
  status: "connected" | "error",
  reason?: string
) {
  const target = new URL(RESULT_REDIRECT, request.nextUrl.origin);
  target.searchParams.set("provider", provider);
  target.searchParams.set("status", status);
  if (reason) target.searchParams.set("reason", reason);
  return NextResponse.redirect(target);
}
