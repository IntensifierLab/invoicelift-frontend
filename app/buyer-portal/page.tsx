import { PendingConfirmations } from "@/components/buyer-portal/pending-confirmations";
import { RouteGuard } from "@/components/route-guard";

export const metadata = {
  title: "Buyer confirmation portal",
};

/**
 * Buyer confirmation portal (issue #25). "Login" here is the wallet
 * connection already gating every role-restricted page in this app — the
 * acceptance criterion's "email or wallet" login is wallet-only for now
 * since there is no user/session backend anywhere in this frontend yet
 * (roles resolve from a connected address, see lib/auth/roles.ts); email
 * login is a fast follow once that exists.
 */
export default function Page() {
  return (
    <RouteGuard allow={["anchor_buyer", "admin"]}>
      <section className="section">
        <span className="tag">Buyer portal</span>
        <h2>Confirm pending invoices</h2>
        <p style={{ color: "var(--muted)" }}>
          Review invoices financed against your purchase orders and confirm them with your wallet.
          Confirming signs an acknowledgement and completes verification on-chain.
        </p>
        <PendingConfirmations />
      </section>
    </RouteGuard>
  );
}
