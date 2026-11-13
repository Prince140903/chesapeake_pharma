"use client";

import { X } from "lucide-react";
import { type DrugRecord } from "@/lib/data";

interface DrugDetailModalProps {
  drug: DrugRecord;
  onClose: () => void;
}

export function DrugDetailModal({ drug, onClose }: DrugDetailModalProps) {
  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
        <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white shadow-xl">
          {/* Header */}
          <div className="sticky top-0 border-b border-line bg-white p-6 flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold text-navy">{drug.name}</h2>
                <span className="rounded-full bg-teal/10 px-3 py-1 text-sm font-semibold text-teal">
                  {drug.dataset}
                </span>
              </div>
              <p className="mt-2 text-sm text-muted">{drug.company}</p>
            </div>
            <button
              onClick={onClose}
              className="grid h-9 w-9 place-items-center rounded-lg border border-line hover:bg-canvas"
            >
              <X size={18} />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-8">
            {/* Partner Information */}
            {drug.partner && (
              <div>
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">
                  Partner / Developer
                </h3>
                <p className="text-sm text-navy">{drug.partner}</p>
              </div>
            )}

            {/* Route & Administration */}
            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">
                  Route
                </h3>
                <p className="text-sm text-navy">{drug.route}</p>
              </div>
              <div>
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">
                  Frequency (Dosing Interval)
                </h3>
                <p className="text-sm text-navy">{drug.frequency || "Not specified"}</p>
              </div>
            </div>

            {/* Device & Volume */}
            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">
                  Device / Formulation
                </h3>
                <p className="text-sm text-navy">{drug.device}</p>
              </div>
              <div>
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">
                  Est SC Injection Volume (mL)
                </h3>
                <p className="text-sm text-navy">{drug.volume || "Not specified"}</p>
              </div>
            </div>

            {/* Phase & Type */}
            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">
                  Phase (Clinical Trial)
                </h3>
                <p className="text-sm text-navy">{drug.phase}</p>
              </div>
              <div>
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">
                  Type
                </h3>
                <p className="text-sm text-navy">{drug.type || "Not specified"}</p>
              </div>
            </div>

            {/* Indication & Therapy Area */}
            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">
                  Indication
                </h3>
                <p className="text-sm text-navy">{drug.indication}</p>
              </div>
              <div>
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">
                  Therapy Area (Field)
                </h3>
                <p className="text-sm text-navy">{drug.therapyArea}</p>
              </div>
            </div>

            {/* Pharmacology */}
            <div>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">
                Pharmacology
              </h3>
              <p className="text-sm text-navy leading-6">{drug.pharmacology}</p>
            </div>

            {/* Dose Information */}
            {drug.dose && (
              <div>
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">
                  Dose
                </h3>
                <p className="text-sm text-navy">{drug.dose}</p>
              </div>
            )}

            {/* References */}
            {drug.references && drug.references.length > 0 && (
              <div className="border-t border-line pt-6">
                <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted">
                  References & Citations ({drug.references.length})
                </h3>
                <div className="space-y-2">
                  {drug.references.map((ref, idx) => (
                    <div key={ref.id || idx} className="rounded border border-line bg-canvas p-3 text-sm">
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-medium text-navy">{ref.title}</span>
                        {ref.year && <span className="text-xs text-muted shrink-0">{ref.year}</span>}
                      </div>
                      {ref.source && ref.source !== "reference" && (
                        <p className="mt-1 text-xs text-teal">{ref.source}</p>
                      )}
                      {ref.url && (
                        <a
                          href={ref.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-1 inline-block text-xs text-teal underline hover:text-teal/80"
                        >
                          View Link
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="border-t border-line bg-canvas p-6 flex gap-3 justify-end">
            <button
              onClick={onClose}
              className="rounded-lg border border-line px-4 py-2 text-sm font-semibold text-navy hover:bg-white"
            >
              Close
            </button>
            <button className="rounded-lg bg-teal px-4 py-2 text-sm font-semibold text-white hover:bg-teal/90">
              View Full Profile
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
