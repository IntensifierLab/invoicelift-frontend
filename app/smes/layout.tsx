import type { Metadata } from "next";

// The SMEs page itself is a client component ("use client"), so per-route
// metadata has to live in this sibling layout instead of the page file.
export const metadata: Metadata = {
  title: "For SMEs",
  description: "Prove creditworthiness with zero-knowledge proofs and unlock invoice financing.",
};

export default function SmesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
