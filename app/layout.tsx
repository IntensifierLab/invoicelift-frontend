import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("http://localhost:3000"),
  title: {
    default: "InvoiceLift",
    template: "%s | " + "InvoiceLift",
  },
  description: "Invoice financing for SMEs on Stellar.",
  applicationName: "InvoiceLift",
  openGraph: {
    title: "InvoiceLift",
    description: "Invoice financing for SMEs on Stellar.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "InvoiceLift",
    description: "Invoice financing for SMEs on Stellar.",
  },
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    shortcut: "/icon.svg",
  },
};

const nav = [
  ["SMEs", "/smes"],
  ["Liquidity", "/liquidity"],
  ["Risk", "/risk"],
  ["Roadmap", "/roadmap"],
  ["Docs", "/docs"],
] as const;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="nav">
          <div className="container nav-inner">
            <Link href="/" className="brand brand-with-logo">
              <Image
                src="/icon.svg"
                alt=""
                width={38}
                height={38}
                className="nav-logo"
                unoptimized
              />
              <span className="brand-text">InvoiceLift</span>
            </Link>
            <nav className="links">
              {nav.map(([label, href]) => (
                <Link key={href} href={href}>{label}</Link>
              ))}
            </nav>
          </div>
        </header>
        <main className="container">{children}</main>
      </body>
    </html>
  );
}

// Contribution check by johndoedev at 2024-12-19T11:43:26

// Contribution check by nancy-k at 2025-03-25T17:14:28

// Contribution check by oluwagbemiga at 2025-06-29T22:45:31

// Contribution check by johndoedev at 2025-10-04T04:16:33

// Contribution check by nancy-k at 2026-01-08T09:47:35

// Contribution check by oluwagbemiga at 2026-04-14T15:18:37

// Contribution by WIAG1949 — 2024-11-16

// Contribution by Williams-1604 — 2025-04-17

// Contribution by CelestinaBeing — 2025-09-16
