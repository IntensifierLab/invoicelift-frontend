"use client";

import { useState } from "react";
import { useWallet } from "@/components/wallet-provider";
import { CopyButton } from "@/components/copy-button";

function truncate(address: string): string {
  return `${address.slice(0, 4)}…${address.slice(-4)}`;
}

export function ConnectWalletButton() {
  const { status, address, error, connect, disconnect, expectedNetworkLabel } = useWallet();
  const [menuOpen, setMenuOpen] = useState(false);

  if (status === "connected" || status === "wrong-network") {
    return (
      <div className="wallet-widget">
        <button
          type="button"
          className={status === "wrong-network" ? "wallet-pill wallet-pill-warning" : "wallet-pill"}
          onClick={() => setMenuOpen((open) => !open)}
          aria-haspopup="menu"
          aria-expanded={menuOpen}
        >
          <span className="wallet-dot" aria-hidden />
          {address ? truncate(address) : "Connected"}
        </button>
        {address && (
          <CopyButton text={address} label="Copy wallet address" />
        )}
        {menuOpen && (
          <div className="wallet-menu" role="menu">
            {status === "wrong-network" && (
              <p className="wallet-menu-warning">Switch your wallet to {expectedNetworkLabel}.</p>
            )}
            <button
              type="button"
              className="wallet-menu-item"
              role="menuitem"
              onClick={() => {
                setMenuOpen(false);
                void disconnect();
              }}
            >
              Disconnect
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="wallet-widget">
      <button type="button" className="wallet-pill" onClick={() => void connect()} disabled={status === "connecting"}>
        {status === "connecting" ? "Connecting…" : "Connect Wallet"}
      </button>
      {error && (
        <p className="wallet-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
