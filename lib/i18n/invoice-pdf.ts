/**
 * Label translations for the invoice PDF document (issue #32's
 * "Multilingual (EN, FR, PT)" criterion). Scoped to this document's own
 * fixed label set — this app has no general i18n system, and a full
 * routing/locale framework (next-intl, etc.) is out of scope for one
 * document. Values, not labels, don't need translation (currency amounts,
 * dates, and IDs read the same in every language here).
 */

export type InvoicePdfLocale = "en" | "fr" | "pt";

export const INVOICE_PDF_LOCALES: { code: InvoicePdfLocale; label: string }[] = [
  { code: "en", label: "English" },
  { code: "fr", label: "Français" },
  { code: "pt", label: "Português" },
];

export type InvoicePdfLabels = {
  documentTitle: string;
  invoiceId: string;
  status: string;
  amount: string;
  dueDate: string;
  sme: string;
  buyer: string;
  lenderPool: string;
  contractAddress: string;
  contractNotDeployed: string;
  waterfallRules: string;
  generatedOn: string;
  print: string;
};

const LABELS: Record<InvoicePdfLocale, InvoicePdfLabels> = {
  en: {
    documentTitle: "Invoice financing document",
    invoiceId: "Invoice ID",
    status: "Status",
    amount: "Amount",
    dueDate: "Due date",
    sme: "SME",
    buyer: "Buyer",
    lenderPool: "Lender pool",
    contractAddress: "Contract address",
    contractNotDeployed: "Not yet deployed",
    waterfallRules: "Waterfall rules",
    generatedOn: "Generated on",
    print: "Print / Save as PDF",
  },
  fr: {
    documentTitle: "Document de financement de facture",
    invoiceId: "N° de facture",
    status: "Statut",
    amount: "Montant",
    dueDate: "Date d'échéance",
    sme: "PME",
    buyer: "Acheteur",
    lenderPool: "Pool de prêteurs",
    contractAddress: "Adresse du contrat",
    contractNotDeployed: "Pas encore déployé",
    waterfallRules: "Règles de répartition (waterfall)",
    generatedOn: "Généré le",
    print: "Imprimer / Enregistrer en PDF",
  },
  pt: {
    documentTitle: "Documento de financiamento de fatura",
    invoiceId: "Nº da fatura",
    status: "Status",
    amount: "Valor",
    dueDate: "Data de vencimento",
    sme: "PME",
    buyer: "Comprador",
    lenderPool: "Pool de credores",
    contractAddress: "Endereço do contrato",
    contractNotDeployed: "Ainda não implantado",
    waterfallRules: "Regras de distribuição (waterfall)",
    generatedOn: "Gerado em",
    print: "Imprimir / Salvar como PDF",
  },
};

export function invoicePdfLabels(locale: InvoicePdfLocale): InvoicePdfLabels {
  return LABELS[locale];
}
