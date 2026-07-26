import { InvoiceNftViewer } from "@/components/invoice-nft/nft-viewer";

export const metadata = {
  title: "Invoice NFT",
};

// Deliberately not wrapped in RouteGuard, same as the registry status viewer
// this links from: a public, read-only view of on-chain NFT state.
export default async function Page({ params }: { params: Promise<{ invoiceId: string }> }) {
  const { invoiceId } = await params;

  return (
    <section className="section">
      <span className="tag">Registry &middot; NFT</span>
      <h2>Invoice NFT &mdash; {decodeURIComponent(invoiceId)}</h2>
      <p style={{ color: "var(--muted)" }}>
        Mint date, current holder, transfer history, and financing events read from the invoice&apos;s on-chain
        token.
      </p>
      <InvoiceNftViewer invoiceId={decodeURIComponent(invoiceId)} />
    </section>
  );
}
