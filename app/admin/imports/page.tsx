"use client";

import React, { useState } from "react";
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
  RotateCcw
} from "lucide-react";
import { useAdmin } from "@/components/admin/admin-context";
import { AdminImportJob } from "@/lib/admin-mock-data";

export default function AdminImportsPage() {
  const { imports, addImportJob } = useAdmin();

  const [selectedJob, setSelectedJob] = useState<AdminImportJob | null>(null);
  const [isWizardOpen, setIsWizardOpen] = useState(false);

  // Wizard state
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [selectedDataset, setSelectedDataset] = useState<"DB1" | "DB2">("DB1");
  const [fileName, setFileName] = useState("2026_Q4_Delivery_Candidates_Draft.xlsx");
  const [matchingStrategy, setMatchingStrategy] = useState<"drug_name_company" | "compound_id">("drug_name_company");
  const [importMode, setImportMode] = useState<"upsert" | "insert_only">("upsert");
  const [isProcessing, setIsProcessing] = useState(false);

  const startNewImport = () => {
    setStep(1);
    setSelectedDataset("DB1");
    setFileName("2026_Q4_Delivery_Candidates_Draft.xlsx");
    setIsWizardOpen(true);
  };

  const handleExecuteImport = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setIsWizardOpen(false);

      addImportJob({
        dataset_type: selectedDataset,
        file_name: fileName,
        file_size_kb: 340,
        uploaded_by: "Philip Green (Admin)",
        status: "completed",
        total_rows: 24,
        inserted_count: 21,
        updated_count: 3,
        skipped_count: 0,
        failed_count: 0,
        matching_strategy: matchingStrategy,
        errors: []
      });
    }, 900);
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
                <th className="px-4 py-3 font-semibold uppercase tracking-wider text-[10px]">Uploaded At / Admin</th>
                <th className="px-4 py-3 font-semibold uppercase tracking-wider text-[10px] text-right">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DCE6EB]">
              {imports.map((job) => (
                <tr key={job.id} className="hover:bg-[#F5F8FA]/80 transition">
                  <td className="px-4 py-3 font-bold text-[#0B2D45]">
                    <div className="flex items-center gap-2">
                      <FileSpreadsheet size={15} className="text-[#135C70]" />
                      <span className="font-semibold">{job.file_name}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-normal">
                      {job.file_size_kb} KB · Strategy: {job.matching_strategy}
                    </span>
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
                        Failed / Rolled Back
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 font-semibold text-[#0B2D45]">
                    {job.total_rows}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5 text-[10px]">
                      <span className="rounded bg-emerald-100 px-1.5 py-0.2 text-emerald-800 font-bold">
                        +{job.inserted_count} new
                      </span>
                      <span className="rounded bg-blue-100 px-1.5 py-0.2 text-blue-800 font-semibold">
                        {job.updated_count} updated
                      </span>
                      {job.failed_count > 0 && (
                        <span className="rounded bg-red-100 px-1.5 py-0.2 text-red-800 font-bold">
                          {job.failed_count} errors
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-500 text-[11px]">
                    <div>{new Date(job.created_at).toLocaleDateString()}</div>
                    <span className="text-[10px] text-slate-400">{job.uploaded_by}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => setSelectedJob(job)}
                      className="rounded p-1 text-slate-500 hover:bg-[#EAF7F7] hover:text-[#135C70]"
                      title="Inspect Job Log"
                    >
                      <Eye size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Import Details Inspection Modal */}
      {selectedJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-2xl border border-[#DCE6EB] bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between pb-4 border-b border-[#DCE6EB]">
              <div>
                <span className="rounded bg-[#EAF7F7] px-2 py-0.5 text-[10px] font-bold text-[#135C70]">
                  JOB REPORT #{selectedJob.id}
                </span>
                <h2 className="mt-1 text-lg font-bold text-[#0B2D45]">{selectedJob.file_name}</h2>
                <p className="text-xs text-slate-500">
                  Target Dataset: {selectedJob.dataset_type} · Uploaded by {selectedJob.uploaded_by}
                </p>
              </div>
              <button
                onClick={() => setSelectedJob(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
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

              <div>
                <p className="font-bold text-[#0B2D45]">Execution Diagnostics & Log Entries</p>
                <div className="mt-2 max-h-48 overflow-y-auto rounded-lg bg-slate-900 p-3 font-mono text-[11px] text-slate-200">
                  <p className="text-slate-400">[{selectedJob.created_at}] Ingestion started for {selectedJob.file_name}</p>
                  <p className="text-teal-400">[{selectedJob.created_at}] Schema validation passed: {selectedJob.dataset_type}</p>
                  <p className="text-slate-400">[{selectedJob.created_at}] Match key resolved to: {selectedJob.matching_strategy}</p>

                  {selectedJob.errors && selectedJob.errors.length > 0 ? (
                    selectedJob.errors.map((err, i) => (
                      <p key={i} className="text-rose-400 mt-1">
                        [!ERROR] {err}
                      </p>
                    ))
                  ) : (
                    <p className="text-emerald-400 mt-1">
                      [SUCCESS] All rows committed successfully. Updated_at triggers refreshed.
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end border-t border-[#DCE6EB] pt-4">
              <button
                onClick={() => setSelectedJob(null)}
                className="rounded-lg bg-[#0B2D45] px-4 py-2 text-xs font-bold text-white hover:bg-[#135C70]"
              >
                Close Report
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Multi-step Import Wizard Modal */}
      {isWizardOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-2xl border border-[#DCE6EB] bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between pb-4 border-b border-[#DCE6EB]">
              <div>
                <span className="rounded bg-[#EAF7F7] px-2 py-0.5 text-[10px] font-bold text-[#135C70]">
                  IMPORT WIZARD · STEP {step} OF 4
                </span>
                <h2 className="mt-1 text-xl font-bold text-[#0B2D45]">
                  {step === 1 && "1. Select Dataset & File"}
                  {step === 2 && "2. Column Mapping Verification"}
                  {step === 3 && "3. Row Preview & Validation Checks"}
                  {step === 4 && "4. Ingestion Confirmation"}
                </h2>
              </div>
              <button
                onClick={() => setIsWizardOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={18} />
              </button>
            </div>

            {/* Step 1: Dataset & File */}
            {step === 1 && (
              <div className="mt-5 space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-[#0B2D45]">Target Database Pack</label>
                  <div className="mt-2 grid grid-cols-2 gap-3">
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
                      <p className="mt-2 font-bold text-[#0B2D45]">DB1: Subcutaneous Database</p>
                      <p className="text-[11px] text-slate-500">Requires high-volume formulation & volume columns.</p>
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
                      <p className="mt-2 font-bold text-[#0B2D45]">DB2: Injectables Database</p>
                      <p className="text-[11px] text-slate-500">Requires broad injectable delivery fields.</p>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-[#0B2D45]">Upload Spreadsheet (CSV or XLSX)</label>
                  <div className="mt-2 flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#DCE6EB] p-8 text-center bg-[#F5F8FA]">
                    <UploadCloud size={32} className="text-[#135C70]" />
                    <p className="mt-2 font-semibold text-[#0B2D45]">
                      {fileName}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      File type: XLSX (340 KB) · Validated structure
                    </p>
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-[#DCE6EB]">
                  <button
                    onClick={() => setStep(2)}
                    className="flex items-center gap-1.5 rounded-lg bg-[#135C70] px-4 py-2 font-bold text-white hover:bg-[#0B3B48]"
                  >
                    <span>Proceed to Column Mapping</span>
                    <ChevronRight size={15} />
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Column Mapping */}
            {step === 2 && (
              <div className="mt-5 space-y-4 text-xs">
                <p className="text-slate-600">
                  Verify how spreadsheet headers map to the database schema for <strong>{selectedDataset}</strong>.
                </p>

                <div className="rounded-lg border border-[#DCE6EB] overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-[#F5F8FA] text-slate-600 font-semibold text-[10px] uppercase">
                      <tr>
                        <th className="p-2.5">Spreadsheet Header</th>
                        <th className="p-2.5">Schema Column</th>
                        <th className="p-2.5">Match Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#DCE6EB]">
                      <tr>
                        <td className="p-2.5 font-mono text-slate-700">&quot;Drug / Product&quot;</td>
                        <td className="p-2.5 font-bold text-[#0B2D45]">drug_name</td>
                        <td className="p-2.5 text-emerald-700 font-semibold">✓ Exact match</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-mono text-slate-700">&quot;Sponsor / Company&quot;</td>
                        <td className="p-2.5 font-bold text-[#0B2D45]">company</td>
                        <td className="p-2.5 text-emerald-700 font-semibold">✓ Exact match</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-mono text-slate-700">&quot;Delivery Technology&quot;</td>
                        <td className="p-2.5 font-bold text-[#0B2D45]">device_formulation</td>
                        <td className="p-2.5 text-emerald-700 font-semibold">✓ Mapped</td>
                      </tr>
                      {selectedDataset === "DB1" && (
                        <tr>
                          <td className="p-2.5 font-mono text-slate-700">&quot;Est SC Volume&quot;</td>
                          <td className="p-2.5 font-bold text-[#0B2D45]">est_sc_volume_ml</td>
                          <td className="p-2.5 text-emerald-700 font-semibold">✓ Mapped</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="flex justify-between pt-4 border-t border-[#DCE6EB]">
                  <button
                    onClick={() => setStep(1)}
                    className="rounded-lg border border-slate-200 px-3.5 py-2 font-semibold text-slate-600 hover:bg-slate-50"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => setStep(3)}
                    className="flex items-center gap-1.5 rounded-lg bg-[#135C70] px-4 py-2 font-bold text-white hover:bg-[#0B3B48]"
                  >
                    <span>Proceed to Row Preview</span>
                    <ChevronRight size={15} />
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Row Preview */}
            {step === 3 && (
              <div className="mt-5 space-y-4 text-xs">
                <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-emerald-900 flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-700" />
                  <span>Validation check passed: 24 rows parsed, 0 critical blocking errors.</span>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block font-bold text-[#0B2D45]">Duplicate Matching Key</label>
                    <select
                      value={matchingStrategy}
                      onChange={(e) => setMatchingStrategy(e.target.value as any)}
                      className="mt-1 w-full rounded-lg border border-[#DCE6EB] bg-white p-2 text-xs"
                    >
                      <option value="drug_name_company">Drug Name + Company (Recommended)</option>
                      <option value="compound_id">Unique Compound ID</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-[#0B2D45]">Import Mutation Mode</label>
                    <div className="mt-1 grid grid-cols-2 gap-3">
                      <label className="flex items-center gap-2 rounded-lg border border-slate-200 p-2.5 cursor-pointer hover:bg-slate-50">
                        <input
                          type="radio"
                          name="mode"
                          checked={importMode === "upsert"}
                          onChange={() => setImportMode("upsert")}
                        />
                        <span>Upsert (Update existing & insert new)</span>
                      </label>
                      <label className="flex items-center gap-2 rounded-lg border border-slate-200 p-2.5 cursor-pointer hover:bg-slate-50">
                        <input
                          type="radio"
                          name="mode"
                          checked={importMode === "insert_only"}
                          onChange={() => setImportMode("insert_only")}
                        />
                        <span>Insert Only (Skip duplicates)</span>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between pt-4 border-t border-[#DCE6EB]">
                  <button
                    onClick={() => setStep(2)}
                    className="rounded-lg border border-slate-200 px-3.5 py-2 font-semibold text-slate-600 hover:bg-slate-50"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => setStep(4)}
                    className="flex items-center gap-1.5 rounded-lg bg-[#135C70] px-4 py-2 font-bold text-white hover:bg-[#0B3B48]"
                  >
                    <span>Ready for Confirmation</span>
                    <ChevronRight size={15} />
                  </button>
                </div>
              </div>
            )}

            {/* Step 4: Confirmation */}
            {step === 4 && (
              <div className="mt-5 space-y-4 text-xs">
                <div className="rounded-xl border border-slate-200 bg-[#F5F8FA] p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-500">File to import:</span>
                    <span className="font-bold text-[#0B2D45]">{fileName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Target database:</span>
                    <span className="font-bold text-[#135C70]">{selectedDataset}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Matching strategy:</span>
                    <span className="font-semibold text-slate-700">{matchingStrategy}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Mode:</span>
                    <span className="font-semibold text-slate-700 uppercase">{importMode}</span>
                  </div>
                  <div className="flex justify-between border-t border-slate-200 pt-2 font-bold text-[#0B2D45]">
                    <span>Expected changes:</span>
                    <span>21 to insert, 3 to update</span>
                  </div>
                </div>

                <div className="flex justify-between pt-4 border-t border-[#DCE6EB]">
                  <button
                    onClick={() => setStep(3)}
                    disabled={isProcessing}
                    className="rounded-lg border border-slate-200 px-3.5 py-2 font-semibold text-slate-600 hover:bg-slate-50"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleExecuteImport}
                    disabled={isProcessing}
                    className="rounded-lg bg-[#135C70] px-5 py-2 font-bold uppercase tracking-wider text-white hover:bg-[#0B3B48] disabled:opacity-50"
                  >
                    {isProcessing ? "Processing batch transaction..." : "Commit Import"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
