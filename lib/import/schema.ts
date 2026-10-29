/**
 * Drug import schema definitions for DB1 and DB2 datasets.
 * Defines supported columns, validation rules, and field aliases for each dataset.
 */

export type DatasetType = "DB1" | "DB2";

export interface ColumnDefinition {
  name: string;
  type: "string" | "number" | "date" | "boolean";
  required: boolean;
  aliases: string[];
  validator?: (value: any) => { valid: boolean; error?: string };
  transformer?: (value: any) => any;
  description: string;
}

export interface DatasetSchema {
  dataset_type: DatasetType;
  columns: Record<string, ColumnDefinition>;
  description: string;
}

/**
 * Common column validators
 */
const validators = {
  isValidNumber: (value: any) => {
    const num = Number(value);
    return { valid: !isNaN(num), error: `Expected a number, got: ${value}` };
  },
  isValidDate: (value: any) => {
    if (!value) return { valid: true }; // Optional dates can be empty
    const date = new Date(value);
    return {
      valid: !isNaN(date.getTime()),
      error: `Expected a valid date (YYYY-MM-DD), got: ${value}`
    };
  },
  isValidPhase: (value: any) => {
    // Phase is a text field - accept any non-empty string
    // Examples: "I SC", "II IV", "Phase 1", "Approved", "I/II SC", etc.
    return {
      valid: !!value && String(value).trim().length > 0,
      error: `Phase cannot be empty`
    };
  },
  isValidRoute: (value: any) => {
    // Route is also a text field - accept any non-empty string
    // Examples: "Subcutaneous", "IV", "Injectable", etc.
    return {
      valid: !!value && String(value).trim().length > 0,
      error: `Route cannot be empty`
    };
  }
};

const transformers = {
  parseNumber: (value: any) => {
    if (!value) return null;
    const num = Number(value);
    return isNaN(num) ? null : num;
  },
  parseDate: (value: any) => {
    if (!value) return null;
    const date = new Date(value);
    return isNaN(date.getTime()) ? null : date.toISOString().split("T")[0];
  },
  parseReferences: (value: any): Array<{ source: string; title: string }> | null => {
    if (!value) return null;
    
    const refString = String(value).trim();
    if (!refString) return null;
    
    // Parse semicolon-separated references
    // Format: "Title 1; Title 2; Title 3"
    const references = refString
      .split(";")
      .map((ref) => ref.trim())
      .filter((ref) => ref.length > 0)
      .map((title) => ({
        source: "import",
        title: title
      }));
    
    return references.length > 0 ? references : null;
  }
};

/**
 * DB1 Schema: Subcutaneous high-volume database
 * Focus: subcutaneous delivery, high-volume formulations, on-body systems
 */
export const DB1_SCHEMA: DatasetSchema = {
  dataset_type: "DB1",
  description:
    "Subcutaneous high-volume database. Includes formulation, volume, and device information.",
  columns: {
    drug_name: {
      name: "drug_name",
      type: "string",
      required: true,
      aliases: ["drug", "product", "drug / product", "drug name", "product name", "compound name"],
      description: "Name of the drug / biologic / compound"
    },
    company: {
      name: "company",
      type: "string",
      required: true,
      aliases: ["sponsor", "sponsor / company", "company name", "manufacturer", "developer"],
      description: "Sponsoring company / manufacturer"
    },
    partner: {
      name: "partner",
      type: "string",
      required: false,
      aliases: ["partner company", "development partner", "co-developer"],
      description: "Development or co-development partner"
    },
    route: {
      name: "route",
      type: "string",
      required: true,
      aliases: ["administration route", "delivery route", "administration"],
      validator: validators.isValidRoute,
      description: "Route of administration (Subcutaneous, IV, etc.)"
    },
    iv_shift_nce: {
      name: "iv_shift_nce",
      type: "string",
      required: false,
      aliases: [
        "iv shift",
        "nce",
        "shift strategy",
        "iv to sc shift",
        "nce subcutaneous",
        "primary injectable"
      ],
      description:
        "IV to SC Shift, NCE Subcutaneous, Primary Injectable, or N/A"
    },
    type: {
      name: "type",
      type: "string",
      required: false,
      aliases: ["drug type", "molecule type", "therapeutic class"],
      description: "Drug type (Monoclonal Antibody, Peptide, etc.)"
    },
    device_formulation: {
      name: "device_formulation",
      type: "string",
      required: false,
      aliases: [
        "device",
        "formulation",
        "delivery technology",
        "delivery device",
        "device type"
      ],
      description: "Device or formulation technology (Autoinjector, On-body system, etc.)"
    },
    dose: {
      name: "dose",
      type: "string",
      required: false,
      aliases: ["dose strength", "dosage", "dose amount"],
      description: "Dose strength or amount per administration"
    },
    iv_dose_mg: {
      name: "iv_dose_mg",
      type: "number",
      required: false,
      aliases: ["iv dose", "intravenous dose", "iv dose (mg)"],
      validator: validators.isValidNumber,
      transformer: transformers.parseNumber,
      description: "IV dose in mg (if applicable)"
    },
    sc_dose_mg: {
      name: "sc_dose_mg",
      type: "number",
      required: false,
      aliases: ["sc dose", "subcutaneous dose", "sc dose (mg)"],
      validator: validators.isValidNumber,
      transformer: transformers.parseNumber,
      description: "SC dose in mg"
    },
    est_sc_volume_ml: {
      name: "est_sc_volume_ml",
      type: "number",
      required: false,
      aliases: [
        "sc volume",
        "estimated sc volume",
        "volume (ml)",
        "est sc volume",
        "injection volume"
      ],
      validator: validators.isValidNumber,
      transformer: transformers.parseNumber,
      description: "Estimated subcutaneous injection volume in mL"
    },
    frequency: {
      name: "frequency",
      type: "string",
      required: false,
      aliases: ["administration frequency", "dosing frequency", "dosing schedule"],
      description: "Administration frequency (Weekly, Every 2 weeks, etc.)"
    },
    phase: {
      name: "phase",
      type: "string",
      required: true,
      aliases: ["development phase", "clinical phase", "stage"],
      validator: validators.isValidPhase,
      description: "Development phase (Phase 1, Phase 2, Approved, etc.)"
    },
    pharmacology: {
      name: "pharmacology",
      type: "string",
      required: false,
      aliases: [
        "mechanism of action",
        "moa",
        "pharmacology",
        "target",
        "mechanism"
      ],
      description: "Pharmacology / mechanism of action"
    },
    indication: {
      name: "indication",
      type: "string",
      required: true,
      aliases: ["therapeutic indication", "indication", "disease", "indication area"],
      description: "Primary therapeutic indication"
    },
    field: {
      name: "field",
      type: "string",
      required: false,
      aliases: ["therapy area", "therapeutic area", "disease area"],
      description: "Therapeutic field (Oncology, Immunology, etc.)"
    },
    entry_date: {
      name: "entry_date",
      type: "date",
      required: false,
      aliases: ["entry date", "date added", "added date"],
      validator: validators.isValidDate,
      transformer: transformers.parseDate,
      description: "Date record was entered (YYYY-MM-DD)"
    },
    references: {
      name: "references",
      type: "string",
      required: false,
      aliases: ["ref", "reference", "references", "citations", "sources"],
      transformer: transformers.parseReferences,
      description: "References/citations (semicolon-separated list of titles)"
    }
  }
};

/**
 * DB2 Schema: Broad injectable database
 * Focus: all injectable modalities, GLP-1s, vaccines, biosimilars
 */
export const DB2_SCHEMA: DatasetSchema = {
  dataset_type: "DB2",
  description: "Broad injectable database. Includes diverse injectable modalities and delivery platforms.",
  columns: {
    drug_name: {
      name: "drug_name",
      type: "string",
      required: true,
      aliases: ["drug", "product", "drug / product", "drug name", "product name", "compound name"],
      description: "Name of the drug / biologic / compound"
    },
    company: {
      name: "company",
      type: "string",
      required: true,
      aliases: ["sponsor", "sponsor / company", "company name", "manufacturer", "developer"],
      description: "Sponsoring company / manufacturer"
    },
    partner: {
      name: "partner",
      type: "string",
      required: false,
      aliases: ["partner company", "development partner", "co-developer"],
      description: "Development or co-development partner"
    },
    route: {
      name: "route",
      type: "string",
      required: true,
      aliases: ["administration route", "delivery route", "administration"],
      validator: validators.isValidRoute,
      description: "Route of administration"
    },
    type: {
      name: "type",
      type: "string",
      required: false,
      aliases: ["drug type", "molecule type", "therapeutic class"],
      description: "Drug type (Monoclonal Antibody, Peptide, GLP-1 agonist, etc.)"
    },
    device_formulation: {
      name: "device_formulation",
      type: "string",
      required: false,
      aliases: [
        "device",
        "formulation",
        "delivery technology",
        "delivery device",
        "device type"
      ],
      description: "Device or formulation technology"
    },
    dose: {
      name: "dose",
      type: "string",
      required: false,
      aliases: ["dose strength", "dosage", "dose amount"],
      description: "Dose strength or amount per administration"
    },
    frequency: {
      name: "frequency",
      type: "string",
      required: false,
      aliases: ["administration frequency", "dosing frequency", "dosing schedule"],
      description: "Administration frequency"
    },
    phase: {
      name: "phase",
      type: "string",
      required: true,
      aliases: ["development phase", "clinical phase", "stage"],
      validator: validators.isValidPhase,
      description: "Development phase"
    },
    pharmacology: {
      name: "pharmacology",
      type: "string",
      required: false,
      aliases: [
        "mechanism of action",
        "moa",
        "pharmacology",
        "target",
        "mechanism"
      ],
      description: "Pharmacology / mechanism of action"
    },
    indication: {
      name: "indication",
      type: "string",
      required: true,
      aliases: ["therapeutic indication", "indication", "disease", "indication area"],
      description: "Primary therapeutic indication"
    },
    field: {
      name: "field",
      type: "string",
      required: false,
      aliases: ["therapy area", "therapeutic area", "disease area"],
      description: "Therapeutic field"
    },
    entry_date: {
      name: "entry_date",
      type: "date",
      required: false,
      aliases: ["entry date", "date added", "added date"],
      validator: validators.isValidDate,
      transformer: transformers.parseDate,
      description: "Date record was entered (YYYY-MM-DD)"
    },
    references: {
      name: "references",
      type: "string",
      required: false,
      aliases: ["ref", "reference", "references", "citations", "sources"],
      transformer: transformers.parseReferences,
      description: "References/citations (semicolon-separated list of titles)"
    }
  }
};

/**
 * Get schema for a specific dataset
 */
export function getSchemaForDataset(datasetType: DatasetType): DatasetSchema {
  return datasetType === "DB1" ? DB1_SCHEMA : DB2_SCHEMA;
}

/**
 * Get all column definitions for a dataset
 */
export function getDatasetColumns(
  datasetType: DatasetType
): Record<string, ColumnDefinition> {
  return getSchemaForDataset(datasetType).columns;
}

/**
 * Check if a column is required for a dataset
 */
export function isColumnRequired(datasetType: DatasetType, columnName: string): boolean {
  const columns = getDatasetColumns(datasetType);
  return columns[columnName]?.required ?? false;
}
