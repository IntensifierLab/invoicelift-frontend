import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { OfflineSupport } from "@/components/offline-support";
import "./globals.css";
import { ConnectWalletButton } from "@/components/connect-wallet-button";
import { SiteFooter } from "@/components/site-footer";
import { SiteNav } from "@/components/site-nav";
import { ThemeToggle } from "@/components/theme-toggle";
import { WalletProvider } from "@/components/wallet-provider";

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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* No-flash theme init: apply the stored/OS theme before first paint. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("invoicelift-theme");var d=t==="light"||t==="dark"?t:(window.matchMedia&&window.matchMedia("(prefers-color-scheme: light)").matches?"light":"dark");document.documentElement.setAttribute("data-theme",d);}catch(e){document.documentElement.setAttribute("data-theme","dark");}})();`,
          }}
        />
      </head>
      <body>
        <OfflineSupport />
        <WalletProvider>
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
              <div className="nav-right">
                <SiteNav />
                <ThemeToggle />
                <ConnectWalletButton />
              </div>
            </div>
          </header>
          <main className="container">{children}</main>
          <SiteFooter />
        </WalletProvider>
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

// Contribution by WIAG1949 — 2026-02-15
