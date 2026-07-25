import { nativeToScVal } from "@stellar/stellar-sdk";
import { requireContractId } from "./contracts";
import { signMessageWithFreighter } from "./messages";
import { buildContractCallTx } from "./transactions";

/**
 * "Upload invoice" (per #33's acceptance criteria) doesn't build a Soroban
 * transaction at all: invoicelift-backend records the invoice off-chain
 * (`POST /v1/invoices`) and then verifies a raw SEP-53 signature from the
 * SME/buyer over the invoice's hash (`verifyInvoiceSignature` in
 * `src/lib/stellarSignature.ts`) — there's no on-chain invoice-registry
 * method for this today (see `governance`'s module docs in
 * invoicelift-contract for the parallel note on `pool-manager`'s identity
 * model). This signs that hash; the caller POSTs the result to
 * `/v1/invoices/:id/sme-signature` or `/buyer-signature`.
 */
export async function signInvoiceHash(address: string, invoiceHashHex: string) {
  return signMessageWithFreighter(invoiceHashHex, address);
}

/**
 * Builds the unsigned, simulation-assembled XDR for joining a pool:
 * `pool-manager`'s `deposit(lender, amount)`. `sourceAddress` is the
 * connected wallet — it signs and pays the transaction fee. `lender` is
 * `pool-manager`'s own lender identifier (a `Symbol`, not a Stellar
 * address — see this contract's `LenderKey`), passed separately because the
 * two identity spaces aren't unified yet.
 */
export async function buildJoinPoolTx(
  sourceAddress: string,
  lender: string,
  amountStroops: bigint,
): Promise<string> {
  const contractId = requireContractId("poolManager");
  return buildContractCallTx(sourceAddress, contractId, "deposit", [
    nativeToScVal(lender, { type: "symbol" }),
    nativeToScVal(amountStroops, { type: "i128" }),
  ]);
}

/**
 * Builds the unsigned, simulation-assembled XDR for processing a repayment.
 *
 * `repayment-waterfall` is currently a bare scaffold (`initialize`/`ping`/
 * `version` only — see its `src/lib.rs`) with no repayment-routing method
 * yet, so `method` must be supplied once one ships; there's no safe default
 * to guess. Calling this against a method that doesn't exist on the deployed
 * contract will surface as a normal `simulation-failed` `TransactionFlowError`
 * from `buildContractCallTx` — this function is the real, working plumbing,
 * ready for whichever method name the contract-side work lands with.
 */
export async function buildProcessRepaymentTx(
  sourceAddress: string,
  method: string,
  args: Parameters<typeof nativeToScVal>[0][] = [],
): Promise<string> {
  const contractId = requireContractId("repaymentWaterfall");
  return buildContractCallTx(
    sourceAddress,
    contractId,
    method,
    args.map((arg) => nativeToScVal(arg)),
  );
}
