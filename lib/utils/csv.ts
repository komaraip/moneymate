function escapeCsvCell(value: unknown) {
  const text = value === null || value === undefined ? "" : `${value}`;
  if (!/[",\n]/.test(text)) {
    return text;
  }

  return `"${text.replace(/"/g, "\"\"")}"`;
}

export function toCsv(rows: Array<Record<string, unknown>>) {
  if (rows.length === 0) {
    return "";
  }

  const headers = Object.keys(rows[0]);
  const headerRow = headers.map(escapeCsvCell).join(",");
  const dataRows = rows.map((row) => headers.map((header) => escapeCsvCell(row[header])).join(","));

  return [headerRow, ...dataRows].join("\n");
}
