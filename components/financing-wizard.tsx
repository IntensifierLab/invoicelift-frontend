"use client";

import { useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "invoicelift:financing-application";

const STEPS = ["Company profile", "Invoice upload", "Financing terms", "Sign & submit"] as const;

type CompanyProfile = { legalName: string; country: string; email: string };
type InvoiceDetails = { number: string; debtor: string; amount: string; dueDate: string };

type Application = {
  company: CompanyProfile;
  invoice: InvoiceDetails;
  acceptedTerms: boolean;
};

const EMPTY: Application = {
  company: { legalName: "", country: "", email: "" },
  invoice: { number: "", debtor: "", amount: "", dueDate: "" },
  acceptedTerms: false,
};

const ADVANCE_RATE = 0.85; // share of face value advanced up front
const FEE_RATE = 0.02; // financing fee on face value
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

function loadApplication(): Application {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY;
    return { ...EMPTY, ...(JSON.parse(raw) as Application) };
  } catch {
    return EMPTY;
  }
}

/** Field-level errors for a given step, keyed by field name. */
function validateStep(step: number, app: Application): Record<string, string> {
  const errors: Record<string, string> = {};
  if (step === 0) {
    if (!app.company.legalName.trim()) errors.legalName = "Legal name is required";
    if (!app.company.country.trim()) errors.country = "Country is required";
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(app.company.email)) errors.email = "A valid email is required";
  }
  if (step === 1) {
    if (!app.invoice.number.trim()) errors.number = "Invoice number is required";
    if (!app.invoice.debtor.trim()) errors.debtor = "Debtor name is required";
    const amount = Number(app.invoice.amount);
    if (!app.invoice.amount) errors.amount = "Amount is required";
    else if (!Number.isFinite(amount) || amount <= 0) errors.amount = "Amount must be a positive number";
    if (!ISO_DATE.test(app.invoice.dueDate)) errors.dueDate = "Due date must be YYYY-MM-DD";
  }
  if (step === 2) {
    if (!app.acceptedTerms) errors.acceptedTerms = "You must accept the terms to continue";
  }
  return errors;
}

export function FinancingWizard() {
  const [step, setStep] = useState(0);
  const [app, setApp] = useState<Application>(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [hydrated, setHydrated] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  // Restore any saved progress on first mount.
  useEffect(() => {
    setApp(loadApplication());
    setHydrated(true);
  }, []);

  // Persist progress across steps as the applicant edits.
  useEffect(() => {
    if (hydrated) localStorage.setItem(STORAGE_KEY, JSON.stringify(app));
  }, [app, hydrated]);

  const terms = useMemo(() => {
    const face = Number(app.invoice.amount) || 0;
    const advance = face * ADVANCE_RATE;
    const fee = face * FEE_RATE;
    return { face, advance, fee, net: advance - fee };
  }, [app.invoice.amount]);

  const next = () => {
    const stepErrors = validateStep(step, app);
    setErrors(stepErrors);
    if (Object.keys(stepErrors).length === 0) setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };
  const back = () => setStep((s) => Math.max(s - 1, 0));

  const connectWallet = () => {
    // Placeholder wallet connection; the real integration plugs in here.
    const addr = "G" + Math.random().toString(36).slice(2, 12).toUpperCase().padEnd(10, "X");
    setWalletAddress(addr);
  };

  const signAndSubmit = () => {
    if (!walletAddress) return;
    setSubmitted(true);
    localStorage.removeItem(STORAGE_KEY);
  };

  const updateCompany = (patch: Partial<CompanyProfile>) =>
    setApp((a) => ({ ...a, company: { ...a.company, ...patch } }));
  const updateInvoice = (patch: Partial<InvoiceDetails>) =>
    setApp((a) => ({ ...a, invoice: { ...a.invoice, ...patch } }));

  const money = (n: number) =>
    n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  if (submitted) {
    return (
      <div className="wizard-done" role="status">
        <h3>Application submitted</h3>
        <p>
          Your financing request for invoice <strong>{app.invoice.number}</strong> was signed with{" "}
          <code>{walletAddress}</code> and submitted for underwriting. You&apos;ll be notified once it&apos;s
          reviewed.
        </p>
      </div>
    );
  }

  return (
    <div className="wizard">
      <ol className="wizard-steps" aria-label="Application progress">
        {STEPS.map((label, i) => (
          <li
            key={label}
            className={`wizard-step ${i === step ? "is-active" : ""} ${i < step ? "is-done" : ""}`}
            aria-current={i === step ? "step" : undefined}
          >
            <span className="wizard-step-index">{i < step ? "✓" : i + 1}</span>
            <span className="wizard-step-label">{label}</span>
          </li>
        ))}
      </ol>

      <div className="wizard-panel">
        {step === 0 ? (
          <Fieldset legend="Company profile">
            <Field label="Legal company name" error={errors.legalName}>
              <input
                className="wizard-input"
                value={app.company.legalName}
                onChange={(e) => updateCompany({ legalName: e.target.value })}
                placeholder="Acme Trading Ltd"
              />
            </Field>
            <Field label="Country of registration" error={errors.country}>
              <input
                className="wizard-input"
                value={app.company.country}
                onChange={(e) => updateCompany({ country: e.target.value })}
                placeholder="Nigeria"
              />
            </Field>
            <Field label="Contact email" error={errors.email}>
              <input
                className="wizard-input"
                type="email"
                value={app.company.email}
                onChange={(e) => updateCompany({ email: e.target.value })}
                placeholder="finance@acme.example"
              />
            </Field>
          </Fieldset>
        ) : null}

        {step === 1 ? (
          <Fieldset legend="Invoice upload">
            <Field label="Invoice number" error={errors.number}>
              <input
                className="wizard-input"
                value={app.invoice.number}
                onChange={(e) => updateInvoice({ number: e.target.value })}
                placeholder="INV-1001"
              />
            </Field>
            <Field label="Debtor name" error={errors.debtor}>
              <input
                className="wizard-input"
                value={app.invoice.debtor}
                onChange={(e) => updateInvoice({ debtor: e.target.value })}
                placeholder="Big Buyer Inc"
              />
            </Field>
            <Field label="Face amount (USDC)" error={errors.amount}>
              <input
                className="wizard-input"
                inputMode="decimal"
                value={app.invoice.amount}
                onChange={(e) => updateInvoice({ amount: e.target.value })}
                placeholder="12500.00"
              />
            </Field>
            <Field label="Due date" error={errors.dueDate}>
              <input
                className="wizard-input"
                type="date"
                value={app.invoice.dueDate}
                onChange={(e) => updateInvoice({ dueDate: e.target.value })}
              />
            </Field>
          </Fieldset>
        ) : null}

        {step === 2 ? (
          <Fieldset legend="Financing terms">
            <dl className="wizard-terms">
              <div>
                <dt>Invoice face value</dt>
                <dd>{money(terms.face)} USDC</dd>
              </div>
              <div>
                <dt>Advance rate</dt>
                <dd>{Math.round(ADVANCE_RATE * 100)}%</dd>
              </div>
              <div>
                <dt>Gross advance</dt>
                <dd>{money(terms.advance)} USDC</dd>
              </div>
              <div>
                <dt>Financing fee ({Math.round(FEE_RATE * 100)}%)</dt>
                <dd>−{money(terms.fee)} USDC</dd>
              </div>
              <div className="wizard-terms-net">
                <dt>Net upfront to you</dt>
                <dd>{money(terms.net)} USDC</dd>
              </div>
            </dl>
            <label className="wizard-check">
              <input
                type="checkbox"
                checked={app.acceptedTerms}
                onChange={(e) => setApp((a) => ({ ...a, acceptedTerms: e.target.checked }))}
              />
              I accept the financing terms above.
            </label>
            {errors.acceptedTerms ? <p className="wizard-error">{errors.acceptedTerms}</p> : null}
          </Fieldset>
        ) : null}

        {step === 3 ? (
          <Fieldset legend="Sign & submit">
            <p className="wizard-review">
              Signing authorises the financing request for invoice{" "}
              <strong>{app.invoice.number || "—"}</strong> ({money(terms.net)} USDC net) from{" "}
              <strong>{app.company.legalName || "your company"}</strong>.
            </p>
            {walletAddress ? (
              <p className="wizard-wallet">
                Connected: <code>{walletAddress}</code>
              </p>
            ) : (
              <button type="button" className="cta-secondary wizard-btn" onClick={connectWallet}>
                Connect wallet
              </button>
            )}
            <button
              type="button"
              className="cta wizard-btn"
              disabled={!walletAddress}
              onClick={signAndSubmit}
            >
              Sign &amp; submit
            </button>
          </Fieldset>
        ) : null}
      </div>

      <div className="wizard-nav">
        <button type="button" className="wizard-back" onClick={back} disabled={step === 0}>
          Back
        </button>
        {step < STEPS.length - 1 ? (
          <button type="button" className="cta wizard-btn" onClick={next}>
            Continue
          </button>
        ) : null}
      </div>
    </div>
  );
}

function Fieldset({ legend, children }: { legend: string; children: React.ReactNode }) {
  return (
    <fieldset className="wizard-fieldset">
      <legend className="wizard-legend">{legend}</legend>
      {children}
    </fieldset>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="wizard-field">
      <span className="wizard-field-label">{label}</span>
      {children}
      {error ? <span className="wizard-error">{error}</span> : null}
    </label>
  );
}
