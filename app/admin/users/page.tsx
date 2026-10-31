"use client";

import React, { useState, useMemo } from "react";
import {
  Users,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  Shield,
  Eye,
  Building,
  Mail,
  Calendar,
  Layers,
  ArrowRight,
  X
} from "lucide-react";
import Link from "next/link";
import { useAdmin } from "@/components/admin/admin-context";
import { AdminUser } from "@/app/admin/user-actions";

export default function AdminUsersPage() {
  const { users, approveUser, rejectUser } = useAdmin();

  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectModalUser, setRejectModalUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      if (statusFilter !== "all" && u.approval_status !== statusFilter) return false;

      if (searchQuery.trim() !== "") {
        const q = searchQuery.toLowerCase();
        const matchName = u.full_name.toLowerCase().includes(q);
        const matchEmail = u.email.toLowerCase().includes(q);
        const matchCompany = u.company_name.toLowerCase().includes(q);
        if (!matchName && !matchEmail && !matchCompany) return false;
      }

      return true;
    });
  }, [users, statusFilter, searchQuery]);

  const handleApprove = async (userId: string) => {
    setIsLoading(true);
    await approveUser(userId);
    setIsLoading(false);
    if (selectedUser?.id === userId) {
      setSelectedUser((prev) => (prev ? { ...prev, approval_status: "approved" } : null));
    }
  };

  const handleRejectConfirm = async () => {
    if (!rejectModalUser) return;
    setIsLoading(true);
    await rejectUser(rejectModalUser.id, rejectReason || "Declined during commercial verification");
    setIsLoading(false);
    if (selectedUser?.id === rejectModalUser.id) {
      setSelectedUser((prev) => (prev ? { ...prev, approval_status: "rejected" } : null));
    }
    setRejectModalUser(null);
    setRejectReason("");
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest text-[#42B7B9]">
            Customer Access Verification
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-[#0B2D45] sm:text-3xl">
            User & Customer Management
          </h1>
          <p className="mt-1 text-xs text-[#637786]">
            Review incoming registration requests, verify pharmaceutical affiliations, and control platform roles.
          </p>
        </div>

        <div className="rounded-lg bg-teal-50 border border-teal-200 px-3 py-2 text-xs text-[#135C70] flex items-center gap-2">
          <Shield size={16} className="text-[#42B7B9] shrink-0" />
          <span>
            <strong>Separation of Concerns:</strong> Approving a user allows them to authenticate. Subscriptions are activated separately.
          </span>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="rounded-xl border border-[#DCE6EB] bg-white p-4 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          {/* Status Tabs */}
          <div className="flex flex-wrap gap-1.5 w-full sm:w-auto">
            {(
              [
                { id: "all", label: "All Users", count: users.length },
                { id: "pending", label: "Pending", count: users.filter((u) => u.approval_status === "pending").length },
                { id: "approved", label: "Approved", count: users.filter((u) => u.approval_status === "approved").length },
                { id: "rejected", label: "Rejected", count: users.filter((u) => u.approval_status === "rejected").length }
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                  statusFilter === tab.id
                    ? "bg-[#135C70] text-white font-bold"
                    : "bg-[#F5F8FA] text-slate-600 hover:bg-slate-200"
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`rounded-full px-1.5 py-0.2 text-[10px] ${
                    statusFilter === tab.id
                      ? "bg-white/20 text-white"
                      : "bg-slate-300 text-slate-800"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Search box */}
          <div className="relative w-full sm:w-72">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, email, company..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-[#DCE6EB] bg-[#F5F8FA] pl-9 pr-3.5 py-1.5 text-xs text-[#0B2D45] focus:border-[#42B7B9] focus:bg-white focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="overflow-hidden rounded-xl border border-[#DCE6EB] bg-white shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#082236] text-white">
              <tr>
                <th className="px-4 py-3 font-semibold uppercase tracking-wider text-[10px]">Customer Name</th>
                <th className="px-4 py-3 font-semibold uppercase tracking-wider text-[10px]">Company & Email</th>
                <th className="px-4 py-3 font-semibold uppercase tracking-wider text-[10px]">Role</th>
                <th className="px-4 py-3 font-semibold uppercase tracking-wider text-[10px]">Requested Access</th>
                <th className="px-4 py-3 font-semibold uppercase tracking-wider text-[10px]">Status</th>
                <th className="px-4 py-3 font-semibold uppercase tracking-wider text-[10px]">Joined Date</th>
                <th className="px-4 py-3 font-semibold uppercase tracking-wider text-[10px] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DCE6EB]">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                    No users match the selected status or query.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-[#F5F8FA]/80 transition">
                    <td className="px-4 py-3 font-bold text-[#0B2D45]">
                      <div className="flex items-center gap-2">
                        <span>{user.full_name}</span>
                        {user.role === "admin" && (
                          <span className="rounded bg-[#0B2D45] px-1.5 py-0.5 text-[9px] font-bold uppercase text-white">
                            ADMIN
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] font-mono text-slate-400">{user.id}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-800">{user.company_name}</div>
                      <div className="text-[11px] text-slate-500">{user.email}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block rounded px-2 py-0.5 text-[10px] font-bold uppercase ${
                          user.role === "admin"
                            ? "bg-slate-900 text-teal-300"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-block rounded-md bg-[#EAF7F7] px-2 py-0.5 text-[10px] font-bold text-[#135C70] border border-[#BCE1E4]">
                        {user.requested_packs}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {user.approval_status === "approved" && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-800 border border-emerald-200">
                          <CheckCircle2 size={12} className="text-emerald-600" />
                          Approved
                        </span>
                      )}
                      {user.approval_status === "pending" && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-800 border border-amber-200">
                          <Clock size={12} className="text-amber-600" />
                          Pending Review
                        </span>
                      )}
                      {user.approval_status === "rejected" && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-rose-800 border border-rose-200">
                          <XCircle size={12} className="text-rose-600" />
                          Rejected
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-[11px]">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setIsDetailsOpen(true);
                          }}
                          className="rounded p-1 text-slate-500 hover:bg-[#EAF7F7] hover:text-[#135C70]"
                          title="View Profile Details"
                        >
                          <Eye size={15} />
                        </button>

                        {user.role !== "admin" && (
                          <>
                            {user.approval_status !== "approved" && (
                              <button
                                onClick={() => handleApprove(user.id)}
                                disabled={isLoading}
                                className="rounded bg-emerald-50 px-2 py-1 text-[11px] font-bold text-emerald-800 hover:bg-emerald-100 border border-emerald-200 disabled:opacity-50"
                              >
                                {isLoading ? "..." : "Approve"}
                              </button>
                            )}

                            {user.approval_status !== "rejected" && (
                              <button
                                onClick={() => setRejectModalUser(user)}
                                disabled={isLoading}
                                className="rounded bg-rose-50 px-2 py-1 text-[11px] font-semibold text-rose-800 hover:bg-rose-100 border border-rose-200 disabled:opacity-50"
                              >
                                Reject
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Details Modal */}
      {isDetailsOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-[#DCE6EB] bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between pb-4 border-b border-[#DCE6EB]">
              <div>
                <span className="rounded bg-[#EAF7F7] px-2 py-0.5 text-[10px] font-bold text-[#135C70]">
                  USER PROFILE #{selectedUser.id}
                </span>
                <h2 className="mt-1 text-xl font-bold text-[#0B2D45]">{selectedUser.full_name}</h2>
                <p className="text-xs text-slate-500">{selectedUser.company_name}</p>
              </div>
              <button
                onClick={() => setIsDetailsOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-5 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-[#F5F8FA] p-3">
                  <p className="text-[10px] uppercase font-bold text-slate-400">Email Address</p>
                  <p className="mt-1 font-semibold text-[#0B2D45]">{selectedUser.email}</p>
                </div>
                <div className="rounded-lg bg-[#F5F8FA] p-3">
                  <p className="text-[10px] uppercase font-bold text-slate-400">Assigned Role</p>
                  <p className="mt-1 font-semibold uppercase text-[#135C70]">{selectedUser.role}</p>
                </div>
              </div>

              <div className="rounded-lg bg-[#F5F8FA] p-3">
                <p className="text-[10px] uppercase font-bold text-slate-400">Requested Database Access</p>
                <p className="mt-1 font-bold text-[#0B2D45]">
                  {selectedUser.requested_packs}
                </p>
                <p className="text-[11px] text-slate-500 mt-1">
                  Customer requested access to this dataset during the self-service request form.
                </p>
              </div>

              <div className="rounded-lg bg-[#F5F8FA] p-3">
                <p className="text-[10px] uppercase font-bold text-slate-400">Current Status</p>
                <p className="mt-1 font-bold capitalize text-[#0B2D45]">
                  {selectedUser.approval_status}
                </p>
              </div>

              {selectedUser.notes && (
                <div className="rounded-lg border border-slate-200 bg-white p-3">
                  <p className="text-[10px] uppercase font-bold text-slate-400">Internal Administrator Notes</p>
                  <p className="mt-1 text-slate-700">{selectedUser.notes}</p>
                </div>
              )}
            </div>

            <div className="mt-6 flex items-center justify-between border-t border-[#DCE6EB] pt-4">
              <Link
                href="/admin/subscriptions"
                className="text-xs font-bold text-[#135C70] hover:text-[#42B7B9] flex items-center gap-1"
              >
                Manage Subscriptions for this User <ArrowRight size={14} />
              </Link>

              {selectedUser.role !== "admin" && selectedUser.approval_status === "pending" && (
                <button
                  onClick={() => handleApprove(selectedUser.id)}
                  disabled={isLoading}
                  className="rounded-lg bg-[#135C70] px-4 py-2 text-xs font-bold text-white hover:bg-[#0B3B48] disabled:opacity-50"
                >
                  {isLoading ? "Approving..." : "Approve User"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {rejectModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-red-200 bg-white p-6 shadow-2xl">
            <h3 className="text-base font-bold text-red-950">
              Reject Registration Request
            </h3>
            <p className="mt-2 text-xs text-slate-600">
              Reject access request for <strong>{rejectModalUser.full_name}</strong> (
              {rejectModalUser.company_name}).
            </p>

            <div className="mt-4">
              <label className="block text-xs font-bold text-[#0B2D45]">
                Reason for Rejection / Internal Note
              </label>
              <textarea
                rows={3}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="e.g. Unverified corporate address, competitor conflict, or missing sponsorship."
                className="mt-1.5 w-full rounded-lg border border-[#DCE6EB] p-2.5 text-xs focus:border-red-400"
              />
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                onClick={() => setRejectModalUser(null)}
                disabled={isLoading}
                className="rounded-lg border border-slate-200 px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleRejectConfirm}
                disabled={isLoading}
                className="rounded-lg bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-700 disabled:opacity-50"
              >
                {isLoading ? "Rejecting..." : "Confirm Rejection"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
