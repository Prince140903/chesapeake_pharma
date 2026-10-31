import Link from "next/link";
import { ArrowLeft, Search } from "lucide-react";
import { DatasetBadge, PortalShell } from "@/components/portal-shell";
import { DrugRecord } from "@/lib/data";
import { fetchDrugsAction } from "@/app/admin/drug-actions";

export default async function DB2Page() {
  let records: DrugRecord[] = [];
  let error: string | null = null;

  try {
    const result = await fetchDrugsAction();
    if (result.success && result.data) {
      // Map AdminDrug to DrugRecord and filter by DB2
      records = result.data
        .filter(drug => drug.dataset_type === "DB2")
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
          pharmacology: drug.pharmacology || "Not specified"
        }));
    } else {
      error = result.error || "Failed to load records";
    }
  } catch (err) {
    error = err instanceof Error ? err.message : "Error loading records";
  }

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
        <div className="mt-6 flex gap-3 rounded-2xl border border-line bg-white p-4 shadow-card">
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
          <button className="button-primary">Search</button>
        </div>
        <div className="mt-5 overflow-hidden rounded-2xl border border-line bg-white shadow-card">
          <div className="grid grid-cols-[1.5fr_1fr_1fr_1fr_auto] gap-4 bg-navy px-5 py-4 text-[10px] font-bold uppercase tracking-[.12em] text-white">
            <span>Drug name</span>
            <span>Company</span>
            <span>Route</span>
            <span>Phase</span>
            <span />
          </div>
          {error ? (
            <div className="p-12 text-center text-sm text-red-600">
              {error}
            </div>
          ) : records.length === 0 ? (
            <div className="p-12 text-center text-sm text-muted">
              No records available.
            </div>
          ) : (
            records.map((record) => (
              <div
                key={record.id}
                className="grid grid-cols-[1.5fr_1fr_1fr_1fr_auto] gap-4 border-b border-line px-5 py-5 text-sm last:border-0"
              >
                <span className="font-bold text-navy">{record.name}</span>
                <span className="text-muted">{record.company}</span>
                <span className="text-muted">{record.route}</span>
                <span>
                  <span className="rounded-lg bg-canvas px-2 py-1 text-xs font-semibold text-navy">
                    {record.phase}
                  </span>
                </span>
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
