"use client";
import Link from "next/link";
import {
  ArrowLeft,
  ChevronDown,
  Filter,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import { useMemo, useState, useEffect } from "react";
import {
  DatasetBadge,
  PortalShell,
} from "@/components/portal-shell";
import { DrugRecord } from "@/lib/data";
import { fetchDrugsAction } from "@/app/admin/drug-actions";

export default function DB1Page() {
  const [query, setQuery] = useState("");
  const [records, setRecords] = useState<DrugRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRecords = async () => {
      try {
        const result = await fetchDrugsAction();
        if (result.success && result.data) {
          // Map AdminDrug to DrugRecord and filter by DB1
          const mapped = result.data
            .filter(drug => drug.dataset_type === "DB1")
            .map(drug => ({
              id: drug.id,
              dataset: "DB1" as const,
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
              volume: drug.est_sc_volume_ml || undefined
            }));
          setRecords(mapped);
        }
      } catch (error) {
        console.error("Error loading DB1 records:", error);
      } finally {
        setLoading(false);
      }
    };

    loadRecords();
  }, []);

  const filteredRecords = useMemo(
    () =>
      records.filter(
        (record) =>
          `${record.name} ${record.company} ${record.route} ${record.device}`
            .toLowerCase()
            .includes(query.toLowerCase()),
      ),
    [query, records],
  );
  return (
    <PortalShell>
      <div className="container-shell py-10 lg:py-14">
        <Link
          href="/portal"
          className="inline-flex items-center gap-2 text-sm font-semibold text-muted hover:text-navy"
        >
          <ArrowLeft size={15} /> Dashboard
        </Link>
        <div className="mt-7 flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <DatasetBadge dataset="DB1" active />
            <h1 className="mt-4 text-4xl font-bold text-navy">
              Subcutaneous delivery search
            </h1>
            <p className="mt-3 text-muted">
              Dataset-specific search preview — private access is not connected.
            </p>
          </div>
          <span className="text-sm font-semibold text-muted">
            {loading ? "Loading..." : `${filteredRecords.length} results`}
          </span>
        </div>
        <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-line bg-white p-4 shadow-card md:flex-row">
          <div className="relative flex-1">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-muted"
              size={17}
            />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="input-control pl-11"
              placeholder="Search drug, company, route, device..."
            />
          </div>
          <button className="button-secondary gap-2">
            <Filter size={16} /> Filters <ChevronDown size={15} />
          </button>
          <button className="button-secondary gap-2">
            <SlidersHorizontal size={16} /> Sort
          </button>
        </div>
        <div className="mt-5 overflow-hidden rounded-2xl border border-line bg-white shadow-card">
          <div className="hidden grid-cols-[1.4fr_1fr_1fr_1.2fr_.8fr_auto] gap-5 bg-navy px-5 py-4 text-[10px] font-bold uppercase tracking-[.14em] text-white md:grid">
            <span>Drug / agent</span>
            <span>Company</span>
            <span>Route</span>
            <span>Device / formulation</span>
            <span>Phase</span>
            <span />
          </div>
          {loading ? (
            <div className="p-12 text-center text-sm text-muted">
              Loading records...
            </div>
          ) : filteredRecords.length === 0 ? (
            <div className="p-12 text-center text-sm text-muted">
              No results match this search.
            </div>
          ) : (
            filteredRecords.map((record) => (
              <div
                key={record.id}
                className="grid gap-4 border-b border-line px-5 py-5 last:border-0 md:grid-cols-[1.4fr_1fr_1fr_1.2fr_.8fr_auto] md:items-center md:gap-5"
              >
                <div>
                  <p className="font-bold text-navy">{record.name}</p>
                  <p className="mt-1 text-xs text-muted">Dose: {record.dose}</p>
                </div>
                <div className="text-sm text-muted">
                  <span className="mr-2 font-semibold text-navy md:hidden">
                    Company:
                  </span>
                  {record.company}
                </div>
                <div className="text-sm text-muted">
                  <span className="mr-2 font-semibold text-navy md:hidden">
                    Route:
                  </span>
                  {record.route}
                </div>
                <div className="text-sm text-muted">
                  <span className="mr-2 font-semibold text-navy md:hidden">
                    Device:
                  </span>
                  {record.device}
                </div>
                <div>
                  <span className="rounded-lg bg-canvas px-2 py-1 text-xs font-semibold text-navy">
                    {record.phase}
                  </span>
                </div>
                <Link
                  href={`/portal/db1/${record.id}`}
                  className="text-sm font-bold text-teal hover:text-navy"
                >
                  Inspect →
                </Link>
              </div>
            ))
          )}
        </div>
      </div>
    </PortalShell>
  );
}
