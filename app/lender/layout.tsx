import type { Metadata } from "next";

// The lender dashboard is a client component ("use client"), so per-route
// metadata has to live in this sibling layout instead of the page file.
export const metadata: Metadata = {
  title: "Lender Dashboard",
  description: "Pool underwriting, utilisation, and default-rate metrics for lenders.",
};

export default function LenderLayout({ children }: { children: React.ReactNode }) {
  return children;
}
