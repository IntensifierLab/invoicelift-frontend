import Link from "next/link";

const REPO_URL = "https://github.com/IntensifierLab/invoicelift-frontend";

const FOOTER_LINKS = [
  { label: "Docs", href: "/docs", external: false },
  { label: "GitHub", href: REPO_URL, external: true },
  { label: "Contributing", href: `${REPO_URL}/blob/main/CONTRIBUTING.md`, external: true },
  { label: "Terms", href: "/terms", external: false },
] as const;

/** Site-wide footer: nav/docs/legal links plus a copyright line. Stacks on mobile. */
export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="container footer-inner">
        <span className="footer-copy">© {year} InvoiceLift. All rights reserved.</span>
        <nav className="footer-links" aria-label="Footer">
          {FOOTER_LINKS.map(({ label, href, external }) =>
            external ? (
              <a key={label} href={href} target="_blank" rel="noopener noreferrer">
                {label}
              </a>
            ) : (
              <Link key={label} href={href}>
                {label}
              </Link>
            )
          )}
        </nav>
      </div>
    </footer>
  );
}
