"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  FileSpreadsheet,
  UploadCloud,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Eye,
  FileCheck,
  ChevronRight,
  Database,
  Pill,
  ArrowRight,
  X,
  FileText,
  RotateCcw,
  Loader,
  AlertCircle
} from "lucide-react";
import { useAdmin } from "@/components/admin/admin-context";
import {
  parseUploadedFileAction,
  suggestMappingsAction,
  validateMappingsAndPreviewAction,
  executeImportAction,
  getImportHistoryAction,
  uploadFileChunkAction
} from "@/app/admin/import-actions";
import { DatasetType } from "@/lib/import/schema";

export default function AdminImportsPage() {
  const { addToast } = useAdmin();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Import history
  const [importHistory, setImportHistory] = useState<any[]>([]);
  const [selectedJob, setSelectedJob] = useState<any | null>(null);
  const [loadingHistory, setLoadingHistory] = useState(true);

  // Wizard state
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [selectedDataset, setSelectedDataset] = useState<DatasetType>("DB1");
  const [uploadedFile, setUploadedFile] = useState<{ name: string; sessionId: string } | null>(null);
  const [fileHeaders, setFileHeaders] = useState<string[]>([]);
  const [fileTotalRows, setFileTotalRows] = useState(0);

  // Mapping state
  const [supportedColumns, setSupportedColumns] = useState<Record<string, any>>({});
  const [mappings, setMappings] = useState<Record<string, string | null>>({});

  // Preview state
  const [previewData, setPreviewData] = useState<{
    validRows: Record<string, any>[];
    invalidRows: any[];
    totalValid: number;
    totalInvalid: number;
    duplicatesWithinBatch: number;
    summary: string;
    summaryStatus: "success" | "warning" | "error";
  } | null>(null);

  // Confirmation state
  const [matchingStrategy, setMatchingStrategy] = useState<"drug_name_company" | "compound_id">("drug_name_company");

  // Processing state
  const [isProcessing, setIsProcessing] = useState(false);
  const [importResult, setImportResult] = useState<any | null>(null);

  // Load import history on mount
  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    setLoadingHistory(true);
    const result = await getImportHistoryAction();
    if (result.success && result.data) {
      setImportHistory(result.data);
    }
    setLoadingHistory(false);
  };

  const startNewImport = () => {
    // Reset all wizard state
    setStep(1);
    setSelectedDataset("DB1");
    setUploadedFile(null);
    setFileHeaders([]);
    setFileTotalRows(0);
    setSupportedColumns({});
    setMappings({});
    setPreviewData(null);
    setMatchingStrategy("drug_name_company");
    setIsProcessing(false);
    setImportResult(null);
    setIsWizardOpen(true);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    try {
      // Generate session ID for this upload
      const sessionId = `session-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

      // Upload file in 256KB chunks
      const CHUNK_SIZE = 256 * 1024; // 256KB chunks
      let offset = 0;

      while (offset < file.size) {
        const chunk = file.slice(offset, offset + CHUNK_SIZE);
        const arrayBuffer = await chunk.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
        const isLastChunk = offset + CHUNK_SIZE >= file.size;

        const chunkResult = await uploadFileChunkAction(
          uint8Array,
          sessionId,
          isLastChunk
        );

        if (!chunkResult.success) {
          addToast({
            type: "error",
            title: "Upload Error",
            message: chunkResult.error || "Failed to upload chunk"
          });
          setIsProcessing(false);
          return;
        }

        offset += CHUNK_SIZE;

        // Show upload progress
        const progress = Math.min(100, Math.round((offset / file.size) * 100));
        console.log(`Upload progress: ${progress}%`);
      }

      // Parse the complete file from chunks
      const parseResult = await parseUploadedFileAction(sessionId, file.name);

      if (!parseResult.success) {
        addToast({
          type: "error",
          title: "File Parse Error",
          message: parseResult.error || "Failed to parse file"
        });
        setIsProcessing(false);
        return;
      }

      setUploadedFile({ name: file.name, sessionId });
      setFileHeaders(parseResult.data!.headers);
      setFileTotalRows(parseResult.data!.totalRows);

      // Suggest mappings
      const suggestResult = await suggestMappingsAction(
        parseResult.data!.headers,
        selectedDataset
      );

      if (suggestResult.success) {
        setSupportedColumns(suggestResult.data!.supportedColumns);
        setMappings(suggestResult.data!.suggestions);
        setStep(2);
      }

      addToast({
        type: "success",
        title: "File Uploaded",
        message: `${file.name}: ${parseResult.data!.totalRows} rows detected`
      });
    } catch (err) {
      addToast({
        type: "error",
        title: "Upload Error",
        message: String(err)
      });
    } finally {
      setIsProcessing(false);
      // Reset file input
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const proceedToPreview = async () => {
    if (!uploadedFile) return;

    setIsProcessing(true);
    try {
      const result = await validateMappingsAndPreviewAction(
        uploadedFile.sessionId,
        mappings,
        selectedDataset
      );

      if (result.success && result.data) {
        setPreviewData(result.data);
        setStep(3);
      } else {
        addToast({
          type: "error",
          title: "Validation Error",
          message: result.error || "Validation failed"
        });
      }
    } catch (err) {
      addToast({
        type: "error",
        title: "Error",
        message: String(err)
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExecuteImport = async () => {
    if (!uploadedFile) return;

    setIsProcessing(true);
    try {
      const result = await executeImportAction(
        uploadedFile.sessionId,
        uploadedFile.name,
        mappings,
        selectedDataset,
        matchingStrategy
      );

      if (result.success) {
        setImportResult(result.data);
        setStep(4);
        addToast({
          type: "success",
          title: "Import Completed",
          message: result.message || "Import successful"
        });
        // Reload history
        await loadHistory();
      } else {
        addToast({
          type: "error",
          title: "Import Failed",
          message: result.error || "Import failed"
        });
      }
    } catch (err) {
      addToast({
        type: "error",
        title: "Error",
        message: String(err)
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const closeWizard = () => {
    setIsWizardOpen(false);
    // Reset state
    setStep(1);
    setUploadedFile(null);
    setFileHeaders([]);
    setMappings({});
    setPreviewData(null);
  };

  const updateMapping = (uploadedHeader: string, dbColumn: string | null) => {
    setMappings((prev) => ({
      ...prev,
      [uploadedHeader]: dbColumn
    }));
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest text-[#42B7B9]">
            Bulk Data Staging & Verification
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-[#0B2D45] sm:text-3xl">
            Import History & Ingestion
          </h1>
          <p className="mt-1 text-xs text-[#637786]">
            Audit previous dataset imports, inspect row-level validations, and launch preview-first CSV/XLSX imports.
          </p>
        </div>

        <button
          onClick={startNewImport}
          className="inline-flex items-center gap-2 rounded-lg bg-[#135C70] px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-sm hover:bg-[#0B3B48] transition"
        >
          <UploadCloud size={16} />
          <span>Launch Import Wizard</span>
        </button>
      </div>

      {/* Safety Notice */}
      <div className="rounded-xl border border-blue-200 bg-blue-50/70 p-4 text-xs text-blue-950">
        <div className="flex items-start gap-3">
          <FileCheck size={18} className="text-[#135C70] shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Transaction Safety & Duplicate Protection:</span>
            <p className="mt-0.5 text-slate-600">
              Chesapeake Pharma import pipelines operate in staged transactions. Spreadsheets are verified for mandatory columns, schema-conforming volumes, and duplicate matching against (Drug Name + Company) before mutating real records.
            </p>
          </div>
        </div>
      </div>

      {/* Import Jobs History Table */}
      <div className="overflow-hidden rounded-xl border border-[#DCE6EB] bg-white shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#082236] text-white">
              <tr>
                <th className="px-4 py-3 font-semibold uppercase tracking-wider text-[10px]">File Name</th>
                <th className="px-4 py-3 font-semibold uppercase tracking-wider text-[10px]">Target Dataset</th>
                <th className="px-4 py-3 font-semibold uppercase tracking-wider text-[10px]">Status</th>
                <th className="px-4 py-3 font-semibold uppercase tracking-wider text-[10px]">Total Rows</th>
                <th className="px-4 py-3 font-semibold uppercase tracking-wider text-[10px]">Result Breakdown</th>
                <th className="px-4 py-3 font-semibold uppercase tracking-wider text-[10px]">Uploaded At</th>
                <th className="px-4 py-3 font-semibold uppercase tracking-wider text-[10px] text-right">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DCE6EB]">
              {loadingHistory ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                    <Loader size={20} className="inline animate-spin" />
                    <p className="mt-2">Loading import history...</p>
                  </td>
                </tr>
              ) : importHistory.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                    <FileText size={20} className="inline" />
                    <p className="mt-2">No imports yet. Create your first import to begin.</p>
                  </td>
                </tr>
              ) : (
                importHistory.map((job) => (
                  <tr key={job.id} className="hover:bg-[#F5F8FA]/80 transition">
                    <td className="px-4 py-3 font-bold text-[#0B2D45]">
                      <div className="flex items-center gap-2">
                        <FileSpreadsheet size={15} className="text-[#135C70]" />
                        <span className="font-semibold">{job.file_name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block rounded px-2 py-0.5 text-[10px] font-bold ${
                          job.dataset_type === "DB1"
                            ? "bg-teal-50 text-[#135C70] border border-teal-200"
                            : "bg-blue-50 text-blue-900 border border-blue-200"
                        }`}
                      >
                        {job.dataset_type}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {job.status === "completed" && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-800 border border-emerald-200">
                          <CheckCircle2 size={12} className="text-emerald-600" />
                          Completed
                        </span>
                      )}
                      {job.status === "failed" && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-rose-800 border border-rose-200">
                          <XCircle size={12} className="text-rose-600" />
                          Failed
                        </span>
                      )}
                      {job.status === "processing" && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-yellow-50 px-2 py-0.5 text-[10px] font-bold text-yellow-800 border border-yellow-200">
                          <Clock size={12} className="text-yellow-600" />
                          Processing
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 font-semibold text-[#0B2D45]">
                      {job.total_rows}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 text-[10px]">
                        {job.inserted_count > 0 && (
                          <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-emerald-800 font-bold">
                            +{job.inserted_count} new
                          </span>
                        )}
                        {job.updated_count > 0 && (
                          <span className="rounded bg-blue-100 px-1.5 py-0.5 text-blue-800 font-semibold">
                            {job.updated_count} updated
                          </span>
                        )}
                        {job.failed_count > 0 && (
                          <span className="rounded bg-red-100 px-1.5 py-0.5 text-red-800 font-bold">
                            {job.failed_count} errors
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-[11px]">
                      {new Date(job.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => setSelectedJob(job)}
                        className="rounded p-1 text-slate-500 hover:bg-[#EAF7F7] hover:text-[#135C70]"
                        title="Inspect Job"
                      >
                        <Eye size={15} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Import Details Modal */}
      {selectedJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-2xl border border-[#DCE6EB] bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between pb-4 border-b border-[#DCE6EB]">
              <div>
                <span className="rounded bg-[#EAF7F7] px-2 py-0.5 text-[10px] font-bold text-[#135C70]">
                  JOB REPORT #{selectedJob.id}
                </span>
                <h2 className="mt-1 text-lg font-bold text-[#0B2D45]">{selectedJob.file_name}</h2>
              </div>
              <button
                onClick={() => setSelectedJob(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-5 space-y-4 text-xs">
              <div className="grid grid-cols-4 gap-2 text-center">
                <div className="rounded-lg bg-[#F5F8FA] p-2.5">
                  <p className="text-[10px] uppercase font-bold text-slate-400">Total Rows</p>
                  <p className="text-base font-bold text-[#0B2D45]">{selectedJob.total_rows}</p>
                </div>
                <div className="rounded-lg bg-emerald-50 p-2.5">
                  <p className="text-[10px] uppercase font-bold text-emerald-800">Inserted</p>
                  <p className="text-base font-bold text-emerald-900">{selectedJob.inserted_count}</p>
                </div>
                <div className="rounded-lg bg-blue-50 p-2.5">
                  <p className="text-[10px] uppercase font-bold text-blue-800">Updated</p>
                  <p className="text-base font-bold text-blue-900">{selectedJob.updated_count}</p>
                </div>
                <div className="rounded-lg bg-rose-50 p-2.5">
                  <p className="text-[10px] uppercase font-bold text-rose-800">Failed</p>
                  <p className="text-base font-bold text-rose-900">{selectedJob.failed_count}</p>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end border-t border-[#DCE6EB] pt-4">
              <button
                onClick={() => setSelectedJob(null)}
                className="rounded-lg bg-[#0B2D45] px-4 py-2 text-xs font-bold text-white hover:bg-[#135C70]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv,.xlsx,.xls"
        onChange={handleFileUpload}
        style={{ display: "none" }}
      />

      {/* Multi-step Import Wizard Modal */}
      {isWizardOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-3xl rounded-2xl border border-[#DCE6EB] bg-white p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between pb-4 border-b border-[#DCE6EB]">
              <div>
                <span className="rounded bg-[#EAF7F7] px-2 py-0.5 text-[10px] font-bold text-[#135C70]">
                  IMPORT WIZARD · STEP {step} OF 4
                </span>
                <h2 className="mt-1 text-xl font-bold text-[#0B2D45]">
                  {step === 1 && "1. Select Dataset & Upload File"}
                  {step === 2 && "2. Column Mapping Verification"}
                  {step === 3 && "3. Row Preview & Validation"}
                  {step === 4 && "4. Import Confirmation"}
                </h2>
              </div>
              <button
                onClick={closeWizard}
                disabled={isProcessing}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            {/* Step 1: Dataset & File */}
            {step === 1 && (
              <div className="mt-5 space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-[#0B2D45] mb-2">Target Database Pack</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setSelectedDataset("DB1")}
                      className={`rounded-xl border p-4 text-left transition ${
                        selectedDataset === "DB1"
                          ? "border-[#42B7B9] bg-[#EAF7F7] ring-2 ring-[#42B7B9]/20"
                          : "border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      <Pill size={18} className="text-[#135C70]" />
                      <p className="mt-2 font-bold text-[#0B2D45]">DB1: Subcutaneous</p>
                      <p className="text-[11px] text-slate-500">High-volume formulations</p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedDataset("DB2")}
                      className={`rounded-xl border p-4 text-left transition ${
                        selectedDataset === "DB2"
                          ? "border-[#42B7B9] bg-[#EAF7F7] ring-2 ring-[#42B7B9]/20"
                          : "border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      <Database size={18} className="text-[#135C70]" />
                      <p className="mt-2 font-bold text-[#0B2D45]">DB2: Broad Injectables</p>
                      <p className="text-[11px] text-slate-500">All injectable modalities</p>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-[#0B2D45] mb-2">Upload CSV or XLSX File</label>
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#DCE6EB] p-8 text-center bg-[#F5F8FA] cursor-pointer hover:border-[#135C70] transition"
                  >
                    <UploadCloud size={32} className="text-[#135C70]" />
                    <p className="mt-2 font-semibold text-[#0B2D45]">
                      Click to select file or drag and drop
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Supports CSV and XLSX files
                    </p>
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-[#DCE6EB]">
                  <button
                    onClick={startNewImport}
                    disabled={isProcessing}
                    className="flex items-center gap-1.5 rounded-lg bg-[#135C70] px-4 py-2 font-bold text-white hover:bg-[#0B3B48] disabled:opacity-50"
                  >
                    <span>Select File</span>
                    <ChevronRight size={15} />
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Column Mapping */}
            {step === 2 && (
              <div className="mt-5 space-y-4 text-xs">
                <p className="text-slate-600">
                  Map spreadsheet columns to database fields for <strong>{selectedDataset}</strong>.
                  {fileTotalRows > 0 && ` (${fileHeaders.length} columns detected in ${fileTotalRows} rows)`}
                </p>

                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {fileHeaders.map((header, index) => (
                    <div key={index} className="rounded-lg border border-[#DCE6EB] p-3 space-y-1.5">
                      <p className="font-mono text-[10px] font-bold text-slate-700 bg-slate-100 px-2 py-1 rounded w-fit">
                        &quot;{header}&quot;
                      </p>
                      <select
                        value={mappings[header] || ""}
                        onChange={(e) => updateMapping(header, e.target.value || null)}
                        className="w-full rounded-lg border border-[#DCE6EB] bg-white p-2 text-xs font-medium"
                      >
                        <option value="">-- Not Mapped (Skip) --</option>
                        {Object.entries(supportedColumns).map(([colName, colDef]) => (
                          <option key={colName} value={colName}>
                            {colName} {colDef.required ? "(Required)" : "(Optional)"}
                          </option>
                        ))}
                      </select>
                      {mappings[header] && supportedColumns[mappings[header]]?.description && (
                        <p className="text-[10px] text-slate-500 italic">
                          {supportedColumns[mappings[header]!].description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>

                <div className="flex justify-between pt-4 border-t border-[#DCE6EB]">
                  <button
                    onClick={() => setStep(1)}
                    disabled={isProcessing}
                    className="rounded-lg border border-slate-200 px-3.5 py-2 font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                  >
                    Back
                  </button>
                  <button
                    onClick={proceedToPreview}
                    disabled={isProcessing}
                    className="flex items-center gap-1.5 rounded-lg bg-[#135C70] px-4 py-2 font-bold text-white hover:bg-[#0B3B48] disabled:opacity-50"
                  >
                    {isProcessing ? (
                      <>
                        <Loader size={15} className="animate-spin" />
                        <span>Validating...</span>
                      </>
                    ) : (
                      <>
                        <span>Proceed to Preview</span>
                        <ChevronRight size={15} />
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Row Preview */}
            {step === 3 && previewData && (
              <div className="mt-5 space-y-4 text-xs">
                <div
                  className={`rounded-lg p-3 flex items-start gap-2 ${
                    previewData.summaryStatus === "error"
                      ? "border border-red-200 bg-red-50"
                      : previewData.summaryStatus === "warning"
                      ? "border border-yellow-200 bg-yellow-50"
                      : "border border-emerald-200 bg-emerald-50"
                  }`}
                >
                  {previewData.summaryStatus === "error" ? (
                    <XCircle size={16} className="text-red-700 shrink-0 mt-0.5" />
                  ) : previewData.summaryStatus === "warning" ? (
                    <AlertTriangle size={16} className="text-yellow-700 shrink-0 mt-0.5" />
                  ) : (
                    <CheckCircle2 size={16} className="text-emerald-700 shrink-0 mt-0.5" />
                  )}
                  <p className="font-semibold">{previewData.summary}</p>
                </div>

                <div className="grid grid-cols-4 gap-2 text-center">
                  <div className="rounded-lg bg-[#F5F8FA] p-2">
                    <p className="text-[10px] uppercase font-bold text-slate-400">Valid</p>
                    <p className="text-base font-bold text-[#0B2D45]">{previewData.totalValid}</p>
                  </div>
                  <div className="rounded-lg bg-red-50 p-2">
                    <p className="text-[10px] uppercase font-bold text-red-800">Invalid</p>
                    <p className="text-base font-bold text-red-900">{previewData.totalInvalid}</p>
                  </div>
                  <div className="rounded-lg bg-yellow-50 p-2">
                    <p className="text-[10px] uppercase font-bold text-yellow-800">Duplicates</p>
                    <p className="text-base font-bold text-yellow-900">{previewData.duplicatesWithinBatch}</p>
                  </div>
                  <div className="rounded-lg bg-emerald-50 p-2">
                    <p className="text-[10px] uppercase font-bold text-emerald-800">Importable</p>
                    <p className="text-base font-bold text-emerald-900">{previewData.totalValid}</p>
                  </div>
                </div>

                {previewData.invalidRows.length > 0 && (
                  <div className="rounded-lg border border-red-200 bg-red-50 p-3">
                    <p className="font-bold text-red-900 mb-2">Invalid Rows:</p>
                    <div className="space-y-1 max-h-40 overflow-y-auto">
                      {previewData.invalidRows.slice(0, 5).map((row, i) => (
                        <div key={i} className="text-[10px] text-red-800">
                          <p className="font-mono">Row {row.rowNumber}: {row.errors[0]?.message}</p>
                        </div>
                      ))}
                      {previewData.invalidRows.length > 5 && (
                        <p className="text-[10px] text-red-700 pt-1">
                          ... and {previewData.invalidRows.length - 5} more rows with errors
                        </p>
                      )}
                    </div>
                  </div>
                )}

                <div className="rounded-lg border border-[#DCE6EB] p-3 space-y-2">
                  <p className="font-bold text-[#0B2D45]">Duplicate Handling</p>
                  <select
                    value={matchingStrategy}
                    onChange={(e) => setMatchingStrategy(e.target.value as any)}
                    className="w-full rounded-lg border border-[#DCE6EB] bg-white p-2 text-xs"
                  >
                    <option value="drug_name_company">Match by Drug Name + Company</option>
                    <option value="compound_id">Match by Compound ID (if available)</option>
                  </select>
                  <p className="text-[10px] text-slate-500">Duplicates will be skipped during import.</p>
                </div>

                <div className="flex justify-between pt-4 border-t border-[#DCE6EB]">
                  <button
                    onClick={() => setStep(2)}
                    disabled={isProcessing || previewData.totalInvalid > 0}
                    className="rounded-lg border border-slate-200 px-3.5 py-2 font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                  >
                    Back to Mapping
                  </button>
                  <button
                    onClick={() => setStep(4)}
                    disabled={isProcessing || previewData.totalValid === 0}
                    className="flex items-center gap-1.5 rounded-lg bg-[#135C70] px-4 py-2 font-bold text-white hover:bg-[#0B3B48] disabled:opacity-50"
                  >
                    <span>Ready to Import</span>
                    <ChevronRight size={15} />
                  </button>
                </div>
              </div>
            )}

            {/* Step 4: Confirmation */}
            {step === 4 && previewData && (
              <div className="mt-5 space-y-4 text-xs">
                <div className="rounded-xl border border-slate-200 bg-[#F5F8FA] p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-500">File:</span>
                    <span className="font-bold text-[#0B2D45]">{uploadedFile?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Target Database:</span>
                    <span className="font-bold text-[#135C70]">{selectedDataset}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Duplicate Matching:</span>
                    <span className="font-semibold text-slate-700">{matchingStrategy}</span>
                  </div>
                  <div className="flex justify-between border-t border-slate-200 pt-2 font-bold text-[#0B2D45]">
                    <span>Will import:</span>
                    <span>{previewData.totalValid} rows</span>
                  </div>
                </div>

                {importResult && (
                  <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
                    <div className="font-bold text-emerald-900 mb-2">Import Completed</div>
                    <div className="space-y-1 text-[10px] text-emerald-800">
                      <p>✓ Inserted: {importResult.insertedCount}</p>
                      <p>✓ Updated: {importResult.updatedCount}</p>
                      <p>✓ Skipped: {importResult.skippedCount}</p>
                      {importResult.failedCount > 0 && (
                        <p>✗ Failed: {importResult.failedCount}</p>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex justify-between pt-4 border-t border-[#DCE6EB]">
                  <button
                    onClick={() => setStep(3)}
                    disabled={isProcessing || !!importResult}
                    className="rounded-lg border border-slate-200 px-3.5 py-2 font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                  >
                    Back
                  </button>
                  {!importResult ? (
                    <button
                      onClick={handleExecuteImport}
                      disabled={isProcessing}
                      className="rounded-lg bg-[#135C70] px-5 py-2 font-bold uppercase tracking-wider text-white hover:bg-[#0B3B48] disabled:opacity-50 flex items-center gap-2"
                    >
                      {isProcessing ? (
                        <>
                          <Loader size={15} className="animate-spin" />
                          <span>Processing...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 size={15} />
                          <span>Commit Import</span>
                        </>
                      )}
                    </button>
                  ) : (
                    <button
                      onClick={closeWizard}
                      className="rounded-lg bg-emerald-600 px-5 py-2 font-bold uppercase text-white hover:bg-emerald-700"
                    >
                      Done
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
