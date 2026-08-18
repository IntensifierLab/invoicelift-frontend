import type { Locale } from "./translations";

// BCP-47 tags for Intl formatting. Portuguese defaults to pt-PT rather than
// pt-BR — this app targets West African markets, not Brazil.
const INTL_TAG: Record<Locale, string> = {
  en: "en-US",
  fr: "fr-FR",
  pt: "pt-PT",
};

/** Locale-aware currency formatting (issue #22's "currency formatted per locale"). */
export function formatCurrency(amount: number, locale: Locale, currency = "USD"): string {
  return new Intl.NumberFormat(INTL_TAG[locale], {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(amount);
}

/** Locale-aware date formatting ("dates ... formatted per locale"). */
export function formatDate(date: Date | string, locale: Locale): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat(INTL_TAG[locale], { dateStyle: "medium" }).format(d);
}
