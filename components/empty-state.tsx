import Link from "next/link";

type Illustration = "invoices" | "pools" | "repayments";

type EmptyStateProps = {
  illustration: Illustration;
  heading: string;
  description: string;
  cta?: { label: string; href: string };
};

/**
 * Illustrated empty state for no-data screens (issue #10).
 *
 * Renders an inline, theme-aware SVG illustration above a heading, supporting
 * copy, and an optional call to action. The SVGs draw with `currentColor` and
 * the shared `--accent` / `--surface` CSS variables, so they adapt to the active
 * theme with no raster assets and no extra network requests.
 */
export function EmptyState({ illustration, heading, description, cta }: EmptyStateProps) {
  return (
    <div className="empty-state" role="status">
      <EmptyIllustration variant={illustration} />
      <h3 className="empty-state-heading">{heading}</h3>
      <p className="empty-state-copy">{description}</p>
      {cta ? (
        <Link href={cta.href} className="cta empty-state-cta">
          {cta.label}
        </Link>
      ) : null}
    </div>
  );
}

function EmptyIllustration({ variant }: { variant: Illustration }) {
  const common = {
    width: 148,
    height: 116,
    viewBox: "0 0 148 116",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg",
    "aria-hidden": true,
    className: "empty-state-art",
  } as const;

  const surface = "color-mix(in srgb, var(--surface) 88%, var(--bg))";
  const accent = "var(--accent)";
  const muted = "color-mix(in srgb, var(--muted) 55%, transparent)";

  if (variant === "invoices") {
    return (
      <svg {...common}>
        <rect x="30" y="20" width="72" height="88" rx="8" fill={surface} stroke={muted} strokeWidth="2" />
        <rect x="46" y="12" width="72" height="88" rx="8" fill={surface} stroke={accent} strokeWidth="2" />
        <line x1="58" y1="34" x2="106" y2="34" stroke={muted} strokeWidth="3" strokeLinecap="round" />
        <line x1="58" y1="48" x2="106" y2="48" stroke={muted} strokeWidth="3" strokeLinecap="round" />
        <line x1="58" y1="62" x2="88" y2="62" stroke={muted} strokeWidth="3" strokeLinecap="round" />
        <circle cx="98" cy="80" r="12" fill="none" stroke={accent} strokeWidth="2.5" />
        <path d="M93 80l3.5 3.5L104 76" stroke={accent} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  if (variant === "pools") {
    return (
      <svg {...common}>
        <ellipse cx="74" cy="86" rx="46" ry="14" fill={surface} stroke={muted} strokeWidth="2" />
        <path d="M28 62c0 7.7 20.6 14 46 14s46-6.3 46-14" fill="none" stroke={muted} strokeWidth="2" />
        <ellipse cx="74" cy="62" rx="46" ry="14" fill={surface} stroke={accent} strokeWidth="2" />
        <path d="M74 24c-9 12-15 20-15 27a15 15 0 0030 0c0-7-6-15-15-27z" fill="none" stroke={accent} strokeWidth="2.5" strokeLinejoin="round" />
      </svg>
    );
  }

  // repayments
  return (
    <svg {...common}>
      <path d="M22 92h104" stroke={muted} strokeWidth="2" strokeLinecap="round" />
      <path d="M30 88V64M52 88V50M74 88V70M96 88V40M118 88V56" stroke={muted} strokeWidth="6" strokeLinecap="round" />
      <path d="M28 66l24-18 22 16 24-32" fill="none" stroke={accent} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M88 32h12v12" stroke={accent} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
