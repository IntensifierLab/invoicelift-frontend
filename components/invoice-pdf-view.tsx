"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { invoicePdfLabels, INVOICE_PDF_LOCALES, type InvoicePdfLocale } from "@/lib/i18n/invoice-pdf";
import type { Invoice } from "@/lib/invoices/mock-data";
import { invoicePdfData } from "@/lib/invoices/pdf-content";

function formatCurrency(amount: number, currency: string): string {
  return amount.toLocaleString("en-US", { style: "currency", currency, maximumFractionDigits: 2 });
}

function truncate(address: string): string {
  return address.length > 16 ? `${address.slice(0, 8)}…${address.slice(-6)}` : address;
}

/**
 * The invoice financing document itself (issue #32). Generated client-side
 * as a styled, printable view — `window.print()` (any browser's own "Save
 * as PDF" destination) produces the actual PDF, the same real-PDF-without-
 * a-new-dependency approach as the risk dashboard's export (issue #30).
 */
export function InvoicePdfView({ invoice }: { invoice: Invoice }) {
  const [locale, setLocale] = useState<InvoicePdfLocale>("en");
  const t = useMemo(() => invoicePdfLabels(locale), [locale]);
  const extra = useMemo(() => invoicePdfData(invoice), [invoice]);

  return (
    <div className="invoice-pdf">
      <div className="invoice-pdf-toolbar print-hidden">
        <label className="invoice-pdf-locale">
          <span>Language</span>
          <select value={locale} onChange={(e) => setLocale(e.target.value as InvoicePdfLocale)}>
            {INVOICE_PDF_LOCALES.map((l) => (
              <option key={l.code} value={l.code}>
                {l.label}
              </option>
            ))}
          </select>
        </label>
        <button type="button" className="cta-secondary" onClick={() => window.print()}>
          {t.print}
        </button>
      </div>

      <div className="invoice-pdf-document">
        <div className="invoice-pdf-header">
          <Image src="/invoicelift-logo-400.svg" alt="InvoiceLift" width={48} height={48} unoptimized />
          <div>
            <h3>{t.documentTitle}</h3>
            <p style={{ color: "var(--muted)" }}>InvoiceLift</p>
          </div>
        </div>

        <dl className="invoice-pdf-fields">
          <div>
            <dt>{t.invoiceId}</dt>
            <dd>{invoice.id}</dd>
          </div>
          <div>
            <dt>{t.status}</dt>
            <dd>{invoice.status}</dd>
          </div>
          <div>
            <dt>{t.amount}</dt>
            <dd>{formatCurrency(invoice.amount, invoice.currency)}</dd>
          </div>
          <div>
            <dt>{t.dueDate}</dt>
            <dd>{invoice.dueDate}</dd>
          </div>
          <div>
            <dt>{t.sme}</dt>
            <dd>{invoice.smeName}</dd>
          </div>
          <div>
            <dt>{t.buyer}</dt>
            <dd>{invoice.buyer}</dd>
          </div>
          <div>
            <dt>{t.lenderPool}</dt>
            <dd>{extra.poolName}</dd>
          </div>
          <div>
            <dt>{t.contractAddress}</dt>
            <dd title={extra.contractAddress}>
              {extra.contractAddress ? truncate(extra.contractAddress) : t.contractNotDeployed}
            </dd>
          </div>
        </dl>

        <div className="invoice-pdf-waterfall">
          <h4>{t.waterfallRules}</h4>
          <ul className="list">
            {extra.waterfallRules.map((rule) => (
              <li key={rule.label}>
                <strong>{rule.label}:</strong> {rule.detail}
              </li>
            ))}
          </ul>
        </div>

        <p className="invoice-pdf-footer">
          {t.generatedOn} {new Date().toISOString().slice(0, 10)}
        </p>
      </div>
    </div>
  );
}
