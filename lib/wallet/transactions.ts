import { BASE_FEE, Contract, TransactionBuilder, type xdr } from "@stellar/stellar-sdk";
import { getWalletKit } from "./kit";
import { getRpcServer, STELLAR_NETWORK } from "./rpc";

/** Every way a contract-call transaction can fail, so callers can render a
 * specific message instead of a generic "something went wrong". */
export type TxErrorKind =
  | "build-failed"
  | "simulation-failed"
  | "signing-rejected"
  | "submission-failed"
  | "timeout"
  | "unknown";

export class TransactionFlowError extends Error {
  constructor(
    public readonly kind: TxErrorKind,
    message: string,
    public readonly cause?: unknown,
  ) {
    super(message);
    this.name = "TransactionFlowError";
  }
}

function isUserDismissed(err: unknown): boolean {
  // Matches the wallet kit's convention for "the user closed the confirmation
  // dialog without signing" (see components/wallet-provider.tsx).
  return typeof err === "object" && err !== null && "code" in err && (err as { code?: unknown }).code === -1;
}

/**
 * Builds and simulates a Soroban contract invocation from `sourceAddress`,
 * returning an unsigned, simulation-assembled transaction XDR ready for
 * `signAndSubmitTransaction`. Simulation failures (e.g. a contract-side
 * assertion) surface as `TransactionFlowError` with kind `simulation-failed`
 * rather than a raw SDK exception.
 */
export async function buildContractCallTx(
  sourceAddress: string,
  contractId: string,
  method: string,
  args: xdr.ScVal[] = [],
): Promise<string> {
  const server = getRpcServer();

  let account;
  try {
    account = await server.getAccount(sourceAddress);
  } catch (err) {
    throw new TransactionFlowError(
      "build-failed",
      "Couldn't load your account from the network. Is it funded on this network?",
      err,
    );
  }

  const contract = new Contract(contractId);
  const tx = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: STELLAR_NETWORK,
  })
    .addOperation(contract.call(method, ...args))
    .setTimeout(30)
    .build();

  try {
    const prepared = await server.prepareTransaction(tx);
    return prepared.toXDR();
  } catch (err) {
    throw new TransactionFlowError(
      "simulation-failed",
      `Simulating "${method}" failed — the contract would reject this call.`,
      err,
    );
  }
}

export interface SubmittedTransaction {
  hash: string;
  ledger?: number;
}

/**
 * Requests the connected wallet's signature on `unsignedXdr`, then submits
 * and polls until the network reaches a terminal state. Every failure mode —
 * the user dismissing the confirmation dialog, the network rejecting the
 * submission, or the poll timing out before a terminal state — is raised as
 * a `TransactionFlowError` with a specific `kind`, never a bare throw.
 */
export async function signAndSubmitTransaction(
  unsignedXdr: string,
  sourceAddress: string,
): Promise<SubmittedTransaction> {
  const kit = await getWalletKit();

  let signedTxXdr: string;
  try {
    const signed = await kit.signTransaction(unsignedXdr, {
      networkPassphrase: STELLAR_NETWORK,
      address: sourceAddress,
    });
    signedTxXdr = signed.signedTxXdr;
  } catch (err) {
    if (isUserDismissed(err)) {
      throw new TransactionFlowError("signing-rejected", "You closed the signing request.", err);
    }
    throw new TransactionFlowError("signing-rejected", "The wallet couldn't sign this transaction.", err);
  }

  const server = getRpcServer();
  const tx = TransactionBuilder.fromXDR(signedTxXdr, STELLAR_NETWORK);

  const sendResult = await server.sendTransaction(tx);
  if (sendResult.status === "ERROR") {
    throw new TransactionFlowError(
      "submission-failed",
      "The network rejected this transaction.",
      sendResult.errorResult,
    );
  }

  try {
    const final = await server.pollTransaction(sendResult.hash, {
      attempts: 15,
    });
    if (final.status === "SUCCESS") {
      return { hash: sendResult.hash, ledger: final.ledger };
    }
    throw new TransactionFlowError(
      "submission-failed",
      `Transaction ${final.status.toLowerCase()} on-chain.`,
      final,
    );
  } catch (err) {
    if (err instanceof TransactionFlowError) throw err;
    throw new TransactionFlowError(
      "timeout",
      "Submitted, but confirmation timed out — check the transaction hash on a Stellar explorer before retrying.",
      err,
    );
  }
}
