"use client";

import React, { useState, useMemo } from "react";
import {
  CreditCard,
  Search,
  Filter,
  Plus,
  Calendar,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Building,
  Mail,
  FileText,
  User,
  X,
  ArrowRight,
  ShieldAlert,
  RotateCcw
} from "lucide-react";
import { useAdmin } from "@/components/admin/admin-context";
import { AdminSubscription } from "@/lib/admin-mock-data";

export default function AdminSubscriptionsPage() {
  const { subscriptions, users, addSubscription, toggleSubscriptionStatus } = useAdmin();

  const [datasetFilter, setDatasetFilter] = useState<"all" | "DB1" | "DB2">("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "expired" | "deactivated">("all");
  const [searchQuery, setSearchQuery] = useState("");

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedSub, setSelectedSub] = useState<AdminSubscription | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // New Subscription Form State
  const defaultStartDate = new Date().toISOString().split("T")[0];
  const calc1YearExpiry = (startStr: string) => {
    try {
      const d = new Date(startStr);
      d.setFullYear(d.getFullYear() + 1);
      return d.toISOString().split("T")[0];
    } catch {
      return "";
    }
  };

  const calcRenewalDate = (startStr: string) => {
    try {
      const d = new Date(startStr);
      d.setFullYear(d.getFullYear() + 1);
      d.setDate(d.getDate() - 30); // 30 days prior
      return d.toISOString().split("T")[0];
    } catch {
      return "";
    }
  };

  const [formData, setFormData] = useState({
    user_id: "",
    dataset_type: "DB1" as "DB1" | "DB2",
    starts_at: defaultStartDate,
    expires_at: calc1YearExpiry(defaultStartDate),
    renewal_date: calcRenewalDate(defaultStartDate),
    payment_reference: "",
    admin_notes: ""
  });

  const handleStartDateChange = (val: string) => {
    setFormData((prev) => ({
      ...prev,
      starts_at: val,
      expires_at: calc1YearExpiry(val),
      renewal_date: calcRenewalDate(val)
    }));
  };

  const filteredSubscriptions = useMemo(() => {
    return subscriptions.filter((sub) => {
      if (datasetFilter !== "all" && sub.dataset_type !== datasetFilter) return false;
      if (statusFilter !== "all" && sub.status !== statusFilter) return false;

      if (searchQuery.trim() !== "") {
        const q = searchQuery.toLowerCase();
        const matchUser = sub.user_name.toLowerCase().includes(q);
        const matchEmail = sub.user_email.toLowerCase().includes(q);
        const matchCompany = sub.company_name.toLowerCase().includes(q);
        const matchRef = sub.payment_reference.toLowerCase().includes(q);
        if (!matchUser && !matchEmail && !matchCompany && !matchRef) return false;
      }

      return true;
    });
  }, [subscriptions, datasetFilter, statusFilter, searchQuery]);

  const handleCreateSubscription = async (e: React.FormEvent) => {
    e.preventDefault();
    const user = users.find((u) => u.id === formData.user_id);
    if (!user) return;

    setIsLoading(true);
    await addSubscription({
      user_id: user.id,
      user_name: user.full_name,
      user_email: user.email,
      company_name: user.company_name,
      dataset_type: formData.dataset_type,
      status: "active",
      starts_at: formData.starts_at,
      expires_at: formData.expires_at,
      renewal_date: formData.renewal_date,
      activated_by: "Admin",
      payment_reference: formData.payment_reference || `INV-${Date.now().toString().slice(-5)}`,
      admin_notes: formData.admin_notes || "Standard 1-year access agreement."
    });
    setIsLoading(false);
    setIsAddOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest text-[#42B7B9]">
            Client Entitlements & Licensing
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-[#0B2D45] sm:text-3xl">
            Subscription Management
          </h1>
          <p className="mt-1 text-xs text-[#637786]">
            DB1 (Subcutaneous) and DB2 (Injectables) are issued as separate 1-year subscriptions with independent enrollment and expiry timelines.
          </p>
        </div>

        <button
          onClick={() => {
            const approvedUsers = users.filter((u) => u.approval_status === "approved" && u.role !== "admin");
            setFormData({
              user_id: approvedUsers[0]?.id || "",
              dataset_type: "DB1",
              starts_at: defaultStartDate,
              expires_at: calc1YearExpiry(defaultStartDate),
              renewal_date: calcRenewalDate(defaultStartDate),
              payment_reference: "",
              admin_notes: ""
            });
            setIsAddOpen(true);
          }}
          className="inline-flex items-center gap-2 rounded-lg bg-[#135C70] px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-sm hover:bg-[#0B3B48] transition"
        >
          <Plus size={15} />
          <span>Grant New 1-Year Pack</span>
        </button>
      </div>

      {/* Rules Notice */}
      <div className="rounded-xl border border-teal-200 bg-[#EAF7F7] p-4 text-xs text-[#0B2D45]">
        <div className="flex items-start gap-3">
          <Calendar size={18} className="text-[#135C70] shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Independent Subscription Lifecycles:</span>
            <p className="mt-0.5 text-slate-600">
              A customer holding both DB1 and DB2 has two distinct subscription records. For example, DB1 may start on Jan 15, 2026 (expires Jan 15, 2027), while DB2 starts on Apr 1, 2026 (expires Apr 1, 2027). Each record tracks its own payment reference, audit notes, and expiration.
            </p>
          </div>
        </div>
      </div>

      {/* Filters and Search Bar */}
      <div className="rounded-xl border border-[#DCE6EB] bg-white p-4 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {/* Dataset Filter */}
          <select
            value={datasetFilter}
            onChange={(e) => setDatasetFilter(e.target.value as any)}
            className="rounded-lg border border-[#DCE6EB] bg-white px-3 py-1.5 text-xs font-semibold text-[#0B2D45] focus:border-[#42B7B9]"
          >
            <option value="all">All Datasets (DB1 & DB2)</option>
            <option value="DB1">DB1 Only (Subcutaneous)</option>
            <option value="DB2">DB2 Only (Injectables)</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="rounded-lg border border-[#DCE6EB] bg-white px-3 py-1.5 text-xs font-semibold text-[#0B2D45] focus:border-[#42B7B9]"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="expired">Expired</option>
            <option value="deactivated">Deactivated</option>
          </select>
        </div>

        <div className="relative w-full sm:w-72">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search company, user, payment ref..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-[#DCE6EB] bg-[#F5F8FA] pl-9 pr-3.5 py-1.5 text-xs text-[#0B2D45] focus:border-[#42B7B9] focus:bg-white focus:outline-none"
          />
        </div>
      </div>

      {/* Subscriptions Table */}
      <div className="overflow-hidden rounded-xl border border-[#DCE6EB] bg-white shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#082236] text-white">
              <tr>
                <th className="px-4 py-3 font-semibold uppercase tracking-wider text-[10px]">Customer / Organization</th>
                <th className="px-4 py-3 font-semibold uppercase tracking-wider text-[10px]">Dataset Pack</th>
                <th className="px-4 py-3 font-semibold uppercase tracking-wider text-[10px]">Status</th>
                <th className="px-4 py-3 font-semibold uppercase tracking-wider text-[10px]">Start Date</th>
                <th className="px-4 py-3 font-semibold uppercase tracking-wider text-[10px]">Expiry Date (1 Year)</th>
                <th className="px-4 py-3 font-semibold uppercase tracking-wider text-[10px]">Payment Reference</th>
                <th className="px-4 py-3 font-semibold uppercase tracking-wider text-[10px] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DCE6EB]">
              {filteredSubscriptions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                    No subscriptions match the selected criteria.
                  </td>
                </tr>
              ) : (
                filteredSubscriptions.map((sub) => {
                  const isExpiringSoon = (() => {
                    if (sub.status !== "active") return false;
                    const diffDays =
                      (new Date(sub.expires_at).getTime() - new Date("2026-10-26").getTime()) /
                      (1000 * 3600 * 24);
                    return diffDays > 0 && diffDays <= 60;
                  })();

                  return (
                    <tr key={sub.id} className="hover:bg-[#F5F8FA]/80 transition">
                      <td className="px-4 py-3 font-bold text-[#0B2D45]">
                        <div className="font-semibold">{sub.company_name}</div>
                        <div className="text-[11px] text-slate-500 font-normal">
                          {sub.user_name} ({sub.user_email})
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-block rounded-md px-2.5 py-1 text-[11px] font-bold ${
                            sub.dataset_type === "DB1"
                              ? "bg-teal-50 text-[#135C70] border border-teal-200"
                              : "bg-blue-50 text-blue-900 border border-blue-200"
                          }`}
                        >
                          {sub.dataset_type} · {sub.dataset_type === "DB1" ? "Subcutaneous" : "Injectable"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {sub.status === "active" && (
                          <div className="flex flex-col gap-0.5">
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-800 border border-emerald-200 w-fit">
                              <CheckCircle2 size={12} className="text-emerald-600" />
                              Active
                            </span>
                            {isExpiringSoon && (
                              <span className="text-[9px] font-bold text-amber-700">
                                Expiring within 60 days
                              </span>
                            )}
                          </div>
                        )}
                        {sub.status === "expired" && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700 border border-slate-300">
                            <Clock size={12} />
                            Expired
                          </span>
                        )}
                        {sub.status === "deactivated" && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-rose-800 border border-rose-200">
                            Deactivated
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-slate-700 font-medium">
                        {sub.starts_at}
                      </td>
                      <td className="px-4 py-3 font-semibold text-[#0B2D45]">
                        <div>{sub.expires_at}</div>
                        <span className="text-[10px] text-slate-400">
                          Renewal: {sub.renewal_date}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-mono text-slate-800 text-[11px] bg-slate-100 px-1.5 py-0.5 rounded">
                          {sub.payment_reference}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {sub.status === "active" ? (
                            <button
                              onClick={() => {
                                setIsLoading(true);
                                toggleSubscriptionStatus(sub.id, "deactivated").finally(() => setIsLoading(false));
                              }}
                              disabled={isLoading}
                              className="rounded bg-rose-50 px-2 py-1 text-[11px] font-semibold text-rose-800 hover:bg-rose-100 border border-rose-200 disabled:opacity-50"
                            >
                              Deactivate
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                setIsLoading(true);
                                toggleSubscriptionStatus(sub.id, "active").finally(() => setIsLoading(false));
                              }}
                              disabled={isLoading}
                              className="rounded bg-emerald-50 px-2 py-1 text-[11px] font-semibold text-emerald-800 hover:bg-emerald-100 border border-emerald-200 disabled:opacity-50"
                            >
                              Reactivate
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Grant New Subscription Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-[#DCE6EB] bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between pb-4 border-b border-[#DCE6EB]">
              <div>
                <span className="rounded bg-[#EAF7F7] px-2 py-0.5 text-[10px] font-bold text-[#135C70]">
                  ANNUAL LICENSING
                </span>
                <h2 className="mt-1 text-xl font-bold text-[#0B2D45]">Grant 1-Year Subscription Pack</h2>
                <p className="text-xs text-slate-500">
                  Activates dataset entitlement for an approved client account.
                </p>
              </div>
              <button
                onClick={() => setIsAddOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateSubscription} className="mt-5 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-[#0B2D45]">Select Approved Customer *</label>
                <select
                  required
                  value={formData.user_id}
                  onChange={(e) => setFormData({ ...formData, user_id: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-[#DCE6EB] bg-white px-3 py-2 text-xs focus:border-[#42B7B9]"
                >
                  <option value="">Select customer...</option>
                  {users
                    .filter((u) => u.approval_status === "approved" && u.role !== "admin")
                    .map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.full_name} ({u.company_name})
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-[#0B2D45]">Database Pack *</label>
                <select
                  value={formData.dataset_type}
                  onChange={(e) => setFormData({ ...formData, dataset_type: e.target.value as any })}
                  className="mt-1 w-full rounded-lg border border-[#DCE6EB] bg-white px-3 py-2 text-xs focus:border-[#42B7B9]"
                >
                  <option value="DB1">DB1 · Subcutaneous Intelligence Pack</option>
                  <option value="DB2">DB2 · Injectables Intelligence Pack</option>
                </select>
                <p className="mt-1 text-[11px] text-slate-400">
                  To give access to both, create one record for DB1 and a second record for DB2.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#0B2D45]">Start Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.starts_at}
                    onChange={(e) => handleStartDateChange(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-[#DCE6EB] px-3 py-2 text-xs focus:border-[#42B7B9]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#0B2D45]">Expiry Date (1 Year Auto-calc)</label>
                  <input
                    type="date"
                    required
                    value={formData.expires_at}
                    onChange={(e) => setFormData({ ...formData, expires_at: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-[#DCE6EB] px-3 py-2 text-xs bg-slate-50"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#0B2D45]">Payment / Wire Reference</label>
                <input
                  type="text"
                  placeholder="e.g. WIRE-PFZ-2026-001 or INV-78291"
                  value={formData.payment_reference}
                  onChange={(e) => setFormData({ ...formData, payment_reference: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-[#DCE6EB] px-3 py-2 text-xs focus:border-[#42B7B9]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#0B2D45]">Admin Notes / Agreement Terms</label>
                <textarea
                  rows={2}
                  placeholder="e.g. 1-Year enterprise access contract signed Oct 2026."
                  value={formData.admin_notes}
                  onChange={(e) => setFormData({ ...formData, admin_notes: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-[#DCE6EB] px-3 py-2 text-xs focus:border-[#42B7B9]"
                />
              </div>

              <div className="mt-6 flex items-center justify-end gap-3 border-t border-[#DCE6EB] pt-4">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  disabled={isLoading}
                  className="rounded-lg border border-slate-200 px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="rounded-lg bg-[#135C70] px-4 py-2 text-xs font-bold text-white hover:bg-[#0B3B48] disabled:opacity-50"
                >
                  {isLoading ? "Activating..." : "Activate Subscription"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
