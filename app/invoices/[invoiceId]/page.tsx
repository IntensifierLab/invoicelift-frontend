import { notFound } from "next/navigation";
import { InvoicePdfView } from "@/components/invoice-pdf-view";
import { RouteGuard } from "@/components/route-guard";
import { findInvoiceById } from "@/lib/invoices/mock-data";

export async function generateMetadata({ params }: { params: Promise<{ invoiceId: string }> }) {
  const { invoiceId } = await params;
  return { title: `Invoice ${invoiceId}` };
}

export default async function Page({ params }: { params: Promise<{ invoiceId: string }> }) {
  const { invoiceId } = await params;
  const invoice = findInvoiceById(invoiceId);

  if (!invoice) {
    notFound();
  }

  return (
    <RouteGuard allow={["lender", "admin"]}>
      <section className="section">
        <span className="tag print-hidden">Invoices</span>
        <h2 className="print-hidden">{invoice.id}</h2>
        <InvoicePdfView invoice={invoice} />
      </section>
    </RouteGuard>
  );
}
