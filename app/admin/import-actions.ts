"use server";

import { createAdminServiceClient } from "@/lib/supabase/service-role";
import { createClient } from "@/lib/supabase/server";
import { parseUploadedFile, suggestColumnMappings, validateRequiredMappings } from "@/lib/import/file-parser";
import { getDatasetColumns, DatasetType } from "@/lib/import/schema";
import { validateRows, detectDuplicates, generateValidationSummary } from "@/lib/import/validation";
import { insertDrugsInBatches, recordImportJob, checkDrugsTable, getExistingDrugs } from "@/lib/import/database";

export interface ServerActionResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * In-memory storage for file chunks and parsed data during import
 * Maps sessionId -> { chunks: Buffer[], totalSize: number, lastAccess: number }
 */
const fileChunkStore = new Map<string, { 
  chunks: Buffer[]; 
  totalSize: number; 
  lastAccess: number;
  parsedData?: { headers: string[]; rows: Record<string, any>[]; fileName: string };
}>();

/**
 * Clean up expired sessions (older than 30 minutes)
 */
function cleanupExpiredSessions() {
  const now = Date.now();
  const EXPIRY_TIME = 30 * 60 * 1000; // 30 minutes
  
  const entries = Array.from(fileChunkStore.entries());
  for (const [sessionId, session] of entries) {
    if (now - session.lastAccess > EXPIRY_TIME) {
      fileChunkStore.delete(sessionId);
    }
  }
}

// Run cleanup every 5 minutes
setInterval(cleanupExpiredSessions, 5 * 60 * 1000);

/**
 * Server action: Upload file chunk
 * Returns session ID to use for parsing
 */
export async function uploadFileChunkAction(
  chunk: Uint8Array,
  sessionId: string,
  isLastChunk: boolean
): Promise<ServerActionResponse<{ sessionId: string; received: number }>> {
  try {
    const buffer = Buffer.from(chunk);

    if (!fileChunkStore.has(sessionId)) {
      fileChunkStore.set(sessionId, { 
        chunks: [], 
        totalSize: 0,
        lastAccess: Date.now()
      });
    }

    const session = fileChunkStore.get(sessionId)!;
    session.chunks.push(buffer);
    session.totalSize += buffer.length;
    session.lastAccess = Date.now(); // Update last access time

    return {
      success: true,
      data: { sessionId, received: session.totalSize }
    };
  } catch (err) {
    return {
      success: false,
      error: String(err)
    };
  }
}

/**
 * Server action: Parse uploaded file from chunks
 * Does NOT delete session - keeps it for validation and import steps
 */
export async function parseUploadedFileAction(
  sessionId: string,
  fileName: string
): Promise<ServerActionResponse<{
  headers: string[];
  totalRows: number;
  fileName: string;
  fileType: "csv" | "xlsx";
}>> {
  try {
    const session = fileChunkStore.get(sessionId);
    if (!session) {
      return {
        success: false,
        error: "Session not found. Please upload file again."
      };
    }

    // Concatenate all chunks
    const buffer = Buffer.concat(session.chunks, session.totalSize);

    // Parse the complete file
    const parsed = await parseUploadedFile(buffer, fileName);

    // Store parsed data in session for later use (don't delete!)
    session.parsedData = {
      headers: parsed.headers,
      rows: parsed.rows,
      fileName: parsed.fileName
    };
    session.lastAccess = Date.now(); // Update last access time

    return {
      success: true,
      data: {
        headers: parsed.headers,
        totalRows: parsed.totalRows,
        fileName: parsed.fileName,
        fileType: parsed.fileType
      }
    };
  } catch (err) {
    return {
      success: false,
      error: String(err)
    };
  }
}

/**
 * Server action: Suggest column mappings
 */
export async function suggestMappingsAction(
  headers: string[],
  datasetType: DatasetType
): Promise<ServerActionResponse<{
  suggestions: Record<string, string | null>;
  supportedColumns: Record<string, { required: boolean; description: string }>;
}>> {
  try {
    const supportedColumns = getDatasetColumns(datasetType);

    // Create a simpler version for the response
    const simpleColumns: Record<string, { required: boolean; description: string }> = {};
    for (const [name, def] of Object.entries(supportedColumns)) {
      simpleColumns[name] = {
        required: def.required,
        description: def.description
      };
    }

    const suggestions = suggestColumnMappings(headers, supportedColumns);

    return {
      success: true,
      data: {
        suggestions,
        supportedColumns: simpleColumns
      }
    };
  } catch (err) {
    return {
      success: false,
      error: String(err)
    };
  }
}

/**
 * Server action: Validate mappings and preview data
 * Uses stored session chunks instead of sending file in request
 */
export async function validateMappingsAndPreviewAction(
  sessionId: string,
  mappings: Record<string, string | null>,
  datasetType: DatasetType
): Promise<
  ServerActionResponse<{
    validRows: Record<string, any>[];
    invalidRows: Array<{
      rowNumber: number;
      errors: Array<{ field: string; message: string }>;
    }>;
    totalValid: number;
    totalInvalid: number;
    duplicatesWithinBatch: number;
    summary: string;
    summaryStatus: "success" | "warning" | "error";
  }>
> {
  try {
    const session = fileChunkStore.get(sessionId);
    if (!session) {
      return {
        success: false,
        error: "Session expired. Please upload file again."
      };
    }

    // Update last access time
    session.lastAccess = Date.now();

    // Use cached parsed data if available
    let rows: Record<string, any>[] = [];
    if (session.parsedData) {
      rows = session.parsedData.rows;
    } else {
      // Fallback: reconstruct if needed
      const buffer = Buffer.concat(session.chunks, session.totalSize);
      const parsed = await parseUploadedFile(buffer, "imported_file");
      rows = parsed.rows;
    }

    // Validate mappings
    const columns = getDatasetColumns(datasetType);
    const mappingValidation = validateRequiredMappings(mappings, columns);

    if (!mappingValidation.valid) {
      return {
        success: false,
        error: `Missing required field mappings: ${mappingValidation.missingRequired.join(", ")}`
      };
    }

    // Validate all rows
    const validation = validateRows(rows, datasetType, mappings);

    // Detect duplicates within batch
    const { duplicates } = detectDuplicates(validation.validRows, "drug_name_company");

    // Generate summary
    const { summary, status } = generateValidationSummary(
      validation.totalValid,
      validation.totalInvalid,
      duplicates.length,
      0
    );

    return {
      success: true,
      data: {
        validRows: validation.validRows.slice(0, 100), // Limit preview to first 100 for performance
        invalidRows: validation.invalidRows.map((row) => ({
          rowNumber: row.rowNumber,
          errors: row.errors.map((err) => ({
            field: err.field,
            message: err.message
          }))
        })),
        totalValid: validation.totalValid,
        totalInvalid: validation.totalInvalid,
        duplicatesWithinBatch: duplicates.length,
        summary,
        summaryStatus: status
      }
    };
  } catch (err) {
    return {
      success: false,
      error: String(err)
    };
  }
}

/**
 * Server action: Execute import
 */
export async function executeImportAction(
  sessionId: string,
  fileName: string,
  mappings: Record<string, string | null>,
  datasetType: DatasetType,
  matchStrategy: "drug_name_company" | "compound_id" = "drug_name_company"
): Promise<
  ServerActionResponse<{
    insertedCount: number;
    updatedCount: number;
    skippedCount: number;
    failedCount: number;
    jobId?: string;
    errors: string[];
  }>
> {
  try {
    const session = fileChunkStore.get(sessionId);
    if (!session) {
      return {
        success: false,
        error: "Session expired. Please upload file again."
      };
    }

    // Update last access time
    session.lastAccess = Date.now();

    // Use cached parsed data if available
    let rows: Record<string, any>[] = [];
    if (session.parsedData) {
      rows = session.parsedData.rows;
    } else {
      // Fallback: reconstruct if needed
      const buffer = Buffer.concat(session.chunks, session.totalSize);
      const parsed = await parseUploadedFile(buffer, fileName);
      rows = parsed.rows;
    }

    // Verify user is authenticated admin
    const supabase = createClient();
    if (!supabase) {
      return {
        success: false,
        error: "Unable to initialize Supabase client"
      };
    }

    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user) {
      return {
        success: false,
        error: "Not authenticated"
      };
    }

    // Verify user is admin
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role, approval_status")
      .eq("id", user.id)
      .single();

    if (profileError || !profile || profile.role !== "admin") {
      return {
        success: false,
        error: "Unauthorized: Admin access required"
      };
    }

    // Check database connection
    const dbStatus = await checkDrugsTable();
    if (!dbStatus.exists) {
      return {
        success: false,
        error: `Unable to access drugs table: ${dbStatus.error}`
      };
    }

    // Validate mappings
    const columns = getDatasetColumns(datasetType);
    const mappingValidation = validateRequiredMappings(mappings, columns);

    if (!mappingValidation.valid) {
      return {
        success: false,
        error: `Missing required field mappings: ${mappingValidation.missingRequired.join(", ")}`
      };
    }

    // Validate all rows
    const validation = validateRows(rows, datasetType, mappings);

    if (validation.totalInvalid > 0) {
      const invalidMessages = validation.invalidRows
        .slice(0, 10)
        .map((row) => `Row ${row.rowNumber}: ${row.errors[0]?.message || "Invalid"}`)
        .join("; ");

      return {
        success: false,
        error: `Cannot import: ${validation.totalInvalid} rows have validation errors. ${invalidMessages}`
      };
    }

    // Insert valid rows (incomplete rows with only warnings are already filtered out)
    const importResult = await insertDrugsInBatches(validation.validRows, datasetType);

    // Record import job
    const jobRecord = await recordImportJob({
      dataset_type: datasetType,
      file_name: fileName,
      file_size_bytes: rows.length * 100, // Rough estimate
      uploaded_by_user_id: user.id,
      total_rows: rows.length,
      inserted_count: importResult.insertedCount,
      updated_count: importResult.updatedCount,
      skipped_count: importResult.skippedCount,
      failed_count: importResult.failedCount,
      status: importResult.success ? "completed" : "failed",
      matching_strategy: matchStrategy,
      error_log:
        importResult.errors.length > 0
          ? importResult.errors.map((e) => e.message).join("\n")
          : undefined
    });

    return {
      success: importResult.success,
      data: {
        insertedCount: importResult.insertedCount,
        updatedCount: importResult.updatedCount,
        skippedCount: importResult.skippedCount,
        failedCount: importResult.failedCount,
        jobId: jobRecord.jobId,
        errors: importResult.errors.map((e) => e.message)
      },
      message: importResult.success
        ? `Successfully imported ${importResult.insertedCount} drug records to ${datasetType}`
        : `Import completed with errors`
    };
  } catch (err) {
    return {
      success: false,
      error: String(err)
    };
  } finally {
    // Clean up session after import completes
    fileChunkStore.delete(sessionId);
  }
}

/**
 * Server action: Get import history
 */
export async function getImportHistoryAction(): Promise<
  ServerActionResponse<
    Array<{
      id: string;
      file_name: string;
      dataset_type: DatasetType;
      total_rows: number;
      inserted_count: number;
      updated_count: number;
      failed_count: number;
      status: string;
      created_at: string;
    }>
  >
> {
  try {
    const supabase = createClient();
    if (!supabase) {
      return {
        success: false,
        error: "Unable to initialize Supabase client"
      };
    }

    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user) {
      return {
        success: false,
        error: "Not authenticated"
      };
    }

    const { data, error } = await supabase
      .from("import_jobs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      return {
        success: false,
        error: `Could not fetch import history: ${error.message}`
      };
    }

    return {
      success: true,
      data: data || []
    };
  } catch (err) {
    return {
      success: false,
      error: String(err)
    };
  }
}
