# InvoiceLift — Web application (Next.js / WhoPays-grade README)

**InvoiceLift Web** — SME onboarding, liquidity partner pitch pages, and risk transparency for invoice financing on Soroban.

---

## 🎯 What is this app?

Next.js delivers **borrower education**, **pool storytelling**, and **waterfall explainers** so SMEs and lenders share the same mental model of receivables financing. Sensitive KYB docs and bank files never belong in static assets—route uploads through [`../backend/`](../backend/README.md). This site is for **clarity** first.

---

## ❓ Problems the **whole protocol** tackles

From the [root README](../../README.md):

- SMEs face chronic **cash-flow gaps** even when buyers are creditworthy.
- Invoice financing is often expensive or unavailable due to **information asymmetry**.
- Repayments from buyers need **clear priority rules** among lenders, fees, and penalties.

---

## 🚀 Goals this frontend supports

- Register invoices and state transitions in `invoice-registry` (verify, assign, default handling).
- Allow **pools** with exposure limits in `pool-manager`.
- Route repayments through `repayment-waterfall` with **predictable** precedence.
- Provide monitoring surfaces for **underwriting** and portfolio risk.

---

## 💡 Why a dedicated **Next.js** frontend?

- **Credit committees** bookmark `/risk` and `/liquidity` during diligence.
- **SME self-serve** starts at `/smes` before KYB completion.
- **Anchor buyers** read how acknowledgements unlock financing.

---

## ✨ Features & surfaces (shipping roadmap)

- **🏪 SMEs** — borrower journey (`/smes`).
- **💧 Liquidity** — pool participation mechanics (`/liquidity`).
- **⚠️ Risk** — monitoring & covenants narrative (`/risk`).
- **🗺️ Site map** — `/` keeps engineering honest.
- **📚 Docs** — legal + integration references (`/docs`).

---

## 🏗️ Architecture

| Layer | Choice |
| ----- | ------ |
| Framework | **Next.js 15** — App Router, React 19 |
| Language | **TypeScript** (strict) |
| Styling | **CSS variables** in `app/globals.css` — protocol-specific palette |
| Components | `components/expected-pages.tsx` — **site map table** synced with [`docs/SITE_MAP.md`](../../docs/SITE_MAP.md) |
| Data | Static/scaffold today → Server Components + [`../backend/`](../backend/README.md) for authenticated flows |
| Blockchain UX | Wallet demos optional — **RPC/signing secrets stay off this bundle** |

---

## 📁 Project structure

```
frontend/
├── app/
│   ├── layout.tsx       # Shell: metadata + nav links
│   ├── page.tsx         # Landing + <ExpectedPages /> site map
│   ├── globals.css      # Design tokens / theme
│   └── …                # Feature routes (see route tables below)
├── components/
│   └── expected-pages.tsx
├── next.config.ts
├── package.json
├── tsconfig.json
└── README.md            # ← you are here
```

---

## 🗺️ Routes

### Header navigation

| Route | Label | Notes |
| ----- | ----- | ----- |
| `/smes` | SMEs | Primary navigation |
| `/liquidity` | Liquidity | Primary navigation |
| `/risk` | Risk | Primary navigation |
| `/roadmap` | Roadmap | Primary navigation |
| `/docs` | Docs | Primary navigation |

### Full backlog (canonical)

Authoritative **purpose + status**: [`../../docs/SITE_MAP.md`](../../docs/SITE_MAP.md).

| Route | Purpose | Status |
| ----- | ------- | ------ |
| `/` | Landing + site map | Scaffold * |
| `/smes` | Borrower onboarding and UX | Planned |
| `/liquidity` | Pool participation mechanics | Planned |
| `/risk` | Underwriting signals and monitoring | Planned |
| `/roadmap` | Credit infra milestones | Scaffold * |
| `/docs` | Legal and integration docs | Scaffold * |

The **Expected pages** section on **`/`** mirrors this table so visitors see delivery honesty without opening GitHub.

---

## 🚀 Quick start

### Prerequisites

- **Node.js** 20.x or **22.x** (LTS)
- npm (pnpm/yarn OK if your org standardizes)

### Install & run (dev)

```bash
cd frontend
npm install
npm run dev
```

Open **http://localhost:3000**

### Run **with** the API (integration dev)

```bash
# Terminal A — backend
cd ../backend && npm install && cp .env.example .env && npm run dev

# Terminal B — frontend (this folder)
cd ../frontend && npm run dev
```

Match [`../backend/README.md`](../backend/README.md) CORS origin ↔ Next origin.

---

## 📜 Available scripts

| Command | Purpose |
| ------- | ------- |
| `npm run dev` | Dev server + hot reload |
| `npm run build` | Production build |
| `npm run start` | Serve production output |
| `npm run lint` | ESLint (`next/core-web-vitals`) |

---

## 🔐 Environment variables

### Baseline

Static scaffold needs **no secrets**. Use `.env.local` (gitignored) for optional public config.

### Planned **browser-safe** vars (`NEXT_PUBLIC_*` only)

Never put private keys or RPC URLs here.

| Variable | Example | Purpose |
| -------- | ------- | ------- |
| `NEXT_PUBLIC_BACKEND_URL` | `http://localhost:8080` | Application API. |
| `NEXT_PUBLIC_NETWORK` | `testnet` | Badge. |

---

## 🔗 Integration contract

- **REST**: Call [`backend/`](../backend/README.md) under `/api/v1/*` from Route Handlers or authenticated clients—never ship server secrets to `NEXT_PUBLIC_*`.
- **Soroban**: Demonstrate wallet flows with **test keys** only; production signing patterns belong in backend or secure wallets.
- **Contracts**: Rules live in [`../../contract/`](../../contract/) — UI reflects state via Horizon/indexers/backend.

---

## 🧪 Testing & quality gates

```bash
npm run lint
npm run build
```

Fix all ESLint + TypeScript errors before merging.

---

## 🚢 Deployment (e.g. Vercel / Netlify / Cloudflare Pages)

1. Set **build command**: `npm run build`
2. Set **output**: Next.js default (`.next`)
3. Configure **`NEXT_PUBLIC_*`** env vars per environment
4. Point **`NEXT_PUBLIC_BACKEND_URL`** at your deployed API
5. Enable **preview deployments** for grant demo links

---

## 🤝 Contributing

See [`../../CONTRIBUTING.md`](../../CONTRIBUTING.md). UI changes should stay aligned with [`../../docs/SITE_MAP.md`](../../docs/SITE_MAP.md).

---

## 📄 License

Match repository license (Apache-2.0 common for OSS grants).

---

## 📞 Support & docs

| Resource | Link |
| -------- | ---- |
| Monorepo overview | [`../../README.md`](../../README.md) |
| Backend API | [`../backend/README.md`](../backend/README.md) |
| Site map | [`../../docs/SITE_MAP.md`](../../docs/SITE_MAP.md) |
| Layout plan | [`../../docs/layout-plan.md`](../../docs/layout-plan.md) |
| Milestones → issues | [`../../docs/milestones-issues.md`](../../docs/milestones-issues.md) |

---

**npm package:** `invoicelift-web` · **Slug:** `invoicelift` · **Stack:** Next.js App Router

**Ship it.** 🚀

<!-- Contribution check by alexdev99 at 2024-12-12T14:45:31 -->

<!-- Contribution check by lisap at 2025-03-18T20:16:33 -->

<!-- Contribution check by karen-s at 2025-06-23T01:47:35 -->

<!-- Contribution check by alexdev99 at 2025-09-27T07:18:37 -->

<!-- Contribution check by lisap at 2026-01-01T12:49:39 -->

<!-- Contribution check by karen-s at 2026-04-07T18:20:41 -->
