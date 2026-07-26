"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import {
  csvTemplate,
  INVOICE_COLUMNS,
  parseInvoiceCsv,
  validateRows,
  type ValidatedRow,
} from "@/lib/invoice-csv";

type Phase = "idle" | "reviewing" | "uploading" | "done";

type Summary = { success: number; failed: number };

export function BulkUpload() {
  const [fileName, setFileName] = useState<string | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [rows, setRows] = useState<ValidatedRow[]>([]);
  const [phase, setPhase] = useState<Phase>("idle");
  const [progress, setProgress] = useState(0);
  const [summary, setSummary] = useState<Summary | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const validRows = useMemo(() => rows.filter((r) => r.errors.length === 0), [rows]);
  const invalidRows = useMemo(() => rows.filter((r) => r.errors.length > 0), [rows]);

  const downloadTemplate = useCallback(() => {
    const blob = new Blob([csvTemplate()], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "invoicelift-template.csv";
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  const reset = useCallback(() => {
    setFileName(null);
    setParseError(null);
    setRows([]);
    setPhase("idle");
    setProgress(0);
    setSummary(null);
    if (inputRef.current) inputRef.current.value = "";
  }, []);

  const handleFile = useCallback(async (file: File) => {
    setFileName(file.name);
    setParseError(null);
    setSummary(null);
    setProgress(0);
    const text = await file.text();
    const result = parseInvoiceCsv(text);
    if (!result.ok) {
      setRows([]);
      setPhase("idle");
      setParseError(result.error);
      return;
    }
    setRows(validateRows(result.rows));
    setPhase("reviewing");
  }, []);

  const submit = useCallback(async () => {
    if (validRows.length === 0) return;
    setPhase("uploading");
    setProgress(0);
    // Simulate a batched submission so the progress indicator reflects real
    // per-row work; swap the delay for the real API call when the endpoint exists.
    for (let i = 0; i < validRows.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, 40));
      setProgress(Math.round(((i + 1) / validRows.length) * 100));
    }
    setSummary({ success: validRows.length, failed: invalidRows.length });
    setPhase("done");
  }, [validRows, invalidRows.length]);

  return (
    <div className="bulk">
      <div className="bulk-actions">
        <button type="button" className="cta-secondary" onClick={downloadTemplate}>
          Download CSV template
        </button>
        <label className="cta bulk-file-label">
          {fileName ? "Choose a different file" : "Select CSV file"}
          <input
            ref={inputRef}
            type="file"
            accept=".csv,text/csv"
            className="bulk-file-input"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void handleFile(file);
            }}
          />
        </label>
        {fileName ? (
          <button type="button" className="bulk-reset" onClick={reset}>
            Reset
          </button>
        ) : null}
      </div>

      {fileName ? <p className="bulk-filename">Loaded: {fileName}</p> : null}
      {parseError ? <p className="bulk-error-banner">{parseError}</p> : null}

      {rows.length > 0 ? (
        <>
          <div className="bulk-stats" role="status">
            <span className="bulk-chip bulk-chip-ok">{validRows.length} valid</span>
            <span className="bulk-chip bulk-chip-bad">{invalidRows.length} with errors</span>
            <span className="bulk-chip">{rows.length} total</span>
          </div>

          {invalidRows.length > 0 ? (
            <div className="bulk-table-wrap">
              <table className="bulk-table">
                <thead>
                  <tr>
                    <th>Row</th>
                    <th>Invoice</th>
                    <th>Field</th>
                    <th>Reason</th>
                  </tr>
                </thead>
                <tbody>
                  {invalidRows.flatMap((row) =>
                    row.errors.map((err, i) => (
                      <tr key={`${row.line}-${i}`}>
                        <td>{row.line}</td>
                        <td>{row.values.invoice_number || "—"}</td>
                        <td>
                          <code>{err.column}</code>
                        </td>
                        <td>{err.reason}</td>
                      </tr>
                    )),
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="bulk-all-good">All rows passed validation and are ready to submit.</p>
          )}

          {phase === "uploading" ? (
            <div className="bulk-progress" aria-label="Upload progress">
              <div className="bulk-progress-bar" style={{ width: `${progress}%` }} />
              <span className="bulk-progress-label">{progress}%</span>
            </div>
          ) : null}

          {phase !== "done" ? (
            <button
              type="button"
              className="cta bulk-submit"
              disabled={validRows.length === 0 || phase === "uploading"}
              onClick={() => void submit()}
            >
              {phase === "uploading"
                ? "Uploading…"
                : `Submit ${validRows.length} invoice${validRows.length === 1 ? "" : "s"}`}
            </button>
          ) : null}
        </>
      ) : null}

      {summary ? (
        <div className="bulk-summary" role="status">
          <h3>Batch complete</h3>
          <ul>
            <li>
              <strong>{summary.success}</strong> invoice{summary.success === 1 ? "" : "s"} submitted
            </li>
            <li>
              <strong>{summary.failed}</strong> skipped due to validation errors
            </li>
          </ul>
          <button type="button" className="cta-secondary" onClick={reset}>
            Upload another batch
          </button>
        </div>
      ) : null}

      <details className="bulk-help">
        <summary>Expected columns</summary>
        <p>
          <code>{INVOICE_COLUMNS.join(", ")}</code>
        </p>
      </details>
    </div>
  );
}
