/**
 * Data validation utilities for drug import
 * Handles row validation, duplicate detection, and field-level validation
 */

import { DatasetType, getDatasetColumns, isColumnRequired } from "./schema";

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  rowNumber: number;
  field: string;
  value: any;
  message: string;
  severity: "critical" | "warning";
}

export interface ValidationWarning {
  rowNumber: number;
  field: string;
  value: any;
  message: string;
}

export interface RowValidationResult extends ValidationResult {
  rowNumber: number;
  transformedRow?: Record<string, any>;
}

/**
 * Validate a single row against the schema
 */
export function validateRow(
  row: Record<string, any>,
  rowNumber: number,
  datasetType: DatasetType,
  mappings: Record<string, string | null>
): RowValidationResult {
  const columns = getDatasetColumns(datasetType);
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];
  const transformedRow: Record<string, any> = {
    dataset_type: datasetType
  };

  // Build reverse mapping: uploadedHeader -> dbColumn
  const uploadedHeaderToColumn: Record<string, string | null> = {};
  for (const [uploadedHeader, dbColumn] of Object.entries(mappings)) {
    uploadedHeaderToColumn[uploadedHeader] = dbColumn;
  }

  // Track which database columns received values
  const filledColumns = new Set<string>();
  let referencesArray: Array<{ source: string; title: string }> | null = null;

  // Process each uploaded header
  for (const [uploadedHeader, dbColumnName] of Object.entries(uploadedHeaderToColumn)) {
    if (!dbColumnName) {
      // This header is not mapped - skip it
      continue;
    }

    const value = row[uploadedHeader];
    const columnDef = columns[dbColumnName];

    if (!columnDef) {
      // Database column doesn't exist in schema
      errors.push({
        rowNumber,
        field: uploadedHeader,
        value,
        message: `Unknown database column: ${dbColumnName}`,
        severity: "critical"
      });
      continue;
    }

    // Check for empty required fields
    if (columnDef.required && (!value || String(value).trim() === "")) {
      // For rows where the main identifier fields (drug_name, company) are present,
      // but some required routing/phase fields are empty, we skip this row gracefully
      // instead of blocking the entire import
      const hasMainIdentifiers = 
        transformedRow.drug_name && 
        transformedRow.company;
      
      if (hasMainIdentifiers && ["route", "phase"].includes(dbColumnName)) {
        // Mark row as invalid due to incomplete data, but add to warnings not errors
        return {
          rowNumber,
          valid: false,
          errors: [],
          warnings: [
            {
              rowNumber,
              field: "row",
              value: null,
              message: `Incomplete row - missing "${dbColumnName}". Row will be skipped (has drug_name="${transformedRow.drug_name}", company="${transformedRow.company}")`
            }
          ],
          transformedRow: undefined
        };
      }

      // For other required fields, this is a critical error
      const mappedFromHeader = Object.entries(mappings).find(
        ([_, col]) => col === dbColumnName
      )?.[0];
      
      errors.push({
        rowNumber,
        field: dbColumnName,
        value,
        message: `Required field "${dbColumnName}" is empty (mapped from: "${mappedFromHeader || "unknown"}")`,
        severity: "critical"
      });
      continue;
    }

    // Skip empty optional fields
    if (!value || String(value).trim() === "") {
      transformedRow[dbColumnName] = null;
      continue;
    }

    // Special handling for references field
    if (dbColumnName === "references") {
      // Run transformer to parse references
      if (columnDef.transformer) {
        try {
          const transformed = columnDef.transformer(value);
          if (transformed && Array.isArray(transformed)) {
            referencesArray = transformed;
            // Don't store references in transformedRow, we'll handle separately
            continue;
          }
        } catch (err) {
          errors.push({
            rowNumber,
            field: dbColumnName,
            value,
            message: `Failed to parse references: ${String(err)}`,
            severity: "critical"
          });
          continue;
        }
      }
      continue; // Skip references from main row
    }

    // Run validator if defined
    if (columnDef.validator) {
      const validationResult = columnDef.validator(value);
      if (!validationResult.valid) {
        // For optional numeric fields with invalid values, skip them instead of erroring
        if (!columnDef.required && columnDef.type === "number") {
          transformedRow[dbColumnName] = null;
          continue;
        }
        
        errors.push({
          rowNumber,
          field: dbColumnName,
          value,
          message: validationResult.error || `Invalid value for ${dbColumnName}`,
          severity: "critical"
        });
        continue;
      }
    }

    // Transform value if transformer is defined
    let transformedValue = value;
    if (columnDef.transformer) {
      try {
        transformedValue = columnDef.transformer(value);
      } catch (err) {
        errors.push({
          rowNumber,
          field: dbColumnName,
          value,
          message: `Failed to transform value: ${String(err)}`,
          severity: "critical"
        });
        continue;
      }
    }

    transformedRow[dbColumnName] = transformedValue;
    filledColumns.add(dbColumnName);
  }

  // Check for required columns that were never mapped
  for (const [columnName, columnDef] of Object.entries(columns)) {
    if (
      columnDef.required &&
      !filledColumns.has(columnName) &&
      !transformedRow[columnName]
    ) {
      errors.push({
        rowNumber,
        field: columnName,
        value: undefined,
        message: `Required field "${columnName}" not provided in any mapped column`,
        severity: "critical"
      });
    }
  }

  // Set system fields
  transformedRow.entry_date = transformedRow.entry_date || new Date().toISOString().split("T")[0];
  transformedRow.created_at = new Date().toISOString();
  transformedRow.updated_at = new Date().toISOString();

  // Attach references if they exist
  if (referencesArray && referencesArray.length > 0) {
    transformedRow.references = referencesArray;
  }

  return {
    rowNumber,
    valid: errors.length === 0,
    errors,
    warnings,
    transformedRow: errors.length === 0 ? transformedRow : undefined
  };
}

/**
 * Validate all rows in a batch
 */
export function validateRows(
  rows: Record<string, any>[],
  datasetType: DatasetType,
  mappings: Record<string, string | null>
): {
  validRows: Record<string, any>[];
  invalidRows: RowValidationResult[];
  totalValid: number;
  totalInvalid: number;
} {
  const validRows: Record<string, any>[] = [];
  const invalidRows: RowValidationResult[] = [];

  for (let i = 0; i < rows.length; i++) {
    const result = validateRow(rows[i], i + 1, datasetType, mappings); // +1 because row 1 is headers
    
    // Valid rows pass validation
    if (result.valid && result.transformedRow) {
      validRows.push(result.transformedRow);
    } 
    // Rows with only warnings (no errors) are skipped silently
    else if (!result.valid && result.errors.length === 0 && result.warnings.length > 0) {
      // Skip silently - these are malformed rows we're gracefully handling
      continue;
    }
    // Rows with actual errors are reported as invalid
    else if (result.errors.length > 0) {
      invalidRows.push(result);
    }
  }

  return {
    validRows,
    invalidRows,
    totalValid: validRows.length,
    totalInvalid: invalidRows.length
  };
}

/**
 * Detect potential duplicates within a batch
 */
export function detectDuplicates(
  rows: Record<string, any>[],
  matchKey: "drug_name_company" | "compound_id" = "drug_name_company"
): {
  duplicates: Array<{
    indices: number[];
    key: string;
    firstRow: Record<string, any>;
  }>;
  warnings: string[];
} {
  const duplicates: Array<{
    indices: number[];
    key: string;
    firstRow: Record<string, any>;
  }> = [];
  const warnings: string[] = [];

  if (matchKey === "drug_name_company") {
    const keyMap = new Map<string, number[]>();

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const drugName = String(row.drug_name || "").trim().toLowerCase();
      const company = String(row.company || "").trim().toLowerCase();
      const key = `${drugName}|${company}`;

      if (!drugName || !company) {
        warnings.push(`Row ${i + 1}: Missing drug_name or company for duplicate detection`);
        continue;
      }

      if (!keyMap.has(key)) {
        keyMap.set(key, []);
      }
      keyMap.get(key)!.push(i);
    }

    // Find duplicates (more than one occurrence)
    const entries = Array.from(keyMap.entries());
    for (const [key, indices] of entries) {
      if (indices.length > 1) {
        duplicates.push({
          indices,
          key,
          firstRow: rows[indices[0]]
        });
      }
    }
  }

  return { duplicates, warnings };
}

/**
 * Compare row with existing database record
 * Returns true if the rows appear to be the same drug
 */
export function isSameDrug(
  uploadedRow: Record<string, any>,
  existingRow: Record<string, any>,
  matchKey: "drug_name_company" | "compound_id" = "drug_name_company"
): boolean {
  if (matchKey === "drug_name_company") {
    const uploadedDrugName = String(uploadedRow.drug_name || "").trim().toLowerCase();
    const uploadedCompany = String(uploadedRow.company || "").trim().toLowerCase();
    const existingDrugName = String(existingRow.drug_name || "").trim().toLowerCase();
    const existingCompany = String(existingRow.company || "").trim().toLowerCase();

    return uploadedDrugName === existingDrugName && uploadedCompany === existingCompany;
  }

  // For compound_id, would need a compound_id field
  return false;
}

/**
 * Generate a summary of validation results
 */
export function generateValidationSummary(
  validRows: number,
  invalidRows: number,
  duplicates: number,
  warnings: number
): {
  summary: string;
  status: "success" | "warning" | "error";
} {
  const total = validRows + invalidRows;

  if (invalidRows === total) {
    return {
      summary: `All ${total} rows contain errors and cannot be imported.`,
      status: "error"
    };
  }

  if (invalidRows > 0) {
    return {
      summary: `${validRows} valid rows, ${invalidRows} rows with errors. Duplicates detected: ${duplicates}. Proceed with caution.`,
      status: "warning"
    };
  }

  if (duplicates > 0) {
    return {
      summary: `${validRows} rows ready to import. ${duplicates} potential duplicates detected within the batch.`,
      status: "warning"
    };
  }

  return {
    summary: `${validRows} rows validated successfully and ready for import.`,
    status: "success"
  };
}
