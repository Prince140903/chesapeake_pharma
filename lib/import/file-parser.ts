/**
 * File parsing utilities for CSV and XLSX files.
 * Handles dynamic header detection, validation, and row parsing.
 */

import * as fs from "fs";
import * as path from "path";

export interface ParsedFile {
  headers: string[];
  rows: Record<string, any>[];
  totalRows: number;
  fileName: string;
  fileType: "csv" | "xlsx";
  debugInfo?: string;
}

export interface ParseError {
  row: number;
  column: string;
  value: any;
  reason: string;
}

/**
 * Parse CSV file content
 */
function parseCSV(content: string): { headers: string[]; rows: Record<string, any>[]; debugInfo: string } {
  const lines = content.split("\n").filter((line) => line.trim());

  if (lines.length === 0) {
    throw new Error("CSV file is empty");
  }

  // Parse headers - handle quoted headers
  const headerLine = lines[0];
  const headers = parseCSVLine(headerLine).map((h) => h.trim());

  if (headers.length === 0) {
    throw new Error("CSV file contains no headers");
  }

  // Check for duplicate headers
  const headerSet = new Set<string>();
  for (const header of headers) {
    if (headerSet.has(header)) {
      throw new Error(`Duplicate header detected: "${header}"`);
    }
    headerSet.add(header);
  }

  // Parse data rows
  const rows: Record<string, any>[] = [];
  const emptyRows: number[] = [];
  const partialRows: number[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) {
      emptyRows.push(i);
      continue; // Skip blank lines
    }

    const values = parseCSVLine(line);

    // Pad or trim values to match header count
    while (values.length < headers.length) {
      values.push("");
    }
    values.length = headers.length;

    const row: Record<string, any> = {};
    let hasAnyValue = false;
    let emptyFieldCount = 0;

    headers.forEach((header, index) => {
      const trimmedValue = values[index]?.trim() || "";
      row[header] = trimmedValue;
      if (trimmedValue) {
        hasAnyValue = true;
      } else {
        emptyFieldCount++;
      }
    });

    // Track rows with many empty fields (potential issues)
    if (hasAnyValue && emptyFieldCount > headers.length * 0.5) {
      partialRows.push(i);
    }

    // Only add row if it has at least one non-empty value
    if (hasAnyValue) {
      rows.push(row);
    }
  }

  const debugInfo = `Parsed: ${lines.length - 1} data lines. Valid rows: ${rows.length}. Empty lines: ${emptyRows.length}. Partial rows (>50% empty): ${partialRows.length}`;

  return { headers, rows, debugInfo };
}

/**
 * Helper to parse CSV line respecting quoted strings
 */
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // Escaped quote
        current += '"';
        i++; // Skip next quote
      } else {
        // Toggle quote mode
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      // Field separator
      result.push(current);
      current = "";
    } else {
      current += char;
    }
  }

  result.push(current);
  return result;
}

/**
 * Parse XLSX file using a simple library approach
 * For production, use 'xlsx' or 'exceljs' package
 */
async function parseXLSX(buffer: Buffer): Promise<{ headers: string[]; rows: Record<string, any>[] }> {
  // Placeholder: In production environment with xlsx package installed,
  // use: const XLSX = require('xlsx');
  // For now, we'll create a helper that can be expanded

  // For the MVP, return error indicating XLSX support requires external library
  // In actual implementation with 'xlsx' package:
  // const XLSX = require('xlsx');
  // const workbook = XLSX.read(buffer, { type: 'buffer' });
  // const worksheet = workbook.Sheets[workbook.SheetNames[0]];
  // const data = XLSX.utils.sheet_to_json(worksheet);

  throw new Error(
    "XLSX parsing requires 'xlsx' package. Please install: npm install xlsx. " +
    "For now, please convert XLSX to CSV and upload the CSV file."
  );
}

/**
 * Parse uploaded file (CSV or XLSX)
 */
export async function parseUploadedFile(
  fileBuffer: Buffer,
  fileName: string
): Promise<ParsedFile> {
  const ext = path.extname(fileName).toLowerCase();

  let headers: string[] = [];
  let rows: Record<string, any>[] = [];
  let fileType: "csv" | "xlsx";
  let debugInfo: string = "";

  if (ext === ".csv") {
    fileType = "csv";
    const content = fileBuffer.toString("utf-8");
    const parsed = parseCSV(content);
    headers = parsed.headers;
    rows = parsed.rows;
    debugInfo = parsed.debugInfo;
  } else if (ext === ".xlsx" || ext === ".xls") {
    fileType = "xlsx";
    // XLSX parsing would go here
    const parsed = await parseXLSX(fileBuffer);
    headers = parsed.headers;
    rows = parsed.rows;
  } else {
    throw new Error(`Unsupported file type: ${ext}. Only CSV and XLSX are supported.`);
  }

  return {
    headers,
    rows,
    totalRows: rows.length,
    fileName,
    fileType,
    debugInfo
  };
}

/**
 * Normalize header names for matching with database columns
 */
export function normalizeHeaderName(header: string): string {
  return header
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

/**
 * Check if two header names likely refer to the same column
 */
export function headerMatch(headerName: string, columnName: string, aliases: string[] = []): boolean {
  const normalized = normalizeHeaderName(headerName);
  const normalizedColumn = normalizeHeaderName(columnName);

  if (normalized === normalizedColumn) return true;

  // Check aliases
  for (const alias of aliases) {
    if (normalizeHeaderName(alias) === normalized) return true;
  }

  return false;
}

/**
 * Suggest column mappings for uploaded headers
 */
export function suggestColumnMappings(
  uploadedHeaders: string[],
  supportedColumns: Record<string, { aliases?: string[]; required: boolean }>
): Record<string, string | null> {
  const suggestions: Record<string, string | null> = {};

  for (const header of uploadedHeaders) {
    let bestMatch: string | null = null;

    for (const [columnName, config] of Object.entries(supportedColumns)) {
      if (headerMatch(header, columnName, config.aliases)) {
        bestMatch = columnName;
        break;
      }
    }

    suggestions[header] = bestMatch;
  }

  return suggestions;
}

/**
 * Validate that required columns are mapped
 */
export function validateRequiredMappings(
  mappings: Record<string, string | null>,
  supportedColumns: Record<string, { aliases?: string[]; required: boolean }>
): { valid: boolean; missingRequired: string[] } {
  const missingRequired: string[] = [];

  for (const [columnName, config] of Object.entries(supportedColumns)) {
    if (!config.required) continue;

    // Check if this column is mapped to any uploaded header
    const isMapped = Object.values(mappings).includes(columnName);
    if (!isMapped) {
      missingRequired.push(columnName);
    }
  }

  return {
    valid: missingRequired.length === 0,
    missingRequired
  };
}
