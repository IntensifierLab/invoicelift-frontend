"use client";

import Link from "next/link";
import { PAGE_ACCESS } from "@/lib/auth/roles";
import { useRole } from "@/lib/auth/use-role";

const NAV_ITEMS = [
  ["SMEs", "/smes"],
  ["Invoices", "/invoices"],
  ["Registry", "/registry"],
  ["Liquidity", "/liquidity"],
  ["Lenders", "/lender"],
  ["Risk", "/risk"],
  ["Systemic Risk", "/admin/systemic-risk"],
  ["Roadmap", "/roadmap"],
  ["Docs", "/docs"],
] as const;

/** Renders only the nav links the current wallet's role (if any) can open. */
export function SiteNav() {
  const role = useRole();

  const visible = NAV_ITEMS.filter(([, href]) => {
    const allowed = PAGE_ACCESS[href];
    return !allowed || (!!role && allowed.includes(role));
  });

  return (
    <nav className="links">
      {visible.map(([label, href]) => (
        <Link key={href} href={href}>
          {label}
        </Link>
      ))}
    </nav>
  );
}
