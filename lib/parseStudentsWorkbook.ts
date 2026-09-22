import * as XLSX from "xlsx";

export type StudentRow = {
  row: number; // 1-based row number in the original file, for error messages
  fullName: string;
  groupLabel: string;
  studentCode: string;
};

export type ParsedStudentsWorkbook = {
  rows: StudentRow[];
  skipped: { row: number; reason: string }[];
};

/**
 * Reads an uploaded .xlsx/.xls/.csv file: column A = full name, column B =
 * group name, column C = student ID. Row 1 is always treated as a header
 * and skipped, matching the template admins are told to use.
 */
export function parseStudentsWorkbook(buffer: Buffer): ParsedStudentsWorkbook {
  const workbook = XLSX.read(buffer, { type: "buffer" });
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) return { rows: [], skipped: [] };

  const sheet = workbook.Sheets[sheetName];
  const raw: unknown[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, blankrows: false, defval: "" });

  const rows: StudentRow[] = [];
  const skipped: { row: number; reason: string }[] = [];

  for (let i = 1; i < raw.length; i++) {
    const rowNum = i + 1; // 1-based, matches what a person sees in Excel
    const cells = raw[i] ?? [];
    const fullName = String(cells[0] ?? "").trim();
    const groupLabel = String(cells[1] ?? "").trim();
    const studentCode = String(cells[2] ?? "").trim();

    if (!fullName && !groupLabel && !studentCode) continue; // fully blank row

    if (!fullName || !groupLabel || !studentCode) {
      skipped.push({ row: rowNum, reason: "Ism, guruh yoki ID ustunlaridan biri bo'sh" });
      continue;
    }

    rows.push({ row: rowNum, fullName, groupLabel, studentCode });
  }

  return { rows, skipped };
}
