"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Database,
  Filter,
  LockKeyhole,
  Table2,
} from "lucide-react";
import { SectionIntro } from "@/components/ui";
import { fetchDrugsAction } from "@/app/admin/drug-actions";

interface Drug {
  id: string;
  name: string;
  company: string;
  route: string;
  phase: string;
}

export default function DrugInsightsPage() {
  const [drugs, setDrugs] = useState<Drug[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDrugs = async () => {
      try {
        const result = await fetchDrugsAction();
        if (result.success && result.data) {
          setDrugs(result.data.slice(0, 3));
        } else {
          setError(result.error || "Failed to load drugs");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error loading drugs");
      } finally {
        setLoading(false);
      }
    };

    loadDrugs();
  }, []);

  return (
    <div className="container-shell py-20 lg:py-28">
      <SectionIntro
        eyebrow="Drug insights"
        title="A structured view of delivery complexity."
        text="The private database is intended to help approved teams compare delivery signals without losing the nuance behind each record."
        align="center"
      />
      <div className="mx-auto mt-14 grid max-w-4xl gap-4 md:grid-cols-3">
        {[
          {
            icon: Database,
            title: "Separate packs",
            text: "DB1 and DB2 remain independently entitled and date-tracked.",
          },
          {
            icon: Filter,
            title: "Relevant filters",
            text: "Dataset-specific fields keep search useful instead of generic.",
          },
          {
            icon: LockKeyhole,
            title: "Controlled access",
            text: "Approval, active subscription, and expiry are server-side concerns.",
          },
        ].map(({ icon: Icon, title, text }) => (
          <div
            key={title}
            className="rounded-2xl border border-line bg-white p-6 shadow-card"
          >
            <Icon className="text-teal" />
            <h3 className="mt-8 font-bold text-navy">{title}</h3>
            <p className="mt-3 text-sm leading-6 text-muted">{text}</p>
          </div>
        ))}
      </div>
      <div className="mx-auto mt-12 max-w-4xl overflow-hidden rounded-[26px] border border-line bg-white shadow-soft">
        <div className="flex items-center justify-between border-b border-line bg-canvas px-6 py-4">
          <div className="flex items-center gap-3">
            <Table2 size={18} className="text-teal" />
            <span className="text-sm font-bold text-navy">
              {loading ? "Loading database..." : "Latest drug insights"}
            </span>
          </div>
        </div>
        <div className="grid grid-cols-[1.2fr_1fr_1fr_.8fr] gap-4 px-6 py-4 text-[10px] font-bold uppercase tracking-[.12em] text-muted">
          <span>Drug / agent</span>
          <span>Company</span>
          <span>Route</span>
          <span>Phase</span>
        </div>
        {loading ? (
          <div className="px-6 py-8 text-center text-sm text-muted">
            Loading drug data...
          </div>
        ) : error ? (
          <div className="px-6 py-8 text-center text-sm text-red-600">
            {error}
          </div>
        ) : drugs.length === 0 ? (
          <div className="px-6 py-8 text-center text-sm text-muted">
            No drugs available. Submit an access request to see the full database.
          </div>
        ) : (
          drugs.map((drug) => (
            <div
              key={drug.id}
              className="grid grid-cols-[1.2fr_1fr_1fr_.8fr] gap-4 border-t border-line px-6 py-4 text-sm"
            >
              <span className="font-semibold text-navy">{drug.name}</span>
              <span className="text-muted">{drug.company}</span>
              <span className="text-muted">{drug.route}</span>
              <span className="text-muted">{drug.phase}</span>
            </div>
          ))
        )}
      </div>
      <div className="mt-12 text-center">
        <Link href="/register" className="button-primary gap-2">
          Request database access <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  );
}
