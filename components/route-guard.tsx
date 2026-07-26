"use client";

import type { ReactNode } from "react";
import { ConnectWalletButton } from "@/components/connect-wallet-button";
import { Forbidden } from "@/components/forbidden";
import { useWallet } from "@/components/wallet-provider";
import type { Role } from "@/lib/auth/roles";
import { useRole } from "@/lib/auth/use-role";

/** Gates its children to wallets whose resolved role is in `allow`. */
export function RouteGuard({ allow, children }: { allow: Role[]; children: ReactNode }) {
  const { status } = useWallet();
  const role = useRole();

  if (status === "connecting") {
    return (
      <section className="section">
        <p style={{ color: "var(--muted)" }}>Checking your wallet…</p>
      </section>
    );
  }

  if (status === "disconnected") {
    return (
      <section className="section forbidden">
        <span className="tag">Wallet required</span>
        <h2>Connect your wallet to continue.</h2>
        <p style={{ color: "var(--muted)" }}>This page is restricted to specific account roles.</p>
        <ConnectWalletButton />
      </section>
    );
  }

  if (!role || !allow.includes(role)) {
    return <Forbidden />;
  }

  return <>{children}</>;
}
