"use client";

import { useState, useEffect } from "react";

interface LogMessage {
  time: string;
  text: string;
  type: "info" | "success" | "warn" | "error";
}

export default function Page() {
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");
  
  // SME Financial Data (held purely client-side)
  const [revenue, setRevenue] = useState(450000);
  const [debt, setDebt] = useState(80000);
  const [assets, setAssets] = useState(150000);
  
  // ZK Proving State
  const [zkState, setZkState] = useState<"idle" | "proving" | "proved">("idle");
  const [zkProgress, setZkProgress] = useState(0);
  const [logs, setLogs] = useState<LogMessage[]>([]);
  const [proof, setProof] = useState<string | null>(null);
  
  // Scoring Service / Attestation State
  const [attestationState, setAttestationState] = useState<"idle" | "verifying" | "attested">("idle");
  const [creditScore, setCreditScore] = useState<string | null>(null);
  const [attestationTx, setAttestationTx] = useState<string | null>(null);
  
  // Financing Demo State
  const [drawdownAmount, setDrawdownAmount] = useState(25000);
  const [selectedPool, setSelectedPool] = useState("SME Liquidity Pool Alpha");
  const [financingStatus, setFinancingStatus] = useState<"idle" | "success" | "denied">("idle");

  // Add terminal log helper
  const addLog = (text: string, type: "info" | "success" | "warn" | "error" = "info") => {
    const time = new Date().toLocaleTimeString();
    setLogs((prev) => [...prev, { time, text, type }]);
  };

  // Simulate Wallet Connection
  const handleConnectWallet = () => {
    if (walletConnected) {
      setWalletConnected(false);
      setWalletAddress("");
      setZkState("idle");
      setZkProgress(0);
      setLogs([]);
      setProof(null);
      setAttestationState("idle");
      setCreditScore(null);
      setAttestationTx(null);
      setFinancingStatus("idle");
    } else {
      setWalletConnected(true);
      setWalletAddress("GB2C" + Math.random().toString(36).substring(2, 10).toUpperCase() + "..." + Math.random().toString(36).substring(2, 6).toUpperCase() + "X7Y9");
    }
  };

  // Simulate Client-Side ZK Proof Generation
  const handleGenerateProof = () => {
    if (zkState !== "idle") return;
    setZkState("proving");
    setZkProgress(0);
    setLogs([]);
    
    addLog("Initializing WebAssembly SnarkJS runtime...", "info");
    
    const steps = [
      { progress: 15, log: "Loading SME creditworthiness circuit (.wasm / R1CS constraints)...", type: "info" },
      { progress: 35, log: "Binding private inputs: [revenue = $" + revenue.toLocaleString() + ", debt = $" + debt.toLocaleString() + ", assets = $" + assets.toLocaleString() + "]", type: "info" },
      { progress: 55, log: "Generating witness locally (no data leaves browser)...", type: "info" },
      { progress: 75, log: "Evaluating constraints & executing local Groth16 prover...", type: "info" },
      { progress: 90, log: "Proof generated! Size: 512 bytes. Blinding factor: 0x" + Math.random().toString(16).substring(2, 10), type: "success" },
      { progress: 100, log: "ZK SNARK Proof created client-side successfully.", type: "success" }
    ];

    steps.forEach((step, idx) => {
      setTimeout(() => {
        setZkProgress(step.progress);
        addLog(step.log, step.type as any);
        if (step.progress === 100) {
          setZkState("proved");
          // Generate a fake proof hash
          setProof("proof_" + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15));
        }
      }, (idx + 1) * 800);
    });
  };

  // Simulate Scoring Service Verification & On-Chain Attestation
  const handleVerifyAndAttest = () => {
    if (attestationState !== "idle") return;
    setAttestationState("verifying");
    
    addLog("Transmitting proof hash & public commitments to Scoring Service...", "info");
    addLog("Scoring Service: Verifying SNARK proof against public parameters...", "info");
    
    setTimeout(() => {
      // Calculate score based on ratio
      const ratio = debt / (assets || 1);
      let score = "A+";
      if (ratio > 1.5) score = "B-";
      else if (ratio > 1.0) score = "B+";
      else if (ratio > 0.5) score = "A";

      addLog("Scoring Service: ZK Proof verified! Calculated Credit Score: " + score, "success");
      addLog("Signing on-chain attestation linked to " + walletAddress + "...", "info");
      
      setTimeout(() => {
        const txHash = "0x" + Math.random().toString(16).substring(2, 10) + Math.random().toString(16).substring(2, 10) + Math.random().toString(16).substring(2, 10) + Math.random().toString(16).substring(2, 10);
        addLog("Attestation registered on Stellar ledger. Tx: " + txHash, "success");
        setCreditScore(score);
        setAttestationTx(txHash);
        setAttestationState("attested");
      }, 1000);
    }, 1200);
  };

  // Simulate Financing Request (Gated by Attestation)
  const handleRequestFinancing = () => {
    if (!walletConnected || attestationState !== "attested") {
      setFinancingStatus("denied");
      return;
    }
    // Gating logic: Require tier B+ or higher
    if (creditScore === "B-") {
      setFinancingStatus("denied");
    } else {
      setFinancingStatus("success");
    }
  };

  return (
    <section className="section">
      <span className="tag">ZK Privacy Framework</span>
      
      <div className="sme-header">
        <h2>SME Credit Onboarding</h2>
        <p className="subtitle">
          Prove your creditworthiness to liquidity pools using zero-knowledge proofs. 
          Your raw financial statements never leave your machine.
        </p>
      </div>

      <div className="dashboard-grid">
        {/* Step 1: Wallet Connection */}
        <div className="card step-card">
          <div className="step-num">Step 1</div>
          <h3>Connect Wallet</h3>
          <p className="card-desc">Link your Stellar wallet to establish your identity and anchor your ZK attestation.</p>
          
          <div className="btn-container">
            <button 
              onClick={handleConnectWallet}
              className={walletConnected ? "btn-connected" : "btn-primary"}
            >
              {walletConnected ? "Disconnect Wallet" : "Connect Stellar Wallet"}
            </button>
          </div>
          
          {walletConnected && (
            <div className="wallet-details">
              <span className="dot active-dot"></span>
              <code className="wallet-addr">{walletAddress}</code>
            </div>
          )}
        </div>

        {/* Step 2: Client-side ZK Data Generation */}
        <div className={`card step-card ${!walletConnected ? "card-disabled" : ""}`}>
          <div className="step-num">Step 2</div>
          <h3>Local Financial Inputs</h3>
          <p className="card-desc">Enter your financial figures. This data remains in local state to compile the proof.</p>
          
          <div className="form-group">
            <label>Annual Revenue (USD)</label>
            <input 
              type="number" 
              value={revenue} 
              onChange={(e) => setRevenue(Number(e.target.value))}
              disabled={!walletConnected || zkState !== "idle"}
            />
          </div>
          <div className="form-group">
            <label>Outstanding Debt (USD)</label>
            <input 
              type="number" 
              value={debt} 
              onChange={(e) => setDebt(Number(e.target.value))}
              disabled={!walletConnected || zkState !== "idle"}
            />
          </div>
          <div className="form-group">
            <label>Liquid Assets (USD)</label>
            <input 
              type="number" 
              value={assets} 
              onChange={(e) => setAssets(Number(e.target.value))}
              disabled={!walletConnected || zkState !== "idle"}
            />
          </div>

          <div className="btn-container">
            <button 
              disabled={!walletConnected || zkState !== "idle"}
              onClick={handleGenerateProof}
              className="btn-primary"
            >
              {zkState === "proving" ? "Generating Proof..." : zkState === "proved" ? "Proof Generated ✓" : "Generate ZK Proof"}
            </button>
          </div>

          {zkState !== "idle" && (
            <div className="progress-bar-container">
              <div className="progress-bar" style={{ width: `${zkProgress}%` }}></div>
            </div>
          )}
        </div>

        {/* Step 3: ZK Verifier Console */}
        <div className={`card step-card wide-card ${zkState !== "proved" ? "card-disabled" : ""}`}>
          <div className="step-num">Step 3</div>
          <h3>ZK Verification Console</h3>
          <p className="card-desc">Submit the generated proof to the Scoring Service. No raw financial data is sent.</p>
          
          <div className="console-wrapper">
            <div className="console-header">
              <span className="console-dot red"></span>
              <span className="console-dot yellow"></span>
              <span className="console-dot green"></span>
              <span className="console-title">Local Proving Console</span>
            </div>
            <div className="console-body">
              {logs.length === 0 ? (
                <div className="empty-logs">Ready for proof generation.</div>
              ) : (
                logs.map((log, idx) => (
                  <div key={idx} className={`console-line ${log.type}`}>
                    <span className="console-time">[{log.time}]</span> {log.text}
                  </div>
                ))
              )}
            </div>
          </div>

          {zkState === "proved" && (
            <div className="btn-container mt-16">
              <button 
                disabled={attestationState !== "idle"}
                onClick={handleVerifyAndAttest}
                className="btn-primary"
              >
                {attestationState === "verifying" ? "Verifying..." : attestationState === "attested" ? "Attested ✓" : "Submit Proof for Verification"}
              </button>
            </div>
          )}

          {attestationState === "attested" && (
            <div className="attestation-badge">
              <div className="badge-item">
                <span className="badge-label">ZK Credit Score:</span>
                <span className="badge-val">{creditScore}</span>
              </div>
              <div className="badge-item">
                <span className="badge-label">On-chain Attestation:</span>
                <code className="badge-tx">{attestationTx}</code>
              </div>
            </div>
          )}
        </div>

        {/* Step 4: Gated financing eligibility check */}
        <div className={`card step-card ${attestationState !== "attested" ? "card-disabled" : ""}`}>
          <div className="step-num">Step 4</div>
          <h3>Gated Pool Financing</h3>
          <p className="card-desc">Draw down capital from pools. Pools read the on-chain attestation to grant access.</p>
          
          <div className="form-group">
            <label>Select Pool</label>
            <select 
              value={selectedPool}
              onChange={(e) => setSelectedPool(e.target.value)}
              disabled={attestationState !== "attested"}
            >
              <option value="SME Liquidity Pool Alpha">Alpha Pool (Min Tier: B+)</option>
              <option value="Premium Yield Pool Beta">Beta Pool (Min Tier: A)</option>
            </select>
          </div>

          <div className="form-group">
            <label>Drawdown Amount (USD)</label>
            <input 
              type="number" 
              value={drawdownAmount}
              onChange={(e) => setDrawdownAmount(Number(e.target.value))}
              disabled={attestationState !== "attested"}
            />
          </div>

          <div className="btn-container">
            <button 
              disabled={attestationState !== "attested"}
              onClick={handleRequestFinancing}
              className="btn-primary"
            >
              Request Financing
            </button>
          </div>

          {financingStatus === "success" && (
            <div className="status-banner success-banner">
              <strong>✓ Drawdown Approved</strong>
              <p>Successfully disbursed ${drawdownAmount.toLocaleString()} to wallet.</p>
            </div>
          )}

          {financingStatus === "denied" && (
            <div className="status-banner error-banner">
              <strong>⚠ Access Denied</strong>
              {creditScore === "B-" ? (
                <p>Credit Score Tier B- is below the minimum required for this pool.</p>
              ) : (
                <p>Valid on-chain ZK credit attestation required.</p>
              )}
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .sme-header {
          margin-bottom: 32px;
        }
        .subtitle {
          color: var(--muted);
          max-width: 680px;
        }
        .dashboard-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: 20px;
          margin-top: 16px;
        }
        .step-card {
          position: relative;
          display: flex;
          flex-direction: column;
          min-height: 320px;
        }
        .wide-card {
          grid-column: span 2;
        }
        @media (max-width: 768px) {
          .wide-card {
            grid-column: span 1;
          }
        }
        .step-num {
          position: absolute;
          top: 18px;
          right: 18px;
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          color: var(--accent);
          letter-spacing: 0.08em;
          background: color-mix(in srgb, var(--accent) 15%, transparent);
          padding: 4px 8px;
          border-radius: 4px;
        }
        .card-desc {
          font-size: 0.9rem;
          color: var(--muted);
          margin-bottom: 20px;
          flex-grow: 0;
        }
        .card-disabled {
          opacity: 0.45;
          pointer-events: none;
          filter: grayscale(40%);
        }
        .btn-container {
          margin-top: auto;
          display: flex;
        }
        .btn-primary, .btn-connected {
          width: 100%;
          padding: 12px;
          border-radius: 8px;
          font-weight: 700;
          font-size: 0.9rem;
          cursor: pointer;
          border: none;
          transition: background 0.2s ease, opacity 0.2s ease;
        }
        .btn-primary {
          background: linear-gradient(135deg, var(--accent), var(--accent-2));
          color: #1a1005;
        }
        .btn-primary:hover:not(:disabled) {
          opacity: 0.9;
        }
        .btn-primary:disabled {
          background: #44321d;
          color: #8c765e;
          cursor: not-allowed;
        }
        .btn-connected {
          background: color-mix(in srgb, var(--accent) 15%, transparent);
          border: 1px solid var(--accent);
          color: var(--accent);
        }
        .btn-connected:hover {
          background: color-mix(in srgb, var(--accent) 25%, transparent);
        }
        .wallet-details {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-top: 12px;
          background: #1a1005;
          padding: 6px 12px;
          border-radius: 6px;
          border: 1px solid color-mix(in srgb, var(--accent) 12%, transparent);
        }
        .dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }
        .active-dot {
          background: #50e3c2;
          box-shadow: 0 0 8px #50e3c2;
        }
        .wallet-addr {
          font-size: 0.8rem;
          color: var(--text);
        }
        .form-group {
          margin-bottom: 14px;
        }
        .form-group label {
          display: block;
          font-size: 0.78rem;
          font-weight: 600;
          color: var(--muted);
          margin-bottom: 6px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .form-group input, .form-group select {
          width: 100%;
          padding: 10px;
          border-radius: 6px;
          background: #1a1005;
          border: 1px solid color-mix(in srgb, var(--accent) 20%, transparent);
          color: var(--text);
          font-family: inherit;
        }
        .form-group input:focus, .form-group select:focus {
          outline: none;
          border-color: var(--accent);
        }
        .progress-bar-container {
          margin-top: 12px;
          height: 4px;
          background: #1a1005;
          border-radius: 2px;
          overflow: hidden;
        }
        .progress-bar {
          height: 100%;
          background: linear-gradient(90deg, var(--accent), var(--accent-2));
          transition: width 0.3s ease;
        }
        .console-wrapper {
          background: #0f0903;
          border: 1px solid color-mix(in srgb, var(--accent) 15%, transparent);
          border-radius: 8px;
          font-family: monospace;
          flex-grow: 1;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          min-height: 180px;
        }
        .console-header {
          background: #181005;
          padding: 8px 12px;
          display: flex;
          align-items: center;
          gap: 6px;
          border-bottom: 1px solid color-mix(in srgb, var(--accent) 10%, transparent);
        }
        .console-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }
        .red { background: #ff5f56; }
        .yellow { background: #ffbd2e; }
        .green { background: #27c93f; }
        .console-title {
          font-size: 0.72rem;
          color: var(--muted);
          margin-left: 8px;
        }
        .console-body {
          padding: 12px;
          font-size: 0.8rem;
          overflow-y: auto;
          flex-grow: 1;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .empty-logs {
          color: #5c442c;
          font-style: italic;
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100%;
        }
        .console-line {
          word-break: break-all;
          line-height: 1.4;
        }
        .console-time {
          color: #5c442c;
          margin-right: 6px;
        }
        .info { color: var(--muted); }
        .success { color: #a3e635; }
        .warn { color: #facc15; }
        .error { color: #f87171; }
        .mt-16 { margin-top: 16px; }
        .attestation-badge {
          margin-top: 16px;
          background: color-mix(in srgb, #a3e635 8%, transparent);
          border: 1px solid color-mix(in srgb, #a3e635 30%, transparent);
          border-radius: 8px;
          padding: 12px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .badge-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 0.85rem;
        }
        .badge-label {
          color: var(--muted);
        }
        .badge-val {
          color: #a3e635;
          font-weight: 700;
        }
        .badge-tx {
          color: var(--text);
          font-size: 0.78rem;
        }
        .status-banner {
          margin-top: 16px;
          border-radius: 8px;
          padding: 12px;
          font-size: 0.85rem;
        }
        .status-banner p {
          margin: 4px 0 0;
          font-size: 0.8rem;
        }
        .success-banner {
          background: color-mix(in srgb, #a3e635 8%, transparent);
          border: 1px solid color-mix(in srgb, #a3e635 30%, transparent);
          color: #a3e635;
        }
        .error-banner {
          background: color-mix(in srgb, #f87171 8%, transparent);
          border: 1px solid color-mix(in srgb, #f87171 30%, transparent);
          color: #f87171;
        }
      `}</style>
    </section>
  );
}

// Contribution check by karen-s at 2025-01-09T02:37:14

// Contribution check by alexdev99 at 2025-04-15T08:08:16

// Contribution check by lisap at 2025-07-20T13:39:18

// Contribution check by karen-s at 2025-10-24T19:10:20

// Contribution check by alexdev99 at 2026-01-29T00:41:22

// Contribution check by lisap at 2026-05-05T06:12:24

// Contribution by WIAG1949 — 2025-01-20

// Contribution by Williams-1604 — 2025-06-21

// Contribution by CelestinaBeing — 2025-11-20

// Contribution by WIAG1949 — 2026-04-22
