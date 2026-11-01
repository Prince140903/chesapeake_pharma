"use client";

import { useState, useMemo, useEffect } from "react";
import { Search, ChevronDown, Download, X, ChevronLeft, ChevronRight } from "lucide-react";
import { PortalShell } from "@/components/portal-shell";
import { type DrugRecord } from "@/lib/data";
import { fetchPortalDrugsAction } from "@/app/admin/drug-actions";
import { DrugDetailModal } from "@/components/drug-detail-modal";

type FilterState = {
  volume: string;
  route: string;
  pharmacology: string;
  indication: string;
  therapyArea: string;
  type: string;
  phase: string;
  frequency: string;
  device: string;
  company: string;
};

const ITEMS_PER_PAGE = 10;

export default function PortalPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedDrug, setSelectedDrug] = useState<DrugRecord | null>(null);
  const [filters, setFilters] = useState<FilterState>({
    volume: "",
    route: "",
    pharmacology: "",
    indication: "",
    therapyArea: "",
    type: "",
    phase: "",
    frequency: "",
    device: "",
    company: "",
  });
  const [activeDataset, setActiveDataset] = useState<"All" | "DB1" | "DB2">(
    "All"
  );
  const [drugs, setDrugs] = useState<DrugRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch drugs from Supabase on component mount
  useEffect(() => {
    const loadDrugs = async () => {
      try {
        setLoading(true);
        const result = await fetchPortalDrugsAction();
        if (result.success && result.data) {
          const mapped = result.data.map((drug) => ({
            id: drug.id,
            dataset: drug.dataset_type as "DB1" | "DB2",
            name: drug.drug_name,
            company: drug.company,
            partner: drug.partner || "Not specified",
            route: drug.route,
            device: drug.device_formulation || "Not specified",
            dose: drug.dose || "Not specified",
            phase: drug.phase,
            indication: drug.indication,
            therapyArea: drug.field || "Not specified",
            frequency: drug.frequency || "Not specified",
            pharmacology: drug.pharmacology || "Not specified",
            volume: drug.est_sc_volume_ml || undefined,
            type: drug.type || "Not specified",
          }));
          setDrugs(mapped);
        } else {
          setError(result.error || "Failed to load drugs");
        }
      } catch (err) {
        console.error("Error loading drugs:", err);
        setError("Error loading drug database");
      } finally {
        setLoading(false);
      }
    };

    loadDrugs();
  }, []);

  // Filter and search logic
  const filteredDrugs = useMemo(() => {
    return drugs.filter((drug) => {
      // Dataset filter
      if (activeDataset !== "All" && drug.dataset !== activeDataset) {
        return false;
      }

      // Search term filter (searches name, company, indication)
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        if (
          !drug.name.toLowerCase().includes(term) &&
          !drug.company.toLowerCase().includes(term) &&
          !drug.indication.toLowerCase().includes(term)
        ) {
          return false;
        }
      }

      // Advanced filters
      if (
        filters.volume &&
        !(drug.volume && drug.volume.toLowerCase().includes(filters.volume.toLowerCase()))
      ) {
        return false;
      }
      if (
        filters.route &&
        !drug.route.toLowerCase().includes(filters.route.toLowerCase())
      ) {
        return false;
      }
      if (
        filters.pharmacology &&
        !drug.pharmacology.toLowerCase().includes(filters.pharmacology.toLowerCase())
      ) {
        return false;
      }
      if (
        filters.indication &&
        !drug.indication.toLowerCase().includes(filters.indication.toLowerCase())
      ) {
        return false;
      }
      if (
        filters.therapyArea &&
        !drug.therapyArea.toLowerCase().includes(filters.therapyArea.toLowerCase())
      ) {
        return false;
      }
      if (
        filters.type &&
        !(drug.type && drug.type.toLowerCase().includes(filters.type.toLowerCase()))
      ) {
        return false;
      }
      if (
        filters.phase &&
        !drug.phase.toLowerCase().includes(filters.phase.toLowerCase())
      ) {
        return false;
      }
      if (
        filters.frequency &&
        !(drug.frequency && drug.frequency.toLowerCase().includes(filters.frequency.toLowerCase()))
      ) {
        return false;
      }
      if (
        filters.device &&
        !drug.device.toLowerCase().includes(filters.device.toLowerCase())
      ) {
        return false;
      }
      if (
        filters.company &&
        !drug.company.toLowerCase().includes(filters.company.toLowerCase())
      ) {
        return false;
      }

      return true;
    });
  }, [searchTerm, filters, activeDataset, drugs]);

  // Pagination
  const totalPages = Math.ceil(filteredDrugs.length / ITEMS_PER_PAGE);
  const paginatedDrugs = useMemo(() => {
    const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredDrugs.slice(startIdx, startIdx + ITEMS_PER_PAGE);
  }, [filteredDrugs, currentPage]);

  const hasActiveFilters =
    Object.values(filters).some((v) => v !== "") || searchTerm;

  const handleResetFilters = () => {
    setSearchTerm("");
    setFilters({
      volume: "",
      route: "",
      pharmacology: "",
      indication: "",
      therapyArea: "",
      type: "",
      phase: "",
      frequency: "",
      device: "",
      company: "",
    });
    setCurrentPage(1);
  };

  const updateFilter = (key: keyof FilterState, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <PortalShell>
      <div className="min-h-screen bg-canvas">
        <div className="container-shell py-8">
          {/* Header */}
          <div className="mb-8">
            <p className="eyebrow">Drug Intelligence Portal</p>
            <h1 className="mt-3 text-4xl font-bold text-navy">
              Search & Discover Drugs
            </h1>
            <p className="mt-3 text-muted">
              Explore our comprehensive database of drug delivery systems and
              formulations.
            </p>
          </div>

          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={18} />
              <input
                type="text"
                placeholder="Search by compound, brand, sponsor, device, or route..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full rounded-lg border border-line bg-white py-3 pl-11 pr-4 text-navy placeholder-muted focus:border-teal focus:outline-none focus:ring-1 focus:ring-teal/50"
              />
            </div>
          </div>

          {/* Dataset Filter Tabs & Controls */}
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div className="flex gap-2">
              {(["All", "DB1", "DB2"] as const).map((dataset) => (
                <button
                  key={dataset}
                  onClick={() => {
                    setActiveDataset(dataset);
                    setCurrentPage(1);
                  }}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                    activeDataset === dataset
                      ? "bg-teal text-white"
                      : "border border-line bg-white text-navy hover:bg-canvas"
                  }`}
                >
                  {dataset === "All"
                    ? "All"
                    : dataset === "DB1"
                      ? "Subcutaneous (SubQ)"
                      : "Injectable"}
                </button>
              ))}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center gap-2 rounded-lg border border-line bg-white px-4 py-2 text-sm font-semibold text-navy hover:bg-canvas"
              >
                Advanced Search
                <ChevronDown
                  size={16}
                  className={`transition-transform ${
                    showAdvanced ? "rotate-180" : ""
                  }`}
                />
              </button>

              <button className="flex items-center gap-2 rounded-lg bg-teal px-4 py-2 text-sm font-semibold text-white hover:bg-teal/90">
                <Download size={16} />
                Download CSV
              </button>
            </div>
          </div>

          {/* Advanced Search Panel */}
          {showAdvanced && (
            <div className="mb-6 rounded-lg border border-line bg-white p-6 shadow-card">
              <h3 className="mb-4 text-sm font-semibold text-navy">Filter by:</h3>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                <div>
                  <label className="block text-xs font-semibold text-navy">
                    Est SC Injection Volume (mL)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., 0.5"
                    value={filters.volume}
                    onChange={(e) => updateFilter("volume", e.target.value)}
                    className="mt-2 w-full rounded border border-line px-3 py-2 text-sm focus:border-teal focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-navy">
                    Route
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., SC, IV"
                    value={filters.route}
                    onChange={(e) => updateFilter("route", e.target.value)}
                    className="mt-2 w-full rounded border border-line px-3 py-2 text-sm focus:border-teal focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-navy">
                    Pharmacology
                  </label>
                  <input
                    type="text"
                    placeholder="Search pharmacology"
                    value={filters.pharmacology}
                    onChange={(e) => updateFilter("pharmacology", e.target.value)}
                    className="mt-2 w-full rounded border border-line px-3 py-2 text-sm focus:border-teal focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-navy">
                    Indication
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Oncology"
                    value={filters.indication}
                    onChange={(e) => updateFilter("indication", e.target.value)}
                    className="mt-2 w-full rounded border border-line px-3 py-2 text-sm focus:border-teal focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-navy">
                    Therapy Area (Field)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Biologic"
                    value={filters.therapyArea}
                    onChange={(e) => updateFilter("therapyArea", e.target.value)}
                    className="mt-2 w-full rounded border border-line px-3 py-2 text-sm focus:border-teal focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-navy">
                    Type
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Small Molecule"
                    value={filters.type}
                    onChange={(e) => updateFilter("type", e.target.value)}
                    className="mt-2 w-full rounded border border-line px-3 py-2 text-sm focus:border-teal focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-navy">
                    Phase
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Phase III"
                    value={filters.phase}
                    onChange={(e) => updateFilter("phase", e.target.value)}
                    className="mt-2 w-full rounded border border-line px-3 py-2 text-sm focus:border-teal focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-navy">
                    Frequency (Dosing Interval)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Daily"
                    value={filters.frequency}
                    onChange={(e) => updateFilter("frequency", e.target.value)}
                    className="mt-2 w-full rounded border border-line px-3 py-2 text-sm focus:border-teal focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-navy">
                    Device/Formulation
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Autoinjector"
                    value={filters.device}
                    onChange={(e) => updateFilter("device", e.target.value)}
                    className="mt-2 w-full rounded border border-line px-3 py-2 text-sm focus:border-teal focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-navy">
                    Company Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Merck"
                    value={filters.company}
                    onChange={(e) => updateFilter("company", e.target.value)}
                    className="mt-2 w-full rounded border border-line px-3 py-2 text-sm focus:border-teal focus:outline-none"
                  />
                </div>
              </div>

              {hasActiveFilters && (
                <button
                  onClick={handleResetFilters}
                  className="mt-4 flex items-center gap-2 text-sm text-teal hover:text-teal/80"
                >
                  <X size={14} />
                  Clear all filters
                </button>
              )}
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="rounded-lg border-2 border-dashed border-line bg-canvas p-12 text-center">
              <div className="inline-block">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-line border-t-teal"></div>
              </div>
              <h3 className="mt-4 text-lg font-semibold text-navy">
                Loading drug database...
              </h3>
              <p className="mt-2 text-muted">
                Fetching data from Supabase
              </p>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
              <h3 className="text-lg font-semibold text-red-900">{error}</h3>
              <p className="mt-2 text-red-700">
                Please try again or contact support.
              </p>
            </div>
          )}

          {/* Results Count */}
          {!loading && !error && (
            <>
              <div className="mb-4 text-sm text-muted">
                Displaying{" "}
                <span className="font-semibold text-navy">
                  {filteredDrugs.length}
                </span>{" "}
                biopharmaceutical{" "}
                {filteredDrugs.length === 1 ? "record" : "records"}
              </div>

              {/* Drug Results */}
              {filteredDrugs.length > 0 ? (
                <>
                  <div className="mb-6 space-y-3">
                    {paginatedDrugs.map((drug) => (
                      <div
                        key={drug.id}
                        className="rounded-lg border border-line bg-white p-4 shadow-card hover:shadow-lg transition-shadow"
                      >
                        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="text-base font-bold text-navy">
                                {drug.name}
                              </h3>
                              <span className="rounded-full bg-teal/10 px-2 py-0.5 text-xs font-semibold text-teal">
                                {drug.dataset}
                              </span>
                            </div>
                            <p className="mt-1 text-sm text-muted">
                              {drug.company}
                            </p>
                          </div>
                          <button
                            onClick={() => setSelectedDrug(drug)}
                            className="rounded-lg bg-navy px-4 py-2 text-sm font-semibold text-white hover:bg-navy/90"
                          >
                            Inspect
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between rounded-lg bg-white p-4">
                      <div className="text-sm text-muted">
                        Page <span className="font-semibold text-navy">{currentPage}</span> of{" "}
                        <span className="font-semibold text-navy">{totalPages}</span>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1}
                          className="flex items-center gap-1 rounded-lg border border-line bg-white px-3 py-2 text-sm font-semibold text-navy disabled:opacity-50 disabled:cursor-not-allowed hover:bg-canvas"
                        >
                          <ChevronLeft size={16} />
                          Previous
                        </button>

                        <div className="flex gap-1">
                          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                            let pageNum;
                            if (totalPages <= 5) {
                              pageNum = i + 1;
                            } else if (currentPage <= 3) {
                              pageNum = i + 1;
                            } else if (currentPage >= totalPages - 2) {
                              pageNum = totalPages - 4 + i;
                            } else {
                              pageNum = currentPage - 2 + i;
                            }

                            return (
                              <button
                                key={pageNum}
                                onClick={() => handlePageChange(pageNum)}
                                className={`rounded px-2.5 py-1.5 text-sm font-semibold ${
                                  pageNum === currentPage
                                    ? "bg-teal text-white"
                                    : "border border-line bg-white text-navy hover:bg-canvas"
                                }`}
                              >
                                {pageNum}
                              </button>
                            );
                          })}
                        </div>

                        <button
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage === totalPages}
                          className="flex items-center gap-1 rounded-lg border border-line bg-white px-3 py-2 text-sm font-semibold text-navy disabled:opacity-50 disabled:cursor-not-allowed hover:bg-canvas"
                        >
                          Next
                          <ChevronRight size={16} />
                        </button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="rounded-lg border-2 border-dashed border-line bg-canvas p-12 text-center">
                  <Search className="mx-auto mb-4 text-muted/40" size={40} />
                  <h3 className="text-lg font-semibold text-navy">
                    No drugs found
                  </h3>
                  <p className="mt-2 text-muted">
                    Try adjusting your search or filters to find what you&apos;re
                    looking for.
                  </p>
                  {hasActiveFilters && (
                    <button
                      onClick={handleResetFilters}
                      className="mt-4 inline-block rounded-lg bg-teal px-4 py-2 text-sm font-semibold text-white hover:bg-teal/90"
                    >
                      Reset filters
                    </button>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Drug Detail Modal */}
      {selectedDrug && (
        <DrugDetailModal
          drug={selectedDrug}
          onClose={() => setSelectedDrug(null)}
        />
      )}
    </PortalShell>
  );
}
