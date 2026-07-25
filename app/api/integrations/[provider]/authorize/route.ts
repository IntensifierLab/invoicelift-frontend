import { randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { buildAuthorizeUrl } from "@/lib/integrations/oauth";
import { isAccountingProvider } from "@/lib/integrations/providers";

const STATE_COOKIE_MAX_AGE_SECONDS = 600;

/** Starts the OAuth2 authorization-code flow for `provider` (issue #34). */
export async function GET(request: NextRequest, { params }: { params: Promise<{ provider: string }> }) {
  const { provider } = await params;
  if (!isAccountingProvider(provider)) {
    return NextResponse.json({ error: "Unknown provider" }, { status: 404 });
  }

  const state = randomBytes(24).toString("hex");
  const origin = request.nextUrl.origin;

  let authorizeUrl: string;
  try {
    authorizeUrl = buildAuthorizeUrl(provider, { state, origin });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to start OAuth flow" },
      { status: 503 }
    );
  }

  const store = await cookies();
  store.set(`il_oauth_state_${provider}`, state, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: STATE_COOKIE_MAX_AGE_SECONDS,
    path: "/",
  });

  return NextResponse.redirect(authorizeUrl);
}
