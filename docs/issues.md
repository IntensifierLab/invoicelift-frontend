# Frontend Issues Backlog

## Issue: Build monitoring dashboard for underwriting
**Labels:** `enhancement`, `ui`
**Description:** Provide lenders with a clean interface to monitor the performance of invoice pools, view outstanding receivables, and track repayment timelines.
**Acceptance Criteria:**
- Real-time updates of pool status.
- Chart visualizations for total value locked and default rates.
- Drill-down views for individual SME performance.

## Issue: Build SME onboarding flow
**Labels:** `feature`, `ux`
**Description:** Implement a seamless onboarding flow for SMEs to register, upload their first invoices, and request financing.
**Acceptance Criteria:**
- Multi-step form for company details.
- Secure upload for invoice documentation.
- Clear status indicators for invoice verification.

## Issue: Implement invoice registry viewer
**Labels:** `feature`, `core`
**Description:** Create a read-only view that pulls from the `invoice-registry` contract to show the public status of an invoice (e.g. Verified, Financed, Repaid).
**Acceptance Criteria:**
- Search by invoice ID.
- Display state transitions securely fetched from the chain.
