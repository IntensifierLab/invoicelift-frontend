# Accounting integrations (Xero / QuickBooks)

Implements issue #34: OAuth2 connection to an SME's accounting platform,
automatic import of eligible unpaid receivables, webhook-driven re-sync, and
conflict resolution between the accounting platform's data and InvoiceLift's
own records.

## OAuth2 flow

Both Xero (primary) and QuickBooks (secondary) use a standard OAuth2
authorization-code flow, run against a confidential (server-side) client:

1. `GET /api/integrations/[provider]/authorize` generates a random CSRF
   `state`, stores it in a short-lived httpOnly cookie, and redirects to the
   provider's authorize URL.
2. The provider redirects back to
   `GET /api/integrations/[provider]/callback` with `code` and `state`.
3. The callback route verifies `state` against the cookie, exchanges `code`
   for an access/refresh token pair (`lib/integrations/oauth.ts`), and saves
   the result (`lib/integrations/connection-store.ts`).
4. It then does a best-effort **automatic import** of eligible unpaid
   receivables (`lib/integrations/sync.ts`) before redirecting the SME to
   `/smes/integrations` with a success/error banner.

### Configuration

| Env var | Provider | Purpose |
| --- | --- | --- |
| `XERO_CLIENT_ID` / `XERO_CLIENT_SECRET` | Xero | OAuth2 client credentials |
| `XERO_WEBHOOK_KEY` | Xero | Webhook HMAC signing key |
| `QUICKBOOKS_CLIENT_ID` / `QUICKBOOKS_CLIENT_SECRET` | QuickBooks | OAuth2 client credentials |
| `QUICKBOOKS_WEBHOOK_VERIFIER_TOKEN` | QuickBooks | Webhook HMAC signing key |

Each provider app must be registered with the redirect URI
`{origin}/api/integrations/{provider}/callback`. Without credentials
configured, `authorize` returns `503` rather than silently failing.

## Automatic import

`importEligibleReceivables()` queries the platform for unpaid receivables:

- **Xero**: `GET /api.xro/2.0/Invoices?where=Type=="ACCREC"&&Status=="AUTHORISED"`
- **QuickBooks**: `SELECT * FROM Invoice WHERE Balance > '0'` via the Query API

Both are normalized to a common `SyncedInvoice` shape and passed through
conflict resolution before being merged into the local invoice set.

## Webhook listeners

`POST /api/integrations/[provider]/webhook` receives status-change
notifications. Both platforms sign the raw request body with HMAC-SHA256
against a shared secret (`x-xero-signature` / `intuit-signature` headers);
the handler verifies this with a constant-time comparison
(`crypto.timingSafeEqual`) before processing anything, and responds `401` on
a bad signature. A verified event triggers the same
`importEligibleReceivables()` re-sync as the initial import.

## Conflict resolution strategy

Implemented in `lib/integrations/conflict-resolution.ts`
(`resolveInvoiceConflict`), a pure function so it's trivial to unit test and
reused identically by both the initial import and the webhook handler:

- **Field ownership, not last-write-wins-on-everything.** Financial fields
  (`amount`, `currency`, `dueDate`, `paid`) are owned by the accounting
  platform — Xero/QuickBooks is the source of truth for money that actually
  moved, so an incoming record always overwrites these. InvoiceLift-local
  fields (`financingStatus`, `registryId`) are owned by InvoiceLift and are
  never touched by a sync — the accounting platform has no concept of them.
- **Timestamp gate.** An incoming record is only applied if its `updatedAt`
  is strictly newer than the local record's; an out-of-order or duplicate
  webhook delivery is a no-op (`kind: "unchanged"`).
- **No local record** → straight insert, seeded with
  `financingStatus: "unfinanced"` and no registry id.
- **Result is reported, not just applied** — `resolveInvoiceConflict` returns
  `{ kind: "insert" | "update" | "unchanged", ... }` (plus `changedFields` on
  update) so callers can log or audit exactly what a sync changed.

### Why not last-write-wins on every field?

A naive last-write-wins would let a stale accounting-platform webhook
clobber a `financingStatus` transition that only exists in InvoiceLift (e.g.
a lender just financed the invoice on-chain). Splitting ownership by field
avoids that class of bug entirely rather than requiring careful timestamp
choreography between two systems that don't know about each other.

## Known limitations (scaffold)

- **Connection storage is an httpOnly cookie**, not a database row. This
  repo has neither a database nor a per-SME account table yet, so the
  cookie is the simplest thing that makes the OAuth flow, import, and
  webhook code real and testable end-to-end today. Before production:
  move to server-side storage keyed by the SME's account, encrypt tokens at
  rest, and rotate the refresh token on every use.
- **QuickBooks realm (company) id** is not yet persisted from the OAuth
  callback, so `importEligibleReceivables` uses a placeholder in the query
  URL for QuickBooks. Wire this up once connection storage moves to a real
  database record that can hold it.
- No UI yet for reviewing an import's diff before it's applied — everything
  currently merges automatically.
