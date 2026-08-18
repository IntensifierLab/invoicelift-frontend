"use client";

import { useState } from "react";
import { useWallet } from "@/components/wallet-provider";
import {
  TransactionConfirmModal,
  type TransactionFlowStatus,
} from "@/components/wallet/transaction-confirm-modal";
import { creditDeposit, getPosition } from "@/lib/lender/lp-positions";
import { utilisationRatio, type PoolListing } from "@/lib/lender/pools-catalog";
import styles from "./pool-participation.module.css";

function pct(bpsOrRatio: number, isBps = true): string {
  const ratio = isBps ? bpsOrRatio / 10_000 : bpsOrRatio;
  return `${(ratio * 100).toFixed(1)}%`;
}

/**
 * Pool detail: terms, risk metrics, and the deposit flow (issue #19).
 *
 * The confirm/sign/submit modal is wired to local state rather than
 * `useTransactionFlow`/`signAndSubmitTransaction` — there is no deployed
 * pool-deposit contract call yet (the rest of `app/lender/` is read-only,
 * mock-data-backed), so this simulates the same UX and credits an LP share
 * balance locally. Swap the `simulateDeposit` body for a real unsigned-XDR
 * builder + `useTransactionFlow` once the pool contract's deposit method is
 * available — the modal and status states are already the real component.
 */
export function PoolDetail({ pool }: { pool: PoolListing }) {
  const { address } = useWallet();
  const [amount, setAmount] = useState(String(pool.minDepositUsdc));
  const [status, setStatus] = useState<TransactionFlowStatus>("idle");
  const [shares, setShares] = useState(() => getPosition(pool.id));

  const amountNumber = Number(amount) || 0;
  const canDeposit = !!address && amountNumber >= pool.minDepositUsdc;

  async function simulateDeposit() {
    setStatus("awaiting-signature");
    await new Promise((r) => setTimeout(r, 600));
    setStatus("submitting");
    await new Promise((r) => setTimeout(r, 600));
    setShares(creditDeposit(pool.id, amountNumber));
    setStatus("success");
  }

  return (
    <div>
      <h2>{pool.name}</h2>
      <p>{pool.description}</p>

      <div className={styles.metricsRow}>
        <div className={styles.metric}>
          <span className={styles.metricLabel}>APY</span>
          <span className={styles.metricValue}>{pct(pool.apyBps)}</span>
        </div>
        <div className={styles.metric}>
          <span className={styles.metricLabel}>Utilisation</span>
          <span className={styles.metricValue}>{pct(utilisationRatio(pool), false)}</span>
        </div>
        <div className={styles.metric}>
          <span className={styles.metricLabel}>Concentration limit</span>
          <span className={styles.metricValue}>{pct(pool.concentrationLimitBps)}</span>
        </div>
        <div className={styles.metric}>
          <span className={styles.metricLabel}>Lockup</span>
          <span className={styles.metricValue}>{pool.lockupDays} days</span>
        </div>
      </div>

      <form
        className={styles.depositForm}
        onSubmit={(e) => {
          e.preventDefault();
          if (canDeposit) setStatus("confirming");
        }}
      >
        <label>
          <span>Deposit amount (USDC)</span>
          <input
            type="number"
            inputMode="decimal"
            min={pool.minDepositUsdc}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </label>
        {!address && <p role="alert">Connect your wallet to deposit.</p>}
        {address && amountNumber < pool.minDepositUsdc && (
          <p role="alert">Minimum deposit is {pool.minDepositUsdc} USDC.</p>
        )}
        <button type="submit" className="cta-primary" disabled={!canDeposit}>
          Deposit
        </button>
      </form>

      {shares > 0 && (
        <p className={styles.balance}>Your LP share balance in this pool: {shares.toLocaleString()} USDC</p>
      )}

      <TransactionConfirmModal
        title={`Deposit into ${pool.name}`}
        fields={[
          { label: "Amount", value: `${amountNumber.toLocaleString()} USDC` },
          { label: "Pool", value: pool.name },
          { label: "From", value: address ?? "" },
        ]}
        status={status}
        onConfirm={() => void simulateDeposit()}
        onClose={() => setStatus("idle")}
      />
    </div>
  );
}
