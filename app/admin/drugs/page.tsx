"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  Pill,
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  Eye,
  X,
  ChevronLeft,
  ChevronRight,
  Database,
  Calendar,
  Layers,
  AlertTriangle,
  FileText,
  Building,
  Check,
  Link as LinkIcon
} from "lucide-react";
import { useAdmin } from "@/components/admin/admin-context";
import { AdminDrug } from "@/lib/admin-mock-data";
import { fetchDrugReferencesAction, createReferenceAction, deleteReferenceAction } from "@/app/admin/drug-actions";

export default function AdminDrugsPage() {
  const { drugs, addDrug, updateDrug, deleteDrug } = useAdmin();

  const [activeDataset, setActiveDataset] = useState<"DB1" | "DB2">("DB1");
  const [searchQuery, setSearchQuery] = useState("");
  const [phaseFilter, setPhaseFilter] = useState("all");
  const [routeFilter, setRouteFilter] = useState("all");

  // Modals state
  const [selectedDrug, setSelectedDrug] = useState<AdminDrug | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [deleteConfirmDrug, setDeleteConfirmDrug] = useState<AdminDrug | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // Filtered drugs
  const filteredDrugs = useMemo(() => {
    return drugs.filter((drug) => {
      if (drug.dataset_type !== activeDataset) return false;

      if (phaseFilter !== "all" && !drug.phase.toLowerCase().includes(phaseFilter.toLowerCase())) {
        return false;
      }

      if (routeFilter !== "all" && !drug.route.toLowerCase().includes(routeFilter.toLowerCase())) {
        return false;
      }

      if (searchQuery.trim() !== "") {
        const q = searchQuery.toLowerCase();
        const matchName = drug.drug_name.toLowerCase().includes(q);
        const matchCompany = drug.company.toLowerCase().includes(q);
        const matchIndication = drug.indication.toLowerCase().includes(q);
        const matchDevice = (drug.device_formulation || "").toLowerCase().includes(q);
        if (!matchName && !matchCompany && !matchIndication && !matchDevice) return false;
      }

      return true;
    });
  }, [drugs, activeDataset, phaseFilter, routeFilter, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredDrugs.length / pageSize));
  const paginatedDrugs = filteredDrugs.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Form states for Add / Edit
  const [formData, setFormData] = useState<Partial<AdminDrug>>({
    dataset_type: "DB1",
    drug_name: "",
    company: "",
    partner: "",
    route: "Subcutaneous",
    iv_shift_nce: "IV to SC Shift",
    type: "",
    device_formulation: "",
    dose: "",
    iv_dose_mg: "",
    sc_dose_mg: "",
    est_sc_volume_ml: "",
    frequency: "",
    phase: "Approved / Commercial",
    pharmacology: "",
    indication: "",
    field: "Oncology",
    entry_date: new Date().toISOString().split("T")[0]
  });

  const [isLoading, setIsLoading] = useState(false);
  const [drugReferences, setDrugReferences] = useState<any[]>([]);
  const [newReference, setNewReference] = useState("");

  const openAddModal = () => {
    setFormData({
      dataset_type: activeDataset,
      drug_name: "",
      company: "",
      partner: "",
      route: activeDataset === "DB1" ? "Subcutaneous" : "Subcutaneous Injectable",
      iv_shift_nce: activeDataset === "DB1" ? "IV to SC Shift" : undefined,
      type: "",
      device_formulation: "",
      dose: "",
      iv_dose_mg: "",
      sc_dose_mg: "",
      est_sc_volume_ml: "",
      frequency: "",
      phase: "Approved / Commercial",
      pharmacology: "",
      indication: "",
      field: "",
      entry_date: new Date().toISOString().split("T")[0]
    });
    setIsAddOpen(true);
  };

  const openEditModal = async (drug: AdminDrug) => {
    setSelectedDrug(drug);
    setFormData({ ...drug });
    setIsEditOpen(true);
    
    // Fetch references for this drug
    const refsResponse = await fetchDrugReferencesAction(drug.id);
    if (refsResponse.success) {
      setDrugReferences(refsResponse.data || []);
    }
  };

  const handleSaveAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.drug_name || !formData.company) return;

    setIsLoading(true);
    await addDrug({
      dataset_type: activeDataset,
      drug_name: formData.drug_name || "Untitled Compound",
      company: formData.company || "Unknown Company",
      partner: formData.partner || "",
      route: formData.route || (activeDataset === "DB1" ? "Subcutaneous" : "Injectable"),
      iv_shift_nce: activeDataset === "DB1" ? formData.iv_shift_nce : undefined,
      type: formData.type || "",
      device_formulation: formData.device_formulation || "",
      dose: formData.dose || "",
      iv_dose_mg: activeDataset === "DB1" ? formData.iv_dose_mg : undefined,
      sc_dose_mg: activeDataset === "DB1" ? formData.sc_dose_mg : undefined,
      est_sc_volume_ml: activeDataset === "DB1" ? formData.est_sc_volume_ml : undefined,
      frequency: formData.frequency || "",
      phase: formData.phase || "Investigational",
      pharmacology: formData.pharmacology || "",
      indication: formData.indication || "Unspecified",
      field: formData.field || "",
      entry_date: formData.entry_date || new Date().toISOString().split("T")[0],
      references: []
    });
    setIsLoading(false);
    setIsAddOpen(false);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDrug) return;

    setIsLoading(true);
    await updateDrug(selectedDrug.id, {
      ...formData,
      // preserve entry_date unless modified
      entry_date: formData.entry_date || selectedDrug.entry_date
    });
    setIsLoading(false);
    setIsEditOpen(false);
    setSelectedDrug(null);
  };

  const handleDelete = async () => {
    if (!deleteConfirmDrug) return;
    setIsLoading(true);
    await deleteDrug(deleteConfirmDrug.id);
    setIsLoading(false);
    setDeleteConfirmDrug(null);
  };

  const handleAddReference = async () => {
    if (!selectedDrug || !newReference.trim()) return;

    setIsLoading(true);
    const refResponse = await createReferenceAction(selectedDrug.id, {
      reference_value: newReference.trim(),
      reference_order: drugReferences.length + 1
    });

    if (refResponse.success) {
      setDrugReferences([...drugReferences, refResponse.data]);
      setNewReference("");
    }
    setIsLoading(false);
  };

  const handleRemoveReference = async (refId: string) => {
    setIsLoading(true);
    const response = await deleteReferenceAction(refId);
    if (response.success) {
      setDrugReferences(drugReferences.filter(r => r.id !== refId));
    }
    setIsLoading(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest text-[#42B7B9]">
            Pharma Intelligence Datasets
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-[#0B2D45] sm:text-3xl">
            Drug Record Management
          </h1>
          <p className="mt-1 text-xs text-[#637786]">
            Manage, verify, and curate individual drug entries for DB1 (Subcutaneous) and DB2 (Injectables).
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 rounded-lg bg-[#135C70] px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-sm hover:bg-[#0B3B48] transition"
        >
          <Plus size={15} />
          <span>Add New {activeDataset} Drug</span>
        </button>
      </div>

      {/* Dataset Switcher Tabs */}
      <div className="flex border-b border-[#DCE6EB] bg-white rounded-t-xl px-4 pt-3">
        <button
          onClick={() => {
            setActiveDataset("DB1");
            setCurrentPage(1);
          }}
          className={`flex items-center gap-2 pb-3 px-4 text-xs font-bold uppercase tracking-wider transition border-b-2 ${
            activeDataset === "DB1"
              ? "border-[#42B7B9] text-[#135C70]"
              : "border-transparent text-slate-400 hover:text-[#0B2D45]"
          }`}
        >
          <Pill size={16} />
          <span>DB1 · Subcutaneous Database ({drugs.filter((d) => d.dataset_type === "DB1").length})</span>
        </button>

        <button
          onClick={() => {
            setActiveDataset("DB2");
            setCurrentPage(1);
          }}
          className={`flex items-center gap-2 pb-3 px-4 text-xs font-bold uppercase tracking-wider transition border-b-2 ${
            activeDataset === "DB2"
              ? "border-[#42B7B9] text-[#135C70]"
              : "border-transparent text-slate-400 hover:text-[#0B2D45]"
          }`}
        >
          <Database size={16} />
          <span>DB2 · Injectable Database ({drugs.filter((d) => d.dataset_type === "DB2").length})</span>
        </button>
      </div>

      {/* Controls Bar: Search & Filters */}
      <div className="rounded-b-xl border border-t-0 border-[#DCE6EB] bg-white p-4 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder={`Search ${activeDataset} by drug, company, indication...`}
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full rounded-lg border border-[#DCE6EB] bg-[#F5F8FA] pl-9 pr-3.5 py-2 text-xs text-[#0B2D45] placeholder:text-slate-400 focus:border-[#42B7B9] focus:outline-none focus:bg-white"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <select
            value={phaseFilter}
            onChange={(e) => {
              setPhaseFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="rounded-lg border border-[#DCE6EB] bg-white px-3 py-2 text-xs font-medium text-[#0B2D45] focus:border-[#42B7B9]"
          >
            <option value="all">All Phases</option>
            <option value="Approved">Approved / Commercial</option>
            <option value="Phase 3">Phase 3</option>
            <option value="Phase 2">Phase 2</option>
            <option value="Registration">Under FDA Review / Registration</option>
          </select>

          <span className="text-xs text-slate-400 font-semibold pl-2">
            {filteredDrugs.length} matching {activeDataset} records
          </span>
        </div>
      </div>

      {/* Drugs Table */}
      <div className="overflow-hidden rounded-xl border border-[#DCE6EB] bg-white shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead className="bg-[#082236] text-white">
              <tr>
                <th className="px-4 py-3 font-semibold uppercase tracking-wider text-[10px]">Drug Name</th>
                <th className="px-4 py-3 font-semibold uppercase tracking-wider text-[10px]">Company / Partner</th>
                <th className="px-4 py-3 font-semibold uppercase tracking-wider text-[10px]">
                  {activeDataset === "DB1" ? "Shift / NCE" : "Route"}
                </th>
                <th className="px-4 py-3 font-semibold uppercase tracking-wider text-[10px]">
                  {activeDataset === "DB1" ? "Est. SC Volume" : "Device / Form"}
                </th>
                <th className="px-4 py-3 font-semibold uppercase tracking-wider text-[10px]">Phase</th>
                <th className="px-4 py-3 font-semibold uppercase tracking-wider text-[10px]">Indication</th>
                <th className="px-4 py-3 font-semibold uppercase tracking-wider text-[10px] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DCE6EB]">
              {paginatedDrugs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                    No {activeDataset} drug records match the current filters.
                  </td>
                </tr>
              ) : (
                paginatedDrugs.map((drug) => (
                  <tr key={drug.id} className="hover:bg-[#F5F8FA]/80 transition">
                    <td className="px-4 py-3 font-bold text-[#0B2D45]">
                      <div>{drug.drug_name}</div>
                      <span className="text-[10px] font-mono text-slate-400">{drug.id}</span>
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      <div className="font-medium">{drug.company}</div>
                      {drug.partner && (
                        <div className="text-[10px] text-teal-700 font-semibold">
                          Partner: {drug.partner}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {activeDataset === "DB1" ? (
                        <span className="inline-block rounded bg-teal-50 px-2 py-0.5 text-[10px] font-bold text-[#135C70] border border-teal-200">
                          {drug.iv_shift_nce || "IV to SC Shift"}
                        </span>
                      ) : (
                        <span className="text-slate-600">{drug.route}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {activeDataset === "DB1" ? (
                        <span className="font-semibold text-[#0B2D45]">{drug.est_sc_volume_ml || "—"}</span>
                      ) : (
                        <span className="line-clamp-1">{drug.device_formulation || "—"}</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-block rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-800">
                        {drug.phase}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600 max-w-[180px] truncate" title={drug.indication}>
                      {drug.indication}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setSelectedDrug(drug);
                            setIsViewOpen(true);
                          }}
                          className="rounded p-1 text-slate-500 hover:bg-[#EAF7F7] hover:text-[#135C70]"
                          title="View Details"
                        >
                          <Eye size={15} />
                        </button>
                        <button
                          onClick={() => openEditModal(drug)}
                          className="rounded p-1 text-slate-500 hover:bg-slate-100 hover:text-[#0B2D45]"
                          title="Edit Drug"
                        >
                          <Edit size={15} />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmDrug(drug)}
                          className="rounded p-1 text-slate-500 hover:bg-red-50 hover:text-red-600"
                          title="Delete Drug"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination footer */}
        <div className="flex items-center justify-between border-t border-[#DCE6EB] px-4 py-3 text-xs text-slate-500">
          <span>
            Showing {Math.min(filteredDrugs.length, (currentPage - 1) * pageSize + 1)} to{" "}
            {Math.min(filteredDrugs.length, currentPage * pageSize)} of {filteredDrugs.length} records
          </span>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="rounded p-1 border border-slate-200 hover:bg-slate-50 disabled:opacity-40"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="px-2 font-semibold text-[#0B2D45]">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="rounded p-1 border border-slate-200 hover:bg-slate-50 disabled:opacity-40"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* View Details Drawer/Modal */}
      {isViewOpen && selectedDrug && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-2xl border border-[#DCE6EB] bg-white p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between pb-4 border-b border-[#DCE6EB]">
              <div>
                <span className="rounded bg-[#EAF7F7] px-2 py-0.5 text-[10px] font-bold text-[#135C70]">
                  {selectedDrug.dataset_type} RECORD
                </span>
                <h2 className="mt-1 text-xl font-bold text-[#0B2D45]">{selectedDrug.drug_name}</h2>
                <p className="text-xs text-slate-500">
                  {selectedDrug.company} {selectedDrug.partner ? `· Partner: ${selectedDrug.partner}` : ""}
                </p>
              </div>
              <button
                onClick={() => setIsViewOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4 text-xs">
              <div className="rounded-lg border border-slate-100 bg-[#F5F8FA] p-3">
                <p className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">Route of Administration</p>
                <p className="mt-1 font-semibold text-[#0B2D45]">{selectedDrug.route}</p>
              </div>

              <div className="rounded-lg border border-slate-100 bg-[#F5F8FA] p-3">
                <p className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">Phase of Development</p>
                <p className="mt-1 font-semibold text-[#0B2D45]">{selectedDrug.phase}</p>
              </div>

              {selectedDrug.dataset_type === "DB1" && (
                <>
                  <div className="rounded-lg border border-slate-100 bg-[#F5F8FA] p-3">
                    <p className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">Shift / NCE Category</p>
                    <p className="mt-1 font-semibold text-[#135C70]">{selectedDrug.iv_shift_nce || "—"}</p>
                  </div>

                  <div className="rounded-lg border border-slate-100 bg-[#F5F8FA] p-3">
                    <p className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">Estimated SC Volume</p>
                    <p className="mt-1 font-semibold text-[#0B2D45]">{selectedDrug.est_sc_volume_ml || "—"}</p>
                  </div>

                  <div className="rounded-lg border border-slate-100 bg-[#F5F8FA] p-3">
                    <p className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">SC Dose (mg)</p>
                    <p className="mt-1 font-semibold text-[#0B2D45]">{selectedDrug.sc_dose_mg || "—"}</p>
                  </div>

                  <div className="rounded-lg border border-slate-100 bg-[#F5F8FA] p-3">
                    <p className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">IV Dose (mg)</p>
                    <p className="mt-1 font-semibold text-[#0B2D45]">{selectedDrug.iv_dose_mg || "—"}</p>
                  </div>
                </>
              )}

              <div className="col-span-2 rounded-lg border border-slate-100 bg-[#F5F8FA] p-3">
                <p className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">Device & Formulation</p>
                <p className="mt-1 font-semibold text-[#0B2D45]">{selectedDrug.device_formulation || "Standard formulation"}</p>
              </div>

              <div className="col-span-2 rounded-lg border border-slate-100 bg-[#F5F8FA] p-3">
                <p className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">Clinical Indication</p>
                <p className="mt-1 font-semibold text-[#0B2D45]">{selectedDrug.indication}</p>
              </div>

              <div className="col-span-2 rounded-lg border border-slate-100 bg-[#F5F8FA] p-3">
                <p className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">Pharmacology & Mechanism</p>
                <p className="mt-1 text-slate-700">{selectedDrug.pharmacology || "—"}</p>
              </div>
            </div>

            {/* References */}
            {selectedDrug.references && selectedDrug.references.length > 0 && (
              <div className="mt-5 border-t border-[#DCE6EB] pt-4">
                <p className="text-xs font-bold uppercase tracking-wider text-[#0B2D45]">
                  Linked Citations & References ({selectedDrug.references.length})
                </p>
                <div className="mt-2 space-y-2">
                  {selectedDrug.references.map((ref) => (
                    <div key={ref.id} className="rounded-md border border-slate-200 bg-white p-2.5 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-[#0B2D45]">{ref.title}</span>
                        <span className="text-[10px] text-slate-400">{ref.year}</span>
                      </div>
                      <p className="text-[11px] text-[#135C70] font-medium">{ref.source}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-6 flex items-center justify-between border-t border-[#DCE6EB] pt-4 text-xs text-slate-400">
              <span>Entry Date: {selectedDrug.entry_date}</span>
              <button
                onClick={() => {
                  setIsViewOpen(false);
                  openEditModal(selectedDrug);
                }}
                className="rounded-lg bg-[#135C70] px-3.5 py-1.5 font-bold text-white hover:bg-[#0B3B48]"
              >
                Edit This Record
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Drug Modal */}
      {(isAddOpen || isEditOpen) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-2xl border border-[#DCE6EB] bg-white p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between pb-4 border-b border-[#DCE6EB]">
              <div>
                <span className="rounded bg-[#EAF7F7] px-2 py-0.5 text-[10px] font-bold text-[#135C70]">
                  {activeDataset} FORM
                </span>
                <h2 className="mt-1 text-xl font-bold text-[#0B2D45]">
                  {isAddOpen ? `Add New ${activeDataset} Drug Record` : `Edit ${formData.drug_name}`}
                </h2>
                <p className="text-xs text-slate-500">
                  {activeDataset === "DB1"
                    ? "Subcutaneous specific formulation fields (volume, shift, sc dose)."
                    : "Injectable specific catalog fields (no absent DB1 fields forced)."}
                </p>
              </div>
              <button
                onClick={() => {
                  setIsAddOpen(false);
                  setIsEditOpen(false);
                }}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={isAddOpen ? handleSaveAdd : handleSaveEdit} className="mt-5 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-[#0B2D45]">Drug / Compound Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.drug_name || ""}
                    onChange={(e) => setFormData({ ...formData, drug_name: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-[#DCE6EB] px-3 py-2 text-xs focus:border-[#42B7B9]"
                    placeholder="e.g. Trastuzumab Hylecta"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#0B2D45]">Company *</label>
                  <input
                    type="text"
                    required
                    value={formData.company || ""}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-[#DCE6EB] px-3 py-2 text-xs focus:border-[#42B7B9]"
                    placeholder="e.g. Roche / Genentech"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#0B2D45]">Partner / Delivery Platform</label>
                  <input
                    type="text"
                    value={formData.partner || ""}
                    onChange={(e) => setFormData({ ...formData, partner: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-[#DCE6EB] px-3 py-2 text-xs focus:border-[#42B7B9]"
                    placeholder="e.g. Halozyme / Enable Injections"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#0B2D45]">Phase of Development</label>
                  <select
                    value={formData.phase || "Approved / Commercial"}
                    onChange={(e) => setFormData({ ...formData, phase: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-[#DCE6EB] bg-white px-3 py-2 text-xs focus:border-[#42B7B9]"
                  >
                    <option value="Approved / Commercial">Approved / Commercial</option>
                    <option value="Registration / Under FDA Review">Registration / Under FDA Review</option>
                    <option value="Phase 3">Phase 3</option>
                    <option value="Phase 2">Phase 2</option>
                    <option value="Phase 1">Phase 1</option>
                  </select>
                </div>

                {activeDataset === "DB1" && (
                  <>
                    <div>
                      <label className="block font-bold text-[#0B2D45]">IV Shift vs. NCE</label>
                      <select
                        value={formData.iv_shift_nce || "IV to SC Shift"}
                        onChange={(e) =>
                          setFormData({ ...formData, iv_shift_nce: e.target.value as AdminDrug["iv_shift_nce"] })
                        }
                        className="mt-1 w-full rounded-lg border border-[#DCE6EB] bg-white px-3 py-2 text-xs focus:border-[#42B7B9]"
                      >
                        <option value="IV to SC Shift">IV to SC Shift</option>
                        <option value="NCE Subcutaneous">NCE Subcutaneous</option>
                        <option value="Primary Injectable">Primary Injectable</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-[#0B2D45]">Estimated SC Volume (mL)</label>
                      <input
                        type="text"
                        value={formData.est_sc_volume_ml || ""}
                        onChange={(e) => setFormData({ ...formData, est_sc_volume_ml: e.target.value })}
                        className="mt-1 w-full rounded-lg border border-[#DCE6EB] px-3 py-2 text-xs focus:border-[#42B7B9]"
                        placeholder="e.g. 5.0 mL or 15.0 mL"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-[#0B2D45]">SC Dose (mg)</label>
                      <input
                        type="text"
                        value={formData.sc_dose_mg || ""}
                        onChange={(e) => setFormData({ ...formData, sc_dose_mg: e.target.value })}
                        className="mt-1 w-full rounded-lg border border-[#DCE6EB] px-3 py-2 text-xs focus:border-[#42B7B9]"
                        placeholder="e.g. 600 mg"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-[#0B2D45]">IV Dose (mg)</label>
                      <input
                        type="text"
                        value={formData.iv_dose_mg || ""}
                        onChange={(e) => setFormData({ ...formData, iv_dose_mg: e.target.value })}
                        className="mt-1 w-full rounded-lg border border-[#DCE6EB] px-3 py-2 text-xs focus:border-[#42B7B9]"
                        placeholder="e.g. 8 mg/kg"
                      />
                    </div>
                  </>
                )}

                <div className="col-span-2">
                  <label className="block font-bold text-[#0B2D45]">Device & Formulation Details</label>
                  <input
                    type="text"
                    value={formData.device_formulation || ""}
                    onChange={(e) => setFormData({ ...formData, device_formulation: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-[#DCE6EB] px-3 py-2 text-xs focus:border-[#42B7B9]"
                    placeholder="e.g. Co-formulated with recombinant human hyaluronidase (rHuPH20)"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block font-bold text-[#0B2D45]">Clinical Indication</label>
                  <input
                    type="text"
                    value={formData.indication || ""}
                    onChange={(e) => setFormData({ ...formData, indication: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-[#DCE6EB] px-3 py-2 text-xs focus:border-[#42B7B9]"
                    placeholder="e.g. Multiple myeloma, Breast cancer"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block font-bold text-[#0B2D45]">Pharmacology / MoA</label>
                  <textarea
                    rows={2}
                    value={formData.pharmacology || ""}
                    onChange={(e) => setFormData({ ...formData, pharmacology: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-[#DCE6EB] px-3 py-2 text-xs focus:border-[#42B7B9]"
                    placeholder="e.g. CD38-directed cytolytic antibody"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#0B2D45]">Original Entry Date</label>
                  <input
                    type="date"
                    value={formData.entry_date || ""}
                    onChange={(e) => setFormData({ ...formData, entry_date: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-[#DCE6EB] px-3 py-2 text-xs focus:border-[#42B7B9]"
                  />
                </div>
              </div>

              {/* References Section */}
              {isEditOpen && selectedDrug && (
                <div className="mt-6 border-t border-[#DCE6EB] pt-4">
                  <div className="flex items-center justify-between mb-3">
                    <label className="block font-bold text-[#0B2D45] flex items-center gap-2">
                      <LinkIcon size={14} />
                      Linked Citations & References
                    </label>
                    <span className="text-xs text-slate-500">({drugReferences.length})</span>
                  </div>

                  {/* Reference List */}
                  {drugReferences.length > 0 && (
                    <div className="mb-4 max-h-48 overflow-y-auto rounded-lg border border-slate-200 bg-slate-50">
                      {drugReferences.map((ref, idx) => (
                        <div key={ref.id} className="flex items-center justify-between border-b border-slate-200 p-3 last:border-b-0 hover:bg-white transition">
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-[#0B2D45] truncate">{ref.reference_value}</p>
                            <p className="text-[10px] text-slate-500">Order: {ref.reference_order}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveReference(ref.id)}
                            disabled={isLoading}
                            className="ml-2 rounded p-1 text-slate-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                            title="Remove reference"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add Reference Input */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Add new reference (e.g., Clinical Trial XYZ, FDA Approval Document)"
                      value={newReference}
                      onChange={(e) => setNewReference(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          handleAddReference();
                        }
                      }}
                      className="flex-1 rounded-lg border border-[#DCE6EB] px-3 py-2 text-xs focus:border-[#42B7B9]"
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={handleAddReference}
                      disabled={isLoading || !newReference.trim()}
                      className="rounded-lg bg-[#42B7B9] px-3 py-2 text-xs font-bold text-white hover:bg-[#2a9a9d] disabled:opacity-50"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>
              )}

              <div className="mt-6 flex items-center justify-end gap-3 border-t border-[#DCE6EB] pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddOpen(false);
                    setIsEditOpen(false);
                    setDrugReferences([]);
                    setNewReference("");
                  }}
                  disabled={isLoading}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="rounded-lg bg-[#135C70] px-4 py-2 text-xs font-bold uppercase tracking-wider text-white hover:bg-[#0B3B48] disabled:opacity-50"
                >
                  {isLoading ? "Saving..." : isAddOpen ? "Create Drug Record" : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmDrug && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-red-200 bg-white p-6 shadow-2xl">
            <div className="flex items-center gap-3 text-red-600">
              <div className="rounded-full bg-red-100 p-2">
                <AlertTriangle size={20} />
              </div>
              <h3 className="text-base font-bold text-red-950">Confirm Drug Deletion</h3>
            </div>

            <p className="mt-3 text-xs text-slate-600">
              Are you sure you want to permanently delete{" "}
              <strong>{deleteConfirmDrug.drug_name}</strong> ({deleteConfirmDrug.id}) from the{" "}
              <strong>{deleteConfirmDrug.dataset_type}</strong> database?
            </p>

            <p className="mt-2 text-[11px] text-slate-500">
              This action cannot be undone. Associated reference rows will also be unlinked.
            </p>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                onClick={() => setDeleteConfirmDrug(null)}
                disabled={isLoading}
                className="rounded-lg border border-slate-200 px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isLoading}
                className="rounded-lg bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-700 disabled:opacity-50"
              >
                {isLoading ? "Deleting..." : "Delete Record"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
