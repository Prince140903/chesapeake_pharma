import { DrugRecord } from "@/lib/data";

/**
 * Escapes a CSV cell value following RFC 4180
 */
export function escapeCSVCell(value: unknown): string {
  if (value === null || value === undefined) {
    return '""';
  }
  const str = String(value);
  // If string contains quotes, commas, newlines, or carriage returns, wrap in quotes and escape quotes
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return `"${str}"`;
}

/**
 * Generates and triggers download of CSV from an array of DrugRecord
 */
export function downloadDrugsCSV(drugs: DrugRecord[], filename = "drugs_export.csv") {
  const headers = [
    "Drug Name",
    "Dataset",
    "Company / Sponsor",
    "Partner / Developer",
    "Route",
    "IV to SC Shift Strategy",
    "Molecule / Drug Type",
    "Device / Formulation",
    "Dose",
    "IV Dose (mg)",
    "SC Dose (mg)",
    "Est SC Volume (mL)",
    "Frequency (Dosing Interval)",
    "Phase",
    "Pharmacology / MOA",
    "Indication",
    "Therapy Area (Field)",
    "Entry Date",
    "References & Citations"
  ];

  const rows = drugs.map((d) => {
    // Format references into a readable delimited or semicolon-separated string
    const refString = (d.references || [])
      .map((r, i) => {
        const parts = [r.title];
        if (r.year) parts.push(`(${r.year})`);
        if (r.source && r.source !== "reference" && r.source !== "import") parts.push(`[${r.source}]`);
        if (r.url) parts.push(`<${r.url}>`);
        return `${i + 1}. ${parts.join(" ")}`;
      })
      .join(" ; ");

    return [
      escapeCSVCell(d.name),
      escapeCSVCell(d.dataset),
      escapeCSVCell(d.company),
      escapeCSVCell(d.partner === "Not specified" ? "" : d.partner),
      escapeCSVCell(d.route),
      escapeCSVCell(d.ivShiftNce || ""),
      escapeCSVCell(d.type === "Not specified" ? "" : d.type),
      escapeCSVCell(d.device === "Not specified" ? "" : d.device),
      escapeCSVCell(d.dose === "Not specified" ? "" : d.dose),
      escapeCSVCell(d.ivDoseMg || ""),
      escapeCSVCell(d.scDoseMg || ""),
      escapeCSVCell(d.volume || ""),
      escapeCSVCell(d.frequency === "Not specified" ? "" : d.frequency),
      escapeCSVCell(d.phase),
      escapeCSVCell(d.pharmacology === "Not specified" ? "" : d.pharmacology),
      escapeCSVCell(d.indication),
      escapeCSVCell(d.therapyArea === "Not specified" ? "" : d.therapyArea),
      escapeCSVCell(d.entryDate || ""),
      escapeCSVCell(refString)
    ].join(",");
  });

  const csvContent = "\uFEFF" + [headers.map(escapeCSVCell).join(","), ...rows].join("\r\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

