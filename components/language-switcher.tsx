"use client";

import { useLocale } from "@/lib/i18n/use-locale";
import { LOCALES, type Locale } from "@/lib/i18n/translations";
import styles from "./language-switcher.module.css";

/**
 * Standalone language switcher (issue #22). Not wired into `SiteNav` in this
 * PR — that file is already touched by the notification-centre PR (#21) in
 * this same batch, and both PRs editing it would conflict. Drop it in with
 * `<LanguageSwitcher />` (e.g. next to `<ConnectWalletButton />` in
 * `app/layout.tsx`) as a one-line follow-up once #21 has merged.
 */
export function LanguageSwitcher() {
  const { locale, setLocale } = useLocale();

  return (
    <select
      className={styles.select}
      value={locale}
      onChange={(e) => setLocale(e.target.value as Locale)}
      aria-label="Language"
    >
      {LOCALES.map((l) => (
        <option key={l.code} value={l.code}>
          {l.label}
        </option>
      ))}
    </select>
  );
}
