/**
 * Client-side CSV parsing and per-row validation for bulk invoice upload
 * (issue #28). Pure, dependency-free functions so they can be unit-tested and
 * reused by the batch uploader UI.
 */

export const INVOICE_COLUMNS = [
  "invoice_number",
  "debtor_name",
  "amount",
  "currency",
  "issue_date",
  "due_date",
] as const;

export type InvoiceColumn = (typeof INVOICE_COLUMNS)[number];

export const SUPPORTED_CURRENCIES = ["USDC", "USD", "EUR", "NGN", "XLM"] as const;

export type ParsedRow = {
  /** 1-based row number in the source file (excludes the header). */
  line: number;
  values: Record<InvoiceColumn, string>;
};

export type RowError = { column: InvoiceColumn | "row"; reason: string };

export type ValidatedRow = ParsedRow & { errors: RowError[] };

/** The header row the template ships with, in canonical order. */
export function templateHeader(): string {
  return INVOICE_COLUMNS.join(",");
}

/** A downloadable CSV template with the header and one example row. */
export function csvTemplate(): string {
  const example = [
    "INV-1001",
    "Acme Trading Ltd",
    "12500.00",
    "USDC",
    "2026-01-05",
    "2026-02-04",
  ].join(",");
  return `${templateHeader()}\n${example}\n`;
}

/** Split a single CSV line, honouring double-quoted fields and escaped quotes. */
function splitCsvLine(line: string): string[] {
  const out: string[] = [];
  let field = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        if (line[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ",") {
      out.push(field);
      field = "";
    } else {
      field += ch;
    }
  }
  out.push(field);
  return out.map((value) => value.trim());
}

export type ParseResult =
  | { ok: true; rows: ParsedRow[] }
  | { ok: false; error: string };

/** Parse raw CSV text into typed rows, validating the header shape. */
export function parseInvoiceCsv(text: string): ParseResult {
  const lines = text
    .split(/\r\n|\n|\r/)
    .filter((line) => line.trim().length > 0);

  if (lines.length === 0) {
    return { ok: false, error: "The file is empty." };
  }

  const header = splitCsvLine(lines[0]).map((h) => h.toLowerCase());
  const expected = INVOICE_COLUMNS;
  const headerMatches =
    header.length === expected.length && expected.every((col, i) => header[i] === col);
  if (!headerMatches) {
    return {
      ok: false,
      error: `Unexpected header. Expected: ${expected.join(", ")}`,
    };
  }

  const rows: ParsedRow[] = lines.slice(1).map((line, index) => {
    const cells = splitCsvLine(line);
    const values = {} as Record<InvoiceColumn, string>;
    expected.forEach((col, i) => {
      values[col] = cells[i] ?? "";
    });
    return { line: index + 1, values };
  });

  return { ok: true, rows };
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

function isValidIsoDate(value: string): boolean {
  if (!ISO_DATE.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && value === date.toISOString().slice(0, 10);
}

/** Validate one parsed row, returning a list of per-field errors. */
export function validateRow(row: ParsedRow): RowError[] {
  const errors: RowError[] = [];
  const v = row.values;

  if (!v.invoice_number) {
    errors.push({ column: "invoice_number", reason: "Invoice number is required" });
  }
  if (!v.debtor_name) {
    errors.push({ column: "debtor_name", reason: "Debtor name is required" });
  }

  const amount = Number(v.amount);
  if (!v.amount) {
    errors.push({ column: "amount", reason: "Amount is required" });
  } else if (!Number.isFinite(amount) || amount <= 0) {
    errors.push({ column: "amount", reason: "Amount must be a positive number" });
  }

  if (!SUPPORTED_CURRENCIES.includes(v.currency as (typeof SUPPORTED_CURRENCIES)[number])) {
    errors.push({
      column: "currency",
      reason: `Currency must be one of ${SUPPORTED_CURRENCIES.join(", ")}`,
    });
  }

  if (!isValidIsoDate(v.issue_date)) {
    errors.push({ column: "issue_date", reason: "Issue date must be YYYY-MM-DD" });
  }
  if (!isValidIsoDate(v.due_date)) {
    errors.push({ column: "due_date", reason: "Due date must be YYYY-MM-DD" });
  }

  if (isValidIsoDate(v.issue_date) && isValidIsoDate(v.due_date) && v.due_date < v.issue_date) {
    errors.push({ column: "due_date", reason: "Due date cannot be before the issue date" });
  }

  return errors;
}

/** Validate every row; the caller reports the split of valid vs invalid. */
export function validateRows(rows: ParsedRow[]): ValidatedRow[] {
  return rows.map((row) => ({ ...row, errors: validateRow(row) }));
}
