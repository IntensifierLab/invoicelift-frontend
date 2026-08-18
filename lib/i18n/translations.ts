// i18n scaffold for issue #22: English, French, Portuguese — the three
// languages of West African trade-finance markets this app targets. Seeded
// with the highest-traffic strings (nav + common actions); externalising
// every string in the app is a larger follow-up (see PR description) — this
// establishes the pattern (dictionary shape, hook, locale-aware formatting)
// so each page can adopt it incrementally.
export type Locale = "en" | "fr" | "pt";

export const LOCALES: { code: Locale; label: string }[] = [
  { code: "en", label: "English" },
  { code: "fr", label: "Français" },
  { code: "pt", label: "Português" },
];

export const DEFAULT_LOCALE: Locale = "en";

export type TranslationKey =
  | "nav.smes"
  | "nav.invoices"
  | "nav.registry"
  | "nav.liquidity"
  | "nav.lenders"
  | "nav.risk"
  | "nav.waterfall"
  | "nav.roadmap"
  | "nav.docs"
  | "common.connectWallet"
  | "common.loading"
  | "common.save"
  | "common.cancel";

export const TRANSLATIONS: Record<Locale, Record<TranslationKey, string>> = {
  en: {
    "nav.smes": "SMEs",
    "nav.invoices": "Invoices",
    "nav.registry": "Registry",
    "nav.liquidity": "Liquidity",
    "nav.lenders": "Lenders",
    "nav.risk": "Risk",
    "nav.waterfall": "Waterfall",
    "nav.roadmap": "Roadmap",
    "nav.docs": "Docs",
    "common.connectWallet": "Connect Wallet",
    "common.loading": "Loading…",
    "common.save": "Save",
    "common.cancel": "Cancel",
  },
  fr: {
    "nav.smes": "PME",
    "nav.invoices": "Factures",
    "nav.registry": "Registre",
    "nav.liquidity": "Liquidité",
    "nav.lenders": "Prêteurs",
    "nav.risk": "Risque",
    "nav.waterfall": "Cascade",
    "nav.roadmap": "Feuille de route",
    "nav.docs": "Docs",
    "common.connectWallet": "Connecter le portefeuille",
    "common.loading": "Chargement…",
    "common.save": "Enregistrer",
    "common.cancel": "Annuler",
  },
  pt: {
    "nav.smes": "PMEs",
    "nav.invoices": "Faturas",
    "nav.registry": "Registro",
    "nav.liquidity": "Liquidez",
    "nav.lenders": "Credores",
    "nav.risk": "Risco",
    "nav.waterfall": "Cascata",
    "nav.roadmap": "Roteiro",
    "nav.docs": "Docs",
    "common.connectWallet": "Conectar carteira",
    "common.loading": "Carregando…",
    "common.save": "Salvar",
    "common.cancel": "Cancelar",
  },
};
