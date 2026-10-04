/**
 * Minimal CSV export for console tables (admin parcels/users, payment
 * history). Pure functions; the download helper is the only DOM touchpoint.
 */

export interface CsvColumn {
  header: string;
  /** Reads a cell from the row; values are stringified + quoted as needed. */
  value: (row: Record<string, unknown>) => unknown;
}

function escapeCell(raw: unknown): string {
  const text = raw === null || raw === undefined ? "" : String(raw);
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export function toCsv(columns: CsvColumn[], rows: Record<string, unknown>[]): string {
  const head = columns.map((c) => escapeCell(c.header)).join(",");
  const body = rows.map((row) => columns.map((c) => escapeCell(c.value(row))).join(","));
  return [head, ...body].join("\n");
}

export function downloadCsv(filename: string, csv: string): void {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename.endsWith(".csv") ? filename : `${filename}.csv`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export default toCsv;
