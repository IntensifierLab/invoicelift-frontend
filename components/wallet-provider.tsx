"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { STELLAR_NETWORK, STELLAR_NETWORK_LABEL } from "@/lib/wallet/config";
import { getWalletKit } from "@/lib/wallet/kit";

export type WalletStatus = "disconnected" | "connecting" | "connected" | "wrong-network";

type WalletState = {
  status: WalletStatus;
  address: string | undefined;
  error: string | undefined;
};

type WalletContextValue = WalletState & {
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  expectedNetworkLabel: string;
};

const WalletContext = createContext<WalletContextValue | undefined>(undefined);

const IDLE_STATE: WalletState = { status: "disconnected", address: undefined, error: undefined };

function isUserDismissed(err: unknown): boolean {
  return typeof err === "object" && err !== null && "code" in err && (err as { code?: unknown }).code === -1;
}

function messageFromError(err: unknown): string {
  if (typeof err === "object" && err !== null && "message" in err) {
    const message = (err as { message?: unknown }).message;
    if (typeof message === "string" && message.length > 0) return message;
  }
  if (err instanceof Error) return err.message;
  return "Something went wrong while connecting your wallet.";
}

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<WalletState>(IDLE_STATE);

  const checkNetwork = useCallback(async (address: string) => {
    try {
      const kit = await getWalletKit();
      const { networkPassphrase, network } = await kit.getNetwork();
      if (networkPassphrase !== STELLAR_NETWORK) {
        setState({
          status: "wrong-network",
          address,
          error: `Your wallet is on ${network}. Switch it to ${STELLAR_NETWORK_LABEL} to continue.`,
        });
        return;
      }
      setState({ status: "connected", address, error: undefined });
    } catch {
      // Not every wallet can report its active network up front; still treat
      // the connection as valid rather than blocking the user entirely.
      setState({ status: "connected", address, error: undefined });
    }
  }, []);

  // Restore a session that survived a page refresh (the kit hydrates its
  // address/module signals from localStorage as soon as it's loaded).
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const kit = await getWalletKit();
        const { address } = await kit.getAddress();
        if (!cancelled) await checkNetwork(address);
      } catch {
        // No persisted session, or we're not in a browser.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [checkNetwork]);

  const connect = useCallback(async () => {
    setState({ status: "connecting", address: undefined, error: undefined });
    try {
      const kit = await getWalletKit();
      const { address } = await kit.authModal();
      await checkNetwork(address);
    } catch (err) {
      setState(isUserDismissed(err) ? IDLE_STATE : { status: "disconnected", address: undefined, error: messageFromError(err) });
    }
  }, [checkNetwork]);

  const disconnect = useCallback(async () => {
    try {
      const kit = await getWalletKit();
      await kit.disconnect();
    } finally {
      setState(IDLE_STATE);
    }
  }, []);

  const value = useMemo<WalletContextValue>(
    () => ({ ...state, connect, disconnect, expectedNetworkLabel: STELLAR_NETWORK_LABEL }),
    [state, connect, disconnect],
  );

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}

export function useWallet(): WalletContextValue {
  const ctx = useContext(WalletContext);
  if (!ctx) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return ctx;
}
