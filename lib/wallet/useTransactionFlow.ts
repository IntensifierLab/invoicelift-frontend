"use client";

import { useCallback, useState } from "react";
import type { TransactionFlowStatus } from "@/components/wallet/transaction-confirm-modal";
import { signAndSubmitTransaction, TransactionFlowError } from "./transactions";

/**
 * Drives a `TransactionConfirmModal` through confirm → sign → submit →
 * success/error, given a pre-built unsigned XDR (see `lib/wallet/actions.ts`
 * for the builders). `signAndSubmitTransaction` covers signing, submission,
 * and polling in one call, so this can't distinguish "the wallet is asking
 * for a signature" from "we're waiting on network confirmation" — both show
 * as `awaiting-signature`. Splitting that further is a reasonable follow-up
 * once a page actually needs the distinction.
 */
export function useTransactionFlow(sourceAddress: string | undefined) {
  const [status, setStatus] = useState<TransactionFlowStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string>();
  const [txHash, setTxHash] = useState<string>();
  const [pendingXdr, setPendingXdr] = useState<string>();

  const start = useCallback((unsignedXdr: string) => {
    setPendingXdr(unsignedXdr);
    setErrorMessage(undefined);
    setTxHash(undefined);
    setStatus("confirming");
  }, []);

  const confirm = useCallback(async () => {
    if (!pendingXdr || !sourceAddress) return;
    setStatus("awaiting-signature");
    try {
      const result = await signAndSubmitTransaction(pendingXdr, sourceAddress);
      setTxHash(result.hash);
      setStatus("success");
    } catch (err) {
      setErrorMessage(err instanceof TransactionFlowError ? err.message : "Something went wrong.");
      setStatus("error");
    }
  }, [pendingXdr, sourceAddress]);

  const close = useCallback(() => {
    setStatus("idle");
    setPendingXdr(undefined);
  }, []);

  return { status, errorMessage, txHash, start, confirm, close };
}
