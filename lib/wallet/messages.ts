import { Buffer } from "buffer";
import { STELLAR_NETWORK } from "./config";

/**
 * Signs an arbitrary message with the connected Freighter wallet (SEP-53
 * message signing) — used for flows that need a signature over a value
 * rather than a submitted transaction, e.g. the SME/buyer signatures
 * invoicelift-backend verifies over an invoice's hash
 * (`src/lib/stellarSignature.ts`, `verifyInvoiceSignature`).
 *
 * This goes through `@stellar/freighter-api` directly rather than the
 * multi-wallet `@creit.tech/stellar-wallets-kit` already used elsewhere in
 * this app: the kit's common interface only covers `signTransaction` (no
 * `signMessage`), so message signing is necessarily Freighter-specific today.
 *
 * Returns the signature as base64 (invoicelift-backend's
 * `verifyInvoiceSignature` expects base64), ready to POST to
 * `/v1/invoices/:id/sme-signature` or `/buyer-signature`.
 */
export async function signMessageWithFreighter(
  message: string,
  address: string,
): Promise<{ signatureBase64: string; signerAddress: string }> {
  if (typeof window === "undefined") {
    throw new Error("signMessageWithFreighter is only available in the browser.");
  }

  // Freighter is the only wallet in this app's stack with signMessage
  // support today, so it's imported lazily here rather than added to
  // ./kit's eager module graph.
  const { signMessage, isConnected } = await import("@stellar/freighter-api");

  const connected = await isConnected();
  if (connected.error || !connected.isConnected) {
    throw new Error("Freighter isn't available. Install or unlock the Freighter extension to sign.");
  }

  const result = await signMessage(message, {
    networkPassphrase: STELLAR_NETWORK,
    address,
  });

  if (result.error) {
    throw new Error(result.error.message ?? "Freighter declined to sign this message.");
  }
  if (result.signedMessage == null) {
    throw new Error("Freighter returned no signature.");
  }

  const signatureBase64 =
    typeof result.signedMessage === "string"
      ? result.signedMessage
      : Buffer.from(result.signedMessage).toString("base64");

  return { signatureBase64, signerAddress: result.signerAddress };
}
