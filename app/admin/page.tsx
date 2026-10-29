"use client";

import React from "react";
import Link from "next/link";
import {
  Pill,
  Users,
  CreditCard,
  FileSpreadsheet,
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Database,
  Calendar,
  ExternalLink,
  ChevronRight
} from "lucide-react";
import { useAdmin } from "@/components/admin/admin-context";

export default function AdminDashboardPage() {
  const { drugs, users, subscriptions, imports, approveUser, rejectUser } = useAdmin();

  // Metrics calculations from state
  const totalDb1 = drugs.filter((d) => d.dataset_type === "DB1").length;
  const totalDb2 = drugs.filter((d) => d.dataset_type === "DB2").length;
  const pendingUsers = users.filter((u) => u.approval_status === "pending").length;
  const activeDb1Subs = subscriptions.filter(
    (s) => s.dataset_type === "DB1" && s.status === "active"
  ).length;
  const activeDb2Subs = subscriptions.filter(
    (s) => s.dataset_type === "DB2" && s.status === "active"
  ).length;

  // Expiring soon: within ~60 days (or simulated)
  const expiringSoonCount = subscriptions.filter((s) => {
    if (s.status !== "active") return false;
    const expiry = new Date(s.expires_at).getTime();
    const now = new Date("2026-10-26").getTime();
    const diffDays = (expiry - now) / (1000 * 3600 * 24);
    return diffDays > 0 && diffDays <= 60;
  }).length;

  const recentImports = imports.slice(0, 3);
  const pendingRequestsList = users.filter((u) => u.approval_status === "pending").slice(0, 4);

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest text-[#42B7B9]">
            Chesapeake Pharma Operations
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-[#0B2D45] sm:text-3xl">
            Administrator Dashboard
          </h1>
          <p className="mt-1 text-xs text-[#637786]">
            Operational command center for drug datasets, customer access, and annual subscriptions.
          </p>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total DB1 */}
        <div className="rounded-xl border border-[#DCE6EB] bg-white p-5 shadow-card hover:border-[#42B7B9]/40 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#637786]">DB1 Subcutaneous</span>
            <span className="rounded bg-[#EAF7F7] p-1.5 text-[#135C70]">
              <Pill size={16} />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-[#0B2D45]">{totalDb1}</span>
            <span className="text-[11px] font-medium text-slate-500">records</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs border-t border-[#DCE6EB] pt-3">
            <span className="text-slate-500 text-[11px]">High-volume delivery</span>
            <Link
              href="/admin/drugs"
              className="font-bold text-[#135C70] hover:text-[#42B7B9] flex items-center gap-1"
            >
              Manage <ArrowRight size={12} />
            </Link>
          </div>
        </div>

        {/* Total DB2 */}
        <div className="rounded-xl border border-[#DCE6EB] bg-white p-5 shadow-card hover:border-[#42B7B9]/40 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#637786]">DB2 Injectables</span>
            <span className="rounded bg-[#EAF7F7] p-1.5 text-[#135C70]">
              <Database size={16} />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-[#0B2D45]">{totalDb2}</span>
            <span className="text-[11px] font-medium text-slate-500">records</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs border-t border-[#DCE6EB] pt-3">
            <span className="text-slate-500 text-[11px]">Broad injectable assets</span>
            <Link
              href="/admin/drugs"
              className="font-bold text-[#135C70] hover:text-[#42B7B9] flex items-center gap-1"
            >
              Manage <ArrowRight size={12} />
            </Link>
          </div>
        </div>

        {/* Pending Requests */}
        <div className="rounded-xl border border-[#DCE6EB] bg-white p-5 shadow-card hover:border-[#42B7B9]/40 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#637786]">Pending Access Requests</span>
            <span className="rounded bg-amber-50 p-1.5 text-amber-700">
              <Users size={16} />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-[#0B2D45]">{pendingUsers}</span>
            <span className="text-[11px] font-medium text-amber-700 bg-amber-100/60 px-2 py-0.5 rounded-full">
              Needs review
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs border-t border-[#DCE6EB] pt-3">
            <span className="text-slate-500 text-[11px]">Unapproved users</span>
            <Link
              href="/admin/users"
              className="font-bold text-[#135C70] hover:text-[#42B7B9] flex items-center gap-1"
            >
              Review <ArrowRight size={12} />
            </Link>
          </div>
        </div>

        {/* Active Subscriptions */}
        <div className="rounded-xl border border-[#DCE6EB] bg-white p-5 shadow-card hover:border-[#42B7B9]/40 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#637786]">Active Subscriptions</span>
            <span className="rounded bg-[#EAF7F7] p-1.5 text-[#135C70]">
              <CreditCard size={16} />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-3">
            <div className="text-2xl font-extrabold text-[#0B2D45]">
              {activeDb1Subs + activeDb2Subs}
            </div>
            <span className="text-[10px] text-slate-500">
              (DB1: {activeDb1Subs} | DB2: {activeDb2Subs})
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs border-t border-[#DCE6EB] pt-3">
            <span className="text-amber-700 text-[11px] font-medium">
              {expiringSoonCount} expiring soon
            </span>
            <Link
              href="/admin/subscriptions"
              className="font-bold text-[#135C70] hover:text-[#42B7B9] flex items-center gap-1"
            >
              Manage <ArrowRight size={12} />
            </Link>
          </div>
        </div>
      </div>

      {/* Main Grid: Pending Approval Queue & Quick Operations */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Pending Requests Column (7 cols) */}
        <div className="lg:col-span-7 rounded-xl border border-[#DCE6EB] bg-white p-6 shadow-card">
          <div className="flex items-center justify-between pb-4 border-b border-[#DCE6EB]">
            <div>
              <h2 className="text-sm font-bold text-[#0B2D45]">Pending Customer Access Requests</h2>
              <p className="text-xs text-[#637786]">
                Verify organization and approve accounts. (Approval does not automatically activate subscriptions).
              </p>
            </div>
            <Link
              href="/admin/users"
              className="text-xs font-bold text-[#135C70] hover:text-[#42B7B9] flex items-center gap-1"
            >
              View all ({users.length}) <ChevronRight size={14} />
            </Link>
          </div>

          <div className="mt-4 divide-y divide-[#DCE6EB]">
            {pendingRequestsList.length === 0 ? (
              <p className="py-6 text-center text-xs text-slate-400">
                No pending customer requests at this time.
              </p>
            ) : (
              pendingRequestsList.map((user) => (
                <div key={user.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-[#0B2D45]">{user.full_name}</span>
                      <span className="rounded bg-[#EAF7F7] px-2 py-0.5 text-[10px] font-bold text-[#135C70]">
                        Wants {user.requested_packs}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 font-medium">{user.company_name}</p>
                    <p className="text-[11px] text-slate-400">{user.email}</p>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <button
                      onClick={() => approveUser(user.id)}
                      className="rounded-md bg-[#135C70] px-2.5 py-1 text-xs font-bold text-white hover:bg-[#0B3B48] transition"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => rejectUser(user.id, "Non-qualifying commercial profile")}
                      className="rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-600 hover:border-red-300 hover:text-red-700 transition"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Actions & Recent Imports Column (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Quick Actions */}
          <div className="rounded-xl border border-[#DCE6EB] bg-white p-6 shadow-card">
            <h2 className="text-sm font-bold text-[#0B2D45]">Administrative Actions</h2>
            <p className="text-xs text-[#637786]">Direct shortcuts to primary management tools.</p>

            <div className="mt-4 grid gap-2.5">
              <Link
                href="/admin/drugs"
                className="flex items-center justify-between rounded-lg border border-[#DCE6EB] p-3 text-xs font-semibold text-[#0B2D45] hover:border-[#42B7B9] hover:bg-[#EAF7F7]/50 transition"
              >
                <div className="flex items-center gap-2.5">
                  <Pill size={16} className="text-[#135C70]" />
                  <span>Browse & Edit Drug Database</span>
                </div>
                <ArrowRight size={14} className="text-slate-400" />
              </Link>

              <Link
                href="/admin/subscriptions"
                className="flex items-center justify-between rounded-lg border border-[#DCE6EB] p-3 text-xs font-semibold text-[#0B2D45] hover:border-[#42B7B9] hover:bg-[#EAF7F7]/50 transition"
              >
                <div className="flex items-center gap-2.5">
                  <CreditCard size={16} className="text-[#135C70]" />
                  <span>Issue 1-Year Subscription Pack</span>
                </div>
                <ArrowRight size={14} className="text-slate-400" />
              </Link>

              <Link
                href="/admin/imports"
                className="flex items-center justify-between rounded-lg border border-[#DCE6EB] p-3 text-xs font-semibold text-[#0B2D45] hover:border-[#42B7B9] hover:bg-[#EAF7F7]/50 transition"
              >
                <div className="flex items-center gap-2.5">
                  <FileSpreadsheet size={16} className="text-[#135C70]" />
                  <span>Upload Spreadsheet Import (CSV/XLSX)</span>
                </div>
                <ArrowRight size={14} className="text-slate-400" />
              </Link>
            </div>
          </div>

          {/* Recent Import Log */}
          <div className="rounded-xl border border-[#DCE6EB] bg-white p-6 shadow-card">
            <div className="flex items-center justify-between pb-3 border-b border-[#DCE6EB]">
              <h2 className="text-sm font-bold text-[#0B2D45]">Recent Import Jobs</h2>
              <Link
                href="/admin/imports"
                className="text-xs font-bold text-[#135C70] hover:text-[#42B7B9]"
              >
                History →
              </Link>
            </div>

            <div className="mt-3 space-y-3">
              {recentImports.map((job) => (
                <div key={job.id} className="text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-[#0B2D45] truncate max-w-[190px]">
                      {job.file_name}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${job.status === "completed"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-red-100 text-red-800"
                        }`}
                    >
                      {job.status.toUpperCase()}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500">
                    <span>{job.dataset_type} · {job.total_rows} rows</span>
                    <span>{job.inserted_count} added, {job.updated_count} updated</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
