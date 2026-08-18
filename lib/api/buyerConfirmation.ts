import { API_BASE_URL } from "./config";
import { signMessageWithFreighter } from "@/lib/wallet/messages";

/**
 * Confirms/acknowledges an invoice as its anchor buyer (issue #25): signs a
 * canonical confirmation message with the connected wallet (SEP-53, via the
 * same `signMessageWithFreighter` helper the SME-signature flow uses), then
 * POSTs the signature to invoicelift-backend's buyer-signature endpoint —
 * the same one `lib/wallet/messages.ts` documents and that
 * `src/lib/stellarSignature.ts`'s `verifyInvoiceSignature` checks
 * server-side. That endpoint is what actually drives the invoice to
 * `VERIFIED` and triggers the on-chain `verify_invoice` call; this function
 * only produces and submits the signature.
 */
export async function confirmInvoiceAsBuyer(invoiceId: string, buyerAddress: string): Promise<void> {
  const message = `InvoiceLift buyer confirmation\ninvoice:${invoiceId}\nbuyer:${buyerAddress}`;
  const { signatureBase64, signerAddress } = await signMessageWithFreighter(message, buyerAddress);

  const res = await fetch(`${API_BASE_URL}/invoices/${encodeURIComponent(invoiceId)}/buyer-signature`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ signature: signatureBase64, signerAddress }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Confirmation failed: ${res.status} ${res.statusText}${detail ? ` — ${detail}` : ""}`);
  }
}
