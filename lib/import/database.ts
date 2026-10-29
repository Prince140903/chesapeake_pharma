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
    const referencesToInsert = references.map((ref, index) => ({
      drug_id: drugId,
      reference_value: ref.title,
      reference_order: index + 1,
      created_at: new Date().toISOString()
      // Note: source and url could be stored in reference_value or in separate fields if schema supports
    }));

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

          if (matchedDrug) {
            const refResult = await insertDrugReferences(
              matchedDrug.id,
              refData.references
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
    const { data, error } = await client
      .from("import_jobs")
      .insert({
        dataset_type: jobData.dataset_type,
        file_name: jobData.file_name,
        file_size_bytes: jobData.file_size_bytes,
        uploaded_by_user_id: jobData.uploaded_by_user_id,
        total_rows: jobData.total_rows,
        inserted_count: jobData.inserted_count,
        updated_count: jobData.updated_count,
        skipped_count: jobData.skipped_count,
        failed_count: jobData.failed_count,
        status: jobData.status,
        matching_strategy: jobData.matching_strategy,
        error_log: jobData.error_log || null
      })
      .select("id")
      .single();

    if (error) {
      // If import_jobs table doesn't exist, just log it
      console.warn("Could not record import job (table may not exist):", error);
      return { success: true }; // Don't fail the import if recording fails
    }

    return { success: true, jobId: data?.id };
  } catch (err) {
    console.warn("Could not record import job:", err);
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
