import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";
import { ExpectedPages } from "@/components/expected-pages";

export default function HomePage() {
  return (
    <>
      <section className="landing-hero">
        <div className="landing-orbs" aria-hidden />
        <div className="landing-hero-inner">
          <BrandLogo className="landing-logo" aria-label="InvoiceLift logo" />
          <span className="tag">SME liquidity · Invoice finance · Stellar</span>
          <h1 className="hero-headline">Turn receivables into runway.</h1>
          <p
            className="landing-lead"
            dangerouslySetInnerHTML={{ __html: "InvoiceLift puts <strong>verified invoices and repayment waterfalls</strong> on Soroban\u2014so SMEs unlock working capital and lenders see precedence rules they can trust." }}
          />
          <div className="landing-cta-row">
            <Link href="/roadmap" className="cta">Credit roadmap</Link>
            <Link href="/smes" className="cta-secondary">For SMEs</Link>
          </div>
          <ul className="landing-stats">
            <li>Invoice registry</li>
            <li>Liquidity pools</li>
            <li>Waterfall routing</li>
          </ul>
        </div>
      </section>

      <section className="landing-pillars">
        <article className="landing-pillar">
          <div className="landing-pillar-icon" aria-hidden>◆</div>
          <h3>Clear receivable state</h3>
          <p>Know what was financed—and by whom.</p>
        </article>
        <article className="landing-pillar">
          <div className="landing-pillar-icon" aria-hidden>◇</div>
          <h3>Pool discipline</h3>
          <p>Exposure limits encoded as operational reality.</p>
        </article>
        <article className="landing-pillar">
          <div className="landing-pillar-icon" aria-hidden>○</div>
          <h3>Predictable repayment</h3>
          <p>Routing rules that survive reconciliation.</p>
        </article>
      </section>

      <p className="landing-trust">For SMEs, liquidity partners, and anchor buyers coordinating real trade.</p>

      <ExpectedPages />
    </>
  );
}

// Contribution check by robert-j at 2024-12-29T19:10:20

// Contribution check by james-t at 2025-04-05T00:41:22

// Contribution check by sambuilder at 2025-07-10T06:12:24

// Contribution check by robert-j at 2025-10-14T11:43:26

// Contribution check by james-t at 2026-01-18T17:14:28

// Contribution check by sambuilder at 2026-04-24T22:45:31
