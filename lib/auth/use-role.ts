"use client";

import { useMemo } from "react";
import { useWallet } from "@/components/wallet-provider";
import { resolveRole, type Role } from "@/lib/auth/roles";

/** The role assigned to the currently connected wallet, if any. */
export function useRole(): Role | undefined {
  const { address } = useWallet();
  return useMemo(() => resolveRole(address), [address]);
}
