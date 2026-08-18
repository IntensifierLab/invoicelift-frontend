import type { Metadata } from "next";

// The systemic-risk dashboard is a client component ("use client"), so
// per-route metadata has to live in this sibling layout instead of the
// page file.
export const metadata: Metadata = {
  title: "Systemic Risk",
  description: "Protocol-wide buyer exposure and pool correlation monitoring for admins.",
};

export default function SystemicRiskLayout({ children }: { children: React.ReactNode }) {
  return children;
}
