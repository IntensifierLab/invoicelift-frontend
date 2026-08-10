"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Fragment, useMemo } from "react";

/**
 * Human-readable labels for known path segments.
 * Unknown segments are title-cased (e.g., "invoiceId" → "InvoiceId").
 */
const LABEL_MAP: Record<string, string> = {
  smes: "SMEs",
  apply: "Apply",
  "bulk-upload": "Bulk Upload",
  integrations: "Integrations",
  liquidity: "Liquidity",
  lender: "Lender",
  invoices: "Invoices",
  registry: "Registry",
  nft: "NFT",
  risk: "Risk",
  "systemic-risk": "Systemic Risk",
  admin: "Admin",
  docs: "Docs",
  roadmap: "Roadmap",
  waterfall: "Waterfall",
  terms: "Terms",
};

function labelFor(segment: string): string {
  return LABEL_MAP[segment] ?? segment
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/** Known dynamic segments (Stellar addresses, invoice IDs, etc.) that should
 *  be displayed as-is rather than being mapped through the label map. */
function isDynamicSegment(segment: string): boolean {
  return /^G[A-Z0-9]{55}$/.test(segment) || /^(INV-|inv-)?\d{4,}$/i.test(segment);
}

function displaySegment(segment: string): string {
  return isDynamicSegment(segment) ? segment : labelFor(segment);
}

export function Breadcrumb() {
  const pathname = usePathname();

  const items = useMemo(() => {
    const segments = pathname.split("/").filter(Boolean);
    if (segments.length === 0) return [];

    return segments.map((segment, index) => {
      const href = "/" + segments.slice(0, index + 1).join("/");
      const isLast = index === segments.length - 1;
      return {
        label: displaySegment(segment),
        href,
        isLast,
      };
    });
  }, [pathname]);

  // Don't render breadcrumbs on the home page
  if (items.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className="breadcrumb">
      <ol
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: "4px",
          listStyle: "none",
          margin: 0,
          padding: 0,
          fontSize: "0.8125rem",
          color: "var(--color-muted, #888)",
        }}
      >
        <li>
          <Link
            href="/"
            style={{ color: "inherit", textDecoration: "none" }}
          >
            Home
          </Link>
        </li>
        {items.map((item) => (
          <Fragment key={item.href}>
            <li aria-hidden="true" style={{ userSelect: "none", color: "var(--color-muted, #888)" }}>
              /
            </li>
            <li>
              {item.isLast ? (
                <span
                  aria-current="page"
                  style={{
                    color: "var(--color-text, #fff)",
                    fontWeight: 600,
                  }}
                >
                  {item.label}
                </span>
              ) : (
                <Link
                  href={item.href}
                  style={{ color: "inherit", textDecoration: "none" }}
                >
                  {item.label}
                </Link>
              )}
            </li>
          </Fragment>
        ))}
      </ol>
    </nav>
  );
}