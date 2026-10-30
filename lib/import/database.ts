/**
 * Database operations for drug import
 * Handles batch inserts, duplicate checking, and transaction management
 */

import { createAdminServiceClient } from "@/lib/supabase/service-role";
import { DatasetType } from "./schema";

export interface ImportResult {
  success: boolean;
  insertedCount: number;
  updatedCount: number;
  skippedCount: number;
  failedCount: number;
  errors: Array<{
    rowNumber?: number;
    message: string;
  }>;
}

/**
 * Check if drugs table exists and get its structure
 */
export async function checkDrugsTable(): Promise<{
  exists: boolean;
  columns?: string[];
  error?: string;
}> {
  const client = createAdminServiceClient();
  if (!client) {
    return { exists: false, error: "Service role client not configured" };
  }

  try {
    const { data, error } = await client
      .from("drugs")
      .select("*")
      .limit(1);

    if (error) {
      return { exists: false, error: error.message };
    }

    return { exists: true };
  } catch (err) {
    return { exists: false, error: String(err) };
  }
}

/**
 * Get existing drugs for a dataset to check for duplicates
 */
export async function getExistingDrugs(
  datasetType: DatasetType
): Promise<Array<{ id: string; drug_name: string; company: string }>> {
  const client = createAdminServiceClient();
  if (!client) {
    return [];
  }

  try {
    const { data, error } = await client
      .from("drugs")
      .select("id, drug_name, company")
      .eq("dataset_type", datasetType);

    if (error) {
      console.error("Error fetching existing drugs:", error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error("Error fetching existing drugs:", err);
    return [];
  }
}

/**
 * Insert drug references for a drug
 */
export async function insertDrugReferences(
  drugId: string,
  references: Array<{
    source: string;
    title: string;
    year?: string;
    url?: string;
  }>
): Promise<{ success: boolean; error?: string }> {
  if (!references || references.length === 0) {
    return { success: true }; // No references to insert
  }

  const client = createAdminServiceClient();
  if (!client) {
    return { success: false, error: "Service role client not configured" };
  }

  try {
    // Create reference records for each reference
    const referencesToInsert = references.map((ref, index) => ({
      drug_id: drugId,
      reference_value: Array.isArray(ref) ? ref.join(" - ") : (ref.title || String(ref)),
      reference_order: index + 1,
      created_at: new Date().toISOString()
    }));

    // Insert ALL references at once (not one at a time)
    const { error } = await client
      .from("drug_references")
      .insert(referencesToInsert);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    console.error("Error inserting drug references:", err);
    return { success: false, error: String(err) };
  }
}

/**
 * Find matching drug in existing records
 */
export function findMatchingDrug(
  uploadedRow: Record<string, any>,
  existingDrugs: Record<string, any>[],
  matchStrategy: "drug_name_company" | "compound_id" = "drug_name_company"
): Record<string, any> | null {
  if (matchStrategy === "drug_name_company") {
    const uploadedDrugName = String(uploadedRow.drug_name || "").trim().toLowerCase();
    const uploadedCompany = String(uploadedRow.company || "").trim().toLowerCase();

    return (
      existingDrugs.find((drug) => {
        const dbDrugName = String(drug.drug_name || "").trim().toLowerCase();
        const dbCompany = String(drug.company || "").trim().toLowerCase();
        return dbDrugName === uploadedDrugName && dbCompany === uploadedCompany;
      }) || null
    );
  }

  return null;
}

/**
 * Insert drugs in batches with their references
 */
export async function insertDrugsInBatches(
  rows: Array<Record<string, any> & { references?: Array<{ source: string; title: string; year?: string; url?: string }> }>,
  datasetType: DatasetType,
  batchSize: number = 50
): Promise<ImportResult> {
  const client = createAdminServiceClient();
  if (!client) {
    return {
      success: false,
      insertedCount: 0,
      updatedCount: 0,
      skippedCount: 0,
      failedCount: rows.length,
      errors: [{ message: "Service role client not configured" }]
    };
  }

  const result: ImportResult = {
    success: true,
    insertedCount: 0,
    updatedCount: 0,
    skippedCount: 0,
    failedCount: 0,
    errors: []
  };

  // Get existing drugs for duplicate checking
  const existingDrugs = await getExistingDrugs(datasetType);

  // Process in batches
  for (let i = 0; i < rows.length; i += batchSize) {
    const batch = rows.slice(i, i + batchSize);
    const processedBatch = [];
    const batchReferences: Array<{ drugData: Record<string, any>; references: Array<any> }> = [];

    for (const row of batch) {
      // Check for duplicate
      const existing = findMatchingDrug(row, existingDrugs, "drug_name_company");

      if (existing) {
        // Skip duplicates for now (insert_only mode)
        result.skippedCount++;
      } else {
        // Separate references from drug data
        const { references, ...drugData } = row;
        const rowWithDataset = {
          ...drugData,
          dataset_type: datasetType
        };
        processedBatch.push(rowWithDataset);
        
        // Store references to insert after getting the drug ID
        if (references && references.length > 0) {
          batchReferences.push({
            drugData: rowWithDataset,
            references: references
          });
        }
      }
    }

    if (processedBatch.length === 0) {
      continue;
    }

    try {
      const { data: insertedDrugs, error } = await client
        .from("drugs")
        .insert(processedBatch)
        .select("id, drug_name, company");

      if (error) {
        result.success = false;
        result.failedCount += processedBatch.length;
        result.errors.push({
          message: `Batch insertion failed: ${error.message}`
        });
      } else if (insertedDrugs) {
        result.insertedCount += insertedDrugs.length;

        // Insert references for each drug
        for (const refData of batchReferences) {
          const matchedDrug = insertedDrugs.find(
            (drug) =>
              drug.drug_name === refData.drugData.drug_name &&
              drug.company === refData.drugData.company
          );

          if (matchedDrug && refData.references.length > 0) {
            // Convert string references to objects if needed
            const refsToInsert = refData.references.map((ref: any, idx: number) => ({
              source: "import",
              title: typeof ref === 'string' ? ref : (ref.title || String(ref)),
              reference_order: idx + 1
            }));

            const refResult = await insertDrugReferences(
              matchedDrug.id,
              refsToInsert
            );

            if (!refResult.success) {
              console.warn(`Failed to insert references for drug ${matchedDrug.id}:`, refResult.error);
            }
          }
        }
      }
    } catch (err) {
      result.success = false;
      result.failedCount += processedBatch.length;
      result.errors.push({
        message: `Batch insertion error: ${String(err)}`
      });
    }
  }

  return result;
}

/**
 * Record import job in import_jobs table
 */
export async function recordImportJob(
  jobData: {
    dataset_type: DatasetType;
    file_name: string;
    file_format: string; // "csv" or "xlsx"
    file_size_bytes: number;
    uploaded_by_user_id: string;
    total_rows: number;
    inserted_count: number;
    updated_count: number;
    skipped_count: number;
    failed_count: number;
    status: "completed" | "failed" | "processing";
    matching_strategy: "drug_name_company" | "compound_id";
    error_log?: string;
  }
): Promise<{ success: boolean; jobId?: string; error?: string }> {
  const client = createAdminServiceClient();
  if (!client) {
    return { success: false, error: "Service role client not configured" };
  }

  try {
    // Build error summary from error log if provided
    const errorSummary = jobData.error_log
      ? {
          error_log: jobData.error_log,
          error_count: jobData.failed_count,
          timestamp: new Date().toISOString()
        }
      : null;

    const now = new Date().toISOString();

    const { data, error } = await client
      .from("import_jobs")
      .insert({
        uploaded_by: jobData.uploaded_by_user_id,
        dataset_type: jobData.dataset_type,
        file_name: jobData.file_name,
        file_format: jobData.file_format,
        import_mode: jobData.matching_strategy === "drug_name_company" ? "insert_only" : "match_by_id",
        status: jobData.status,
        total_rows: jobData.total_rows,
        inserted_rows: jobData.inserted_count,
        updated_rows: jobData.updated_count,
        skipped_rows: jobData.skipped_count,
        failed_rows: jobData.failed_count,
        error_summary: errorSummary,
        started_at: now,
        completed_at: jobData.status === "completed" || jobData.status === "failed" ? now : null,
        created_at: now
      })
      .select("id")
      .single();

    if (error) {
      // If import_jobs table doesn't exist or has schema issues, still return success
      // to not fail the import process - the history will just not be recorded
      return { success: true };
    }

    return { success: true, jobId: data?.id };
  } catch (err) {
    return { success: true }; // Don't fail the import if recording fails
  }
}

/**
 * Test database connection and permissions
 */
export async function testDatabaseConnection(): Promise<{
  connected: boolean;
  canRead: boolean;
  canWrite: boolean;
  error?: string;
}> {
  const client = createAdminServiceClient();
  if (!client) {
    return {
      connected: false,
      canRead: false,
      canWrite: false,
      error: "Service role client not configured"
    };
  }

  let canRead = false;
  let canWrite = false;

  // Test read
  try {
    const { error: readError } = await client
      .from("drugs")
      .select("*")
      .limit(1);
    canRead = !readError;
  } catch (err) {
    console.error("Read test failed:", err);
  }

  // Test write (try to insert then delete a test record)
  try {
    const testRecord = {
      dataset_type: "DB1" as const,
      drug_name: "TEST_RECORD_DELETE_ME",
      company: "TEST",
      route: "TEST",
      phase: "TEST",
      indication: "TEST",
      entry_date: new Date().toISOString().split("T")[0]
    };

    const { data: inserted, error: insertError } = await client
      .from("drugs")
      .insert(testRecord)
      .select("id")
      .single();

    if (!insertError && inserted) {
      // Try to delete
      const { error: deleteError } = await client
        .from("drugs")
        .delete()
        .eq("id", inserted.id);

      canWrite = !deleteError;
    }
  } catch (err) {
    console.error("Write test failed:", err);
  }

  return {
    connected: true,
    canRead,
    canWrite,
    error: canRead && canWrite ? undefined : "Limited permissions"
  };
}
