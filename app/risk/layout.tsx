import type { Metadata } from "next";

// The risk analytics dashboard is a client component ("use client"), so
// per-route metadata has to live in this sibling layout instead of the page
// file — same pattern as app/lender/layout.tsx.
export const metadata: Metadata = {
  title: "Risk",
  description: "Repayment monitoring and underwriting signals for financed invoices.",
};

export default function RiskLayout({ children }: { children: React.ReactNode }) {
  return children;
}
