"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Pill,
  Users,
  CreditCard,
  FileSpreadsheet,
  LogOut,
  Menu,
  X,
  ShieldCheck,
  Bell,
  CheckCircle2,
  AlertTriangle,
  Info,
  AlertCircle,
  ExternalLink,
  Lock
} from "lucide-react";
import { useAdmin } from "./admin-context";
import { AdminLoginCard } from "./admin-login-card";

interface AdminLayoutShellProps {
  children: React.ReactNode;
}

const navLinks = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/drugs", label: "Drug Management", icon: Pill },
  { href: "/admin/users", label: "User Management", icon: Users },
  { href: "/admin/subscriptions", label: "Subscription Management", icon: CreditCard },
  { href: "/admin/imports", label: "Import History", icon: FileSpreadsheet }
];

export function AdminLayoutShell({ children }: AdminLayoutShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, adminUser, logout, toggleAuthForReview, toasts, removeToast } = useAdmin();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // If unauthenticated, show the dedicated /admin login screen!
  if (!isAuthenticated) {
    return (
      <main>
        <AdminLoginCard />
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F8FA] text-[#163449] flex flex-col lg:flex-row font-sans">
      {/* Toast Notification Container */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 rounded-xl border p-4 shadow-xl transition-all animate-in slide-in-from-bottom-3 ${
              toast.type === "success"
                ? "bg-white border-emerald-200 text-emerald-950"
                : toast.type === "error"
                ? "bg-white border-red-200 text-red-950"
                : toast.type === "warning"
                ? "bg-white border-amber-200 text-amber-950"
                : "bg-white border-teal-200 text-teal-950"
            }`}
          >
            {toast.type === "success" && <CheckCircle2 size={18} className="text-emerald-600 shrink-0 mt-0.5" />}
            {toast.type === "error" && <AlertCircle size={18} className="text-red-600 shrink-0 mt-0.5" />}
            {toast.type === "warning" && <AlertTriangle size={18} className="text-amber-600 shrink-0 mt-0.5" />}
            {toast.type === "info" && <Info size={18} className="text-[#135C70] shrink-0 mt-0.5" />}

            <div className="flex-1 text-xs">
              <p className="font-bold">{toast.title}</p>
              {toast.message && <p className="mt-0.5 text-[#637786]">{toast.message}</p>}
            </div>

            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-slate-700 text-sm font-bold"
            >
              ×
            </button>
          </div>
        ))}
      </div>

      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 bg-[#082236] border-r border-[#133A58] z-30">
        {/* Sidebar Brand Header */}
        <div className="h-16 flex items-center px-6 border-b border-[#133A58] bg-[#061B2B]">
          <div className="flex items-center gap-3">
            <div className="relative h-7 w-32">
              <Image
                src="/assets/chesapeake-wordmark-reference.png"
                alt="Chesapeake Pharma"
                fill
                className="object-contain brightness-0 invert"
                priority
              />
            </div>
            <span className="rounded bg-[#135C70] px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white">
              CMS
            </span>
          </div>
        </div>

        {/* Navigation Section */}
        <div className="flex-1 flex flex-col justify-between overflow-y-auto px-3 py-6">
          <div className="space-y-1">
            <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-[#42B7B9]">
              Administration
            </p>
            {navLinks.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-xs font-semibold transition ${
                    isActive
                      ? "bg-[#135C70] text-white shadow-sm font-bold"
                      : "text-slate-300 hover:bg-[#0E314D] hover:text-white"
                  }`}
                >
                  <Icon
                    size={17}
                    className={isActive ? "text-[#42B7B9]" : "text-slate-400"}
                  />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Bottom Sidebar Panel */}
          <div className="pt-6 border-t border-[#133A58] space-y-3">
            {/* Authenticated Admin Info */}
            <div className="rounded-xl bg-[#0E314D] p-3 text-xs">
              <div className="flex items-center gap-2.5">
                <div className="grid h-8 w-8 place-items-center rounded-full bg-[#135C70] text-white font-bold text-xs">
                  PG
                </div>
                <div className="overflow-hidden">
                  <p className="truncate font-bold text-white text-[11px]">
                    {adminUser?.full_name || "Philip Green, Ph.D."}
                  </p>
                  <p className="truncate text-[10px] text-[#42B7B9] font-medium">
                    Verified Administrator
                  </p>
                </div>
              </div>
            </div>

            {/* Logout Action */}
            <button
              onClick={() => logout()}
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-semibold text-rose-300 hover:bg-rose-950/40 hover:text-rose-200 transition"
            >
              <LogOut size={16} />
              <span>Admin Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Top Bar */}
      <div className="lg:hidden flex items-center justify-between bg-[#082236] px-4 py-3 border-b border-[#133A58]">
        <div className="flex items-center gap-2">
          <div className="relative h-6 w-28">
            <Image
              src="/assets/chesapeake-wordmark-reference.png"
              alt="Chesapeake Pharma"
              fill
              className="object-contain brightness-0 invert"
            />
          </div>
          <span className="rounded bg-[#135C70] px-1.5 py-0.5 text-[9px] font-bold uppercase text-white">
            CMS
          </span>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="text-white p-1 rounded-md hover:bg-[#0E314D]"
          aria-label="Toggle mobile menu"
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#082236] border-b border-[#133A58] px-4 py-3 space-y-1">
          {navLinks.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-semibold ${
                  isActive
                    ? "bg-[#135C70] text-white"
                    : "text-slate-300 hover:bg-[#0E314D] hover:text-white"
                }`}
              >
                <Icon size={16} className={isActive ? "text-[#42B7B9]" : "text-slate-400"} />
                <span>{item.label}</span>
              </Link>
            );
          })}
          <div className="pt-2 border-t border-[#133A58]">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                logout();
              }}
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-semibold text-rose-300 hover:bg-rose-950/40"
            >
              <LogOut size={16} />
              <span>Admin Logout</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        {/* Top Header / Sub-navigation */}
        <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-[#DCE6EB] bg-white/95 px-4 sm:px-6 lg:px-8 backdrop-blur">
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-[#EAF7F7] px-2.5 py-1 text-[11px] font-bold text-[#135C70] border border-[#BCE1E4]">
              <ShieldCheck size={13} className="text-[#42B7B9]" />
              Internal Pharma CMS
            </span>
            <span className="text-xs text-[#637786]">
              Target: <code className="rounded bg-slate-100 px-1 py-0.5 text-slate-700">/admin</code>
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Quick switcher to preview Login Screen */}
            <button
              onClick={toggleAuthForReview}
              className="inline-flex items-center gap-1.5 rounded-md border border-[#DCE6EB] bg-slate-50 px-2.5 py-1 text-xs font-semibold text-[#0B2D45] hover:bg-slate-100 transition"
              title="Test the unauthenticated login screen"
            >
              <Lock size={12} className="text-[#42B7B9]" />
              <span>Preview /admin Login</span>
            </button>
          </div>
        </header>

        {/* Global Demo Mode Notification Banner */}
        <div className="border-b border-amber-200 bg-amber-50 px-4 py-2 sm:px-6 lg:px-8 text-xs text-amber-900 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-bold uppercase tracking-wider text-[10px] rounded bg-amber-200 text-amber-950 px-1.5 py-0.5">
              PHASE 2 MOCK DATA
            </span>
            <span>
              All numbers, customer requests, subscriptions, and drug records are interactive UI mock data. No live Supabase mutations occur.
            </span>
          </div>
          <span className="text-[11px] text-amber-800 font-medium hidden md:inline">
            Phase 3 Supabase connection will follow review
          </span>
        </div>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
