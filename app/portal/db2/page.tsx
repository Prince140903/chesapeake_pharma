"use client";
import Link from "next/link";
import { ArrowLeft, Search } from "lucide-react";
import { useMemo, useState, useEffect } from "react";
import { DatasetBadge, PortalShell } from "@/components/portal-shell";
import { DrugRecord } from "@/lib/data";
import { fetchPortalDrugsAction } from "@/app/admin/drug-actions";

const DATE_FROM = "2026-10";

function formatMonthYear(dateStr: string | undefined | null): string {
  if (!dateStr) return "—";
  const yyyymm = dateStr.slice(0, 7);
  if (!yyyymm || yyyymm.length < 7) return "—";
  return new Date(yyyymm + "-01").toLocaleString("en-US", {
    month: "short",
    year: "numeric",
  });
}

function dateKey(dateStr: string | undefined | null): string {
  if (!dateStr) return "";
  return dateStr.slice(0, 7);
}

export default function DB2Page() {
  const [dateFilter, setDateFilter] = useState<string>("all");
  const [records, setRecords] = useState<DrugRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadRecords = async () => {
      try {
        setLoading(true);
        const result = await fetchPortalDrugsAction();
        if (result.success && result.data) {
          // Map AdminDrug to DrugRecord and filter by DB2
          // Only records from October 2026 onwards are displayed
          const mapped = result.data
            .filter(drug => drug.dataset_type === "DB2")
            .filter(drug => {
              const key = dateKey(drug.entry_date);
              return key && key >= DATE_FROM;
            })
            .map(drug => ({
              id: drug.id,
              dataset: "DB2" as const,
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
              entryDate: drug.entry_date
            }));
          setRecords(mapped);
        } else {
          setError(result.error || "Failed to load records");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error loading records");
      } finally {
        setLoading(false);
      }
    };

    loadRecords();
  }, []);

  const dateOptions = useMemo(() => {
    const map = new Map<string, string>();
    records.forEach((d) => {
      const key = dateKey(d.entryDate);
      if (key && key >= DATE_FROM) {
        map.set(formatMonthYear(d.entryDate), key);
      }
    });
    return Array.from(map.entries())
      .sort((a, b) => a[1].localeCompare(b[1]))
      .map(([label, key]) => ({ label, key }));
  }, [records]);

  return (
    <PortalShell>
      <div className="container-shell py-10 lg:py-14">
        <Link
          href="/portal"
          className="inline-flex items-center gap-2 text-sm font-semibold text-muted hover:text-navy"
        >
          <ArrowLeft size={15} /> Dashboard
        </Link>
        <div className="mt-7">
          <DatasetBadge dataset="DB2" active />
          <h1 className="mt-4 text-4xl font-bold text-navy">
            Injectable delivery search
          </h1>
          <p className="mt-3 text-muted">
            DB2 uses its own field set; no absent DB1 fields are implied.
          </p>
        </div>
        <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-line bg-white p-4 shadow-card md:flex-row md:items-center">
          <div className="relative flex-1">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-muted"
              size={17}
            />
            <input
              className="input-control pl-11"
              placeholder="Search drug, company, route, indication..."
            />
          </div>

          {dateOptions.length > 0 && (
            <div className="relative">
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="input-control text-sm"
              >
                <option value="all">All Dates</option>
                {dateOptions.map(({ label, key }) => (
                  <option key={label} value={key}>
                    {label}
                  </option>
                ))}
              </select>
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted/40 pointer-events-none">
                ▾
              </span>
            </div>
          )}

          <button className="button-primary">Search</button>
        </div>
        <div className="mt-5 overflow-hidden rounded-2xl border border-line bg-white shadow-card">
          <div className="grid grid-cols-[1.5fr_1fr_1fr_1fr_.8fr_auto] gap-4 bg-navy px-5 py-4 text-[10px] font-bold uppercase tracking-[.12em] text-white">
            <span>Drug name</span>
            <span>Company</span>
            <span>Route</span>
            <span>Phase</span>
            <span>Date</span>
            <span />
          </div>
          {loading ? (
            <div className="p-12 text-center text-sm text-muted">
              Loading records...
            </div>
          ) : error ? (
            <div className="p-12 text-center text-sm text-red-600">
              {error}
            </div>
          ) : records.length === 0 ? (
            <div className="p-12 text-center text-sm text-muted">
              No records available.
            </div>
          ) : (
            records.filter((record) => {
              if (dateFilter !== "all") {
                const key = dateKey(record.entryDate);
                return key === dateFilter;
              }
              return true;
            }).map((record) => (
              <div
                key={record.id}
                className="grid grid-cols-[1.5fr_1fr_1fr_1fr_.8fr_auto] gap-4 border-b border-line px-5 py-5 text-sm last:border-0"
              >
                <span className="font-bold text-navy">{record.name}</span>
                <span className="text-muted">{record.company}</span>
                <span className="text-muted">{record.route}</span>
                <span>
                  <span className="rounded-lg bg-canvas px-2 py-1 text-xs font-semibold text-navy">
                    {record.phase}
                  </span>
                </span>
                <span className="text-muted text-right">{formatMonthYear(record.entryDate)}</span>
                <Link
                  href={`/portal/db2/${record.id}`}
                  className="font-bold text-teal hover:text-navy"
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
