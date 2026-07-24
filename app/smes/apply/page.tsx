import type { Metadata } from "next";
import { FinancingWizard } from "@/components/financing-wizard";

export const metadata: Metadata = {
  title: "Apply for financing",
  description: "Guided flow for SMEs to upload an invoice and request financing.",
};

export default function Page() {
  return (
    <section className="section">
      <span className="tag">SMEs</span>
      <h2>Apply for financing</h2>
      <p style={{ color: "var(--muted)", maxWidth: 640 }}>
        A guided flow to submit your company profile, upload an invoice, review
        your financing terms, and sign the request with your wallet. Your progress
        is saved as you go, so you can pick up where you left off.
      </p>
      <FinancingWizard />
    </section>
  );
}
