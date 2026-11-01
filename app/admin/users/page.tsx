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
  X,
  Key,
  Copy,
  AlertCircle
} from "lucide-react";
import Link from "next/link";
import { useAdmin } from "@/components/admin/admin-context";
import { AccessRequest } from "@/app/admin/access-request-actions";
import { generateResetPasswordAction } from "@/app/admin/password-actions";

export default function AdminUsersPage() {
  const { accessRequests, approveAccessRequest, rejectAccessRequest } = useAdmin();

  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRequest, setSelectedRequest] = useState<AccessRequest | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectModalRequest, setRejectModalRequest] = useState<AccessRequest | null>(null);
  const [selectedDatabase, setSelectedDatabase] = useState<"DB1" | "DB2" | "both">("DB1");
  const [isLoading, setIsLoading] = useState(false);
  const [resetPasswordModal, setResetPasswordModal] = useState<AccessRequest | null>(null);
  const [generatedPassword, setGeneratedPassword] = useState<string | null>(null);
  const [passwordCopied, setPasswordCopied] = useState(false);
  const [passwordResetError, setPasswordResetError] = useState<string | null>(null);

  const filteredRequests = useMemo(() => {
    return accessRequests.filter((r) => {
      if (statusFilter !== "all" && r.status !== statusFilter) return false;

      if (searchQuery.trim() !== "") {
        const q = searchQuery.toLowerCase();
        const matchName = r.full_name.toLowerCase().includes(q);
        const matchEmail = r.email.toLowerCase().includes(q);
        const matchCompany = r.company_name.toLowerCase().includes(q);
        if (!matchName && !matchEmail && !matchCompany) return false;
      }

      return true;
    });
  }, [accessRequests, statusFilter, searchQuery]);

  const handleApprove = async (requestId: string, database: "DB1" | "DB2" | "both") => {
    setIsLoading(true);
    await approveAccessRequest(requestId, database);
    setIsLoading(false);
    if (selectedRequest?.id === requestId) {
      setSelectedRequest((prev) => (prev ? { ...prev, status: "approved", assigned_database: database } : null));
    }
  };

  const handleRejectConfirm = async () => {
    if (!rejectModalRequest) return;
    setIsLoading(true);
    await rejectAccessRequest(rejectModalRequest.id, rejectReason || "Declined during commercial verification");
    setIsLoading(false);
    if (selectedRequest?.id === rejectModalRequest.id) {
      setSelectedRequest((prev) => (prev ? { ...prev, status: "rejected", admin_notes: rejectReason } : null));
    }
    setRejectModalRequest(null);
    setRejectReason("");
  };

  const handleGenerateResetPassword = async (userId: string) => {
    setPasswordResetError(null);
    setGeneratedPassword(null);
    setIsLoading(true);

    try {
      const result = await generateResetPasswordAction(userId);
      if (result.success && result.data?.tempPassword) {
        setGeneratedPassword(result.data.tempPassword);
      } else {
        setPasswordResetError(result.error || "Failed to generate password");
      }
    } catch (err) {
      setPasswordResetError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyPassword = () => {
    if (generatedPassword) {
      navigator.clipboard.writeText(generatedPassword);
      setPasswordCopied(true);
      setTimeout(() => setPasswordCopied(false), 2000);
    }
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
                { id: "all", label: "All Requests", count: accessRequests.length },
                { id: "pending", label: "Pending", count: accessRequests.filter((r) => r.status === "pending").length },
                { id: "approved", label: "Approved", count: accessRequests.filter((r) => r.status === "approved").length },
                { id: "rejected", label: "Rejected", count: accessRequests.filter((r) => r.status === "rejected").length }
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
              {filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                    No requests match the selected status or query.
                  </td>
                </tr>
              ) : (
                filteredRequests.map((request) => (
                  <tr key={request.id} className="hover:bg-[#F5F8FA]/80 transition">
                    <td className="px-4 py-3 font-bold text-[#0B2D45]">
                      <div>{request.full_name}</div>
                      <span className="text-[10px] font-mono text-slate-400">{request.id}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-800">{request.company_name}</div>
                      <div className="text-[11px] text-slate-500">{request.email}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-block rounded px-2 py-0.5 text-[10px] font-bold uppercase bg-slate-100 text-slate-700">
                        Subscriber
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-block rounded-md bg-[#EAF7F7] px-2 py-0.5 text-[10px] font-bold text-[#135C70] border border-[#BCE1E4]">
                        Database Access
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {request.status === "approved" && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-800 border border-emerald-200">
                          <CheckCircle2 size={12} className="text-emerald-600" />
                          Approved
                        </span>
                      )}
                      {request.status === "pending" && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-800 border border-amber-200">
                          <Clock size={12} className="text-amber-600" />
                          Pending Review
                        </span>
                      )}
                      {request.status === "rejected" && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-rose-800 border border-rose-200">
                          <XCircle size={12} className="text-rose-600" />
                          Rejected
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-[11px]">
                      {new Date(request.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setSelectedRequest(request);
                            setIsDetailsOpen(true);
                          }}
                          className="rounded p-1 text-slate-500 hover:bg-[#EAF7F7] hover:text-[#135C70]"
                          title="View Request Details"
                        >
                          <Eye size={15} />
                        </button>

                        {request.status === "approved" && (
                          <button
                            onClick={() => {
                              setResetPasswordModal(request);
                              setGeneratedPassword(null);
                              setPasswordResetError(null);
                            }}
                            className="rounded p-1 text-slate-500 hover:bg-amber-50 hover:text-amber-700"
                            title="Reset User Password"
                          >
                            <Key size={15} />
                          </button>
                        )}

                        {request.status === "pending" && (
                          <>
                            <button
                              onClick={() => handleApprove(request.id, "DB1")}
                              disabled={isLoading}
                              className="rounded bg-blue-50 px-2 py-1 text-[11px] font-bold text-blue-800 hover:bg-blue-100 border border-blue-200 disabled:opacity-50"
                              title="Approve for DB1 only"
                            >
                              DB1
                            </button>
                            <button
                              onClick={() => handleApprove(request.id, "DB2")}
                              disabled={isLoading}
                              className="rounded bg-blue-50 px-2 py-1 text-[11px] font-bold text-blue-800 hover:bg-blue-100 border border-blue-200 disabled:opacity-50"
                              title="Approve for DB2 only"
                            >
                              DB2
                            </button>
                            <button
                              onClick={() => handleApprove(request.id, "both")}
                              disabled={isLoading}
                              className="rounded bg-emerald-50 px-2 py-1 text-[11px] font-bold text-emerald-800 hover:bg-emerald-100 border border-emerald-200 disabled:opacity-50"
                              title="Approve for both databases"
                            >
                              Both
                            </button>
                            <button
                              onClick={() => setRejectModalRequest(request)}
                              disabled={isLoading}
                              className="rounded bg-rose-50 px-2 py-1 text-[11px] font-semibold text-rose-800 hover:bg-rose-100 border border-rose-200 disabled:opacity-50"
                            >
                              Reject
                            </button>
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

      {/* Request Details Modal */}
      {isDetailsOpen && selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-[#DCE6EB] bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between pb-4 border-b border-[#DCE6EB]">
              <div>
                <span className="rounded bg-[#EAF7F7] px-2 py-0.5 text-[10px] font-bold text-[#135C70]">
                  REQUEST #{selectedRequest.id}
                </span>
                <h2 className="mt-1 text-xl font-bold text-[#0B2D45]">{selectedRequest.full_name}</h2>
                <p className="text-xs text-slate-500">{selectedRequest.company_name}</p>
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
                  <p className="mt-1 font-semibold text-[#0B2D45]">{selectedRequest.email}</p>
                </div>
                <div className="rounded-lg bg-[#F5F8FA] p-3">
                  <p className="text-[10px] uppercase font-bold text-slate-400">Current Status</p>
                  <p className="mt-1 font-semibold uppercase text-[#135C70]">{selectedRequest.status}</p>
                </div>
              </div>

              <div className="rounded-lg bg-[#F5F8FA] p-3">
                <p className="text-[10px] uppercase font-bold text-slate-400">Submitted Date</p>
                <p className="mt-1 font-bold text-[#0B2D45]">
                  {new Date(selectedRequest.created_at).toLocaleString()}
                </p>
              </div>

              {selectedRequest.status === "approved" && (
                <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3">
                  <p className="text-[10px] uppercase font-bold text-emerald-700">Approved Database(s)</p>
                  <p className="mt-1 font-bold text-emerald-900">
                    {selectedRequest.assigned_database?.toUpperCase()}
                  </p>
                  {selectedRequest.approved_at && (
                    <p className="text-[11px] text-emerald-600 mt-1">
                      Approved on {new Date(selectedRequest.approved_at).toLocaleString()}
                    </p>
                  )}
                </div>
              )}

              {selectedRequest.status === "rejected" && (
                <div className="rounded-lg bg-rose-50 border border-rose-200 p-3">
                  <p className="text-[10px] uppercase font-bold text-rose-700">Rejection Reason</p>
                  <p className="mt-1 text-rose-900">{selectedRequest.admin_notes || "No reason provided"}</p>
                  {selectedRequest.rejected_at && (
                    <p className="text-[11px] text-rose-600 mt-1">
                      Rejected on {new Date(selectedRequest.rejected_at).toLocaleString()}
                    </p>
                  )}
                </div>
              )}

              {selectedRequest.admin_notes && selectedRequest.status !== "rejected" && (
                <div className="rounded-lg border border-slate-200 bg-white p-3">
                  <p className="text-[10px] uppercase font-bold text-slate-400">Admin Notes</p>
                  <p className="mt-1 text-slate-700">{selectedRequest.admin_notes}</p>
                </div>
              )}
            </div>

            <div className="mt-6 flex items-center justify-between border-t border-[#DCE6EB] pt-4">
              <div></div>

              {selectedRequest.status === "pending" && (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleApprove(selectedRequest.id, "DB1")}
                    disabled={isLoading}
                    className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-bold text-white hover:bg-blue-700 disabled:opacity-50"
                  >
                    Approve DB1
                  </button>
                  <button
                    onClick={() => handleApprove(selectedRequest.id, "DB2")}
                    disabled={isLoading}
                    className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-bold text-white hover:bg-blue-700 disabled:opacity-50"
                  >
                    Approve DB2
                  </button>
                  <button
                    onClick={() => handleApprove(selectedRequest.id, "both")}
                    disabled={isLoading}
                    className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-bold text-white hover:bg-emerald-700 disabled:opacity-50"
                  >
                    Approve Both
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {rejectModalRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-red-200 bg-white p-6 shadow-2xl">
            <h3 className="text-base font-bold text-red-950">
              Reject Access Request
            </h3>
            <p className="mt-2 text-xs text-slate-600">
              Reject access request for <strong>{rejectModalRequest.full_name}</strong> (
              {rejectModalRequest.company_name}). User will be notified via email.
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
                onClick={() => setRejectModalRequest(null)}
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

      {/* Reset Password Modal */}
      {resetPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-amber-200 bg-white p-6 shadow-2xl">
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-amber-100 p-2">
                <Key size={18} className="text-amber-700" />
              </div>
              <div>
                <h3 className="font-bold text-amber-900">Reset User Password</h3>
                <p className="text-xs text-slate-500">{resetPasswordModal.full_name}</p>
              </div>
            </div>

            {passwordResetError && (
              <div className="mt-4 rounded-lg bg-red-50 border border-red-200 p-3">
                <p className="text-xs text-red-800">{passwordResetError}</p>
              </div>
            )}

            {generatedPassword ? (
              <div className="mt-4 space-y-3">
                <div className="rounded-lg bg-amber-50 border border-amber-200 p-4">
                  <p className="text-xs font-bold text-amber-900 mb-2">Temporary Password Generated</p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 rounded bg-white px-3 py-2 font-mono text-sm font-bold text-[#0B2D45] break-all">
                      {generatedPassword}
                    </code>
                    <button
                      onClick={handleCopyPassword}
                      className={`rounded-lg p-2 transition ${
                        passwordCopied
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-amber-100 text-amber-700 hover:bg-amber-200"
                      }`}
                      title="Copy to clipboard"
                    >
                      <Copy size={16} />
                    </button>
                  </div>
                  {passwordCopied && (
                    <p className="mt-2 text-xs text-emerald-700 font-semibold">✓ Copied to clipboard</p>
                  )}
                </div>

                <div className="rounded-lg bg-blue-50 border border-blue-200 p-3">
                  <p className="text-xs font-bold text-blue-900 mb-2 flex items-center gap-2">
                    <AlertCircle size={14} />
                    Important
                  </p>
                  <ul className="text-xs text-blue-800 space-y-1 list-disc list-inside">
                    <li>Share this password securely with the user</li>
                    <li>User must change it on their first login</li>
                    <li>This password will not be shown again</li>
                  </ul>
                </div>
              </div>
            ) : (
              <p className="mt-4 text-xs text-slate-600">
                Generate a temporary password that the user can use to log in. They will be required to set their own password on first login.
              </p>
            )}

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                onClick={() => {
                  setResetPasswordModal(null);
                  setGeneratedPassword(null);
                  setPasswordResetError(null);
                }}
                className="rounded-lg border border-slate-200 px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                {generatedPassword ? "Done" : "Cancel"}
              </button>
              {!generatedPassword && (
                <button
                  onClick={() => handleGenerateResetPassword(resetPasswordModal.id)}
                  disabled={isLoading}
                  className="rounded-lg bg-amber-600 px-4 py-2 text-xs font-bold text-white hover:bg-amber-700 disabled:opacity-50"
                >
                  {isLoading ? "Generating..." : "Generate Password"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
