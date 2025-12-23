export function ExpectedPages() {
  return (
    <section className="section site-map" id="site-map">
      <span className="tag">Site map</span>
      <h2>Expected pages (delivery backlog)</h2>
      <p style={{ color: "var(--muted)", maxWidth: 720 }}>
        This table is the contract between product and engineering. Routes marked scaffold ship as
        placeholders; planned routes are tracked for sprint planning.
      </p>
      <div style={{ overflowX: "auto", marginTop: 16 }}>
        <table>
          <thead>
            <tr>
              <th>Route</th>
              <th>Purpose</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr key="/"><td><code>/</code></td><td>Landing + site map</td><td>Scaffold</td></tr>
            <tr key="/smes"><td><code>/smes</code></td><td>Borrower onboarding and UX</td><td>Planned</td></tr>
            <tr key="/liquidity"><td><code>/liquidity</code></td><td>Pool participation mechanics</td><td>Planned</td></tr>
            <tr key="/risk"><td><code>/risk</code></td><td>Underwriting signals and monitoring</td><td>Planned</td></tr>
            <tr key="/roadmap"><td><code>/roadmap</code></td><td>Credit infra milestones</td><td>Scaffold</td></tr>
            <tr key="/docs"><td><code>/docs</code></td><td>Legal and integration docs</td><td>Scaffold</td></tr>
          </tbody>
        </table>
      </div>
    </section>
  );
}

// Contribution check by cryptomagician at 2025-01-19T10:04:08

// Contribution check by michaelc at 2025-04-25T15:35:10

// Contribution check by william-b at 2025-07-30T21:06:12

// Contribution check by cryptomagician at 2025-11-04T02:37:14

// Contribution check by michaelc at 2026-02-08T08:08:16

// Contribution check by william-b at 2026-05-15T13:39:18

// Contribution by Mercy017 — 2025-02-22

// Contribution by kulayddon — 2025-07-24

// Contribution by codemagician1949 — 2025-12-23
