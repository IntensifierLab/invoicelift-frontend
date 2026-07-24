"use client";

export type TransactionFlowStatus =
  | "idle"
  | "confirming"
  | "awaiting-signature"
  | "submitting"
  | "success"
  | "error";

export interface TransactionSummaryField {
  label: string;
  value: string;
}

/**
 * The confirmation dialog shown before a wallet signature is requested
 * (#33's "Freighter confirmation UI shown"), and the status/result/error
 * states through submission. Presentation-only — pair with
 * `lib/wallet/transactions.ts` for the actual build/sign/submit flow.
 */
export function TransactionConfirmModal({
  title,
  fields,
  status,
  errorMessage,
  txHash,
  onConfirm,
  onClose,
}: {
  title: string;
  fields: TransactionSummaryField[];
  status: TransactionFlowStatus;
  errorMessage?: string;
  txHash?: string;
  onConfirm: () => void;
  onClose: () => void;
}) {
  if (status === "idle") return null;

  return (
    <div className="tx-modal-backdrop" role="dialog" aria-modal="true" aria-label={title}>
      <div className="tx-modal">
        <h3>{title}</h3>

        {(status === "confirming" || status === "awaiting-signature" || status === "submitting") && (
          <>
            <dl className="tx-modal-fields">
              {fields.map((f) => (
                <div key={f.label} className="tx-modal-field">
                  <dt>{f.label}</dt>
                  <dd>{f.value}</dd>
                </div>
              ))}
            </dl>
            {status === "confirming" && (
              <div className="tx-modal-actions">
                <button type="button" className="cta-secondary" onClick={onClose}>
                  Cancel
                </button>
                <button type="button" className="cta" onClick={onConfirm}>
                  Sign with wallet
                </button>
              </div>
            )}
            {status === "awaiting-signature" && (
              <p className="tx-modal-status">Waiting for your wallet&rsquo;s confirmation…</p>
            )}
            {status === "submitting" && <p className="tx-modal-status">Submitting to the network…</p>}
          </>
        )}

        {status === "success" && (
          <>
            <p className="tx-modal-status tx-modal-success">Confirmed on-chain.</p>
            {txHash && <p className="tx-modal-hash">{txHash}</p>}
            <div className="tx-modal-actions">
              <button type="button" className="cta" onClick={onClose}>
                Done
              </button>
            </div>
          </>
        )}

        {status === "error" && (
          <>
            <p className="tx-modal-status tx-modal-error" role="alert">
              {errorMessage ?? "Something went wrong."}
            </p>
            <div className="tx-modal-actions">
              <button type="button" className="cta-secondary" onClick={onClose}>
                Close
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
