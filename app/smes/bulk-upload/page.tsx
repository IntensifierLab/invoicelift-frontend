import type { Metadata } from "next";
import { BulkUpload } from "@/components/bulk-upload";

export const metadata: Metadata = {
  title: "Bulk invoice upload",
  description: "Upload batches of invoices via CSV with per-row validation.",
};

export default function Page() {
  return (
    <section className="section">
      <span className="tag">SMEs</span>
      <h2>Bulk invoice upload</h2>
      <p style={{ color: "var(--muted)", maxWidth: 640 }}>
        Upload a batch of invoices as CSV. Every row is validated in your browser
        before anything is submitted, so you can fix errors up front. Download the
        template to get the exact column format.
      </p>
      <BulkUpload />
    </section>
  );
}
