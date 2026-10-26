"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Eye, EyeOff, Lock, AlertCircle, ShieldCheck, Loader2, ArrowRight, Database } from "lucide-react";
import { useAdmin } from "./admin-context";
import { signInAdminAction } from "@/app/admin/actions";
import { isSupabaseConfigured } from "@/lib/supabase/client";

export function AdminLoginCard() {
  const { loginAsAdmin } = useAdmin();
  const [email, setEmail] = useState("philgreen2236@hotmail.com");
  const [password, setPassword] = useState("Chesapeake2026!Secure");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const supabaseLive = isSupabaseConfigured();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      // 1. Try Server Action authentication with role verification
      const formData = new FormData();
      formData.append("email", email);
      formData.append("password", password);

      const serverResult = await signInAdminAction(null, formData);

      if (!serverResult.success) {
        setErrorMessage(serverResult.error || "Authentication failed. Access denied.");
        setIsLoading(false);
        return;
      }

      // 2. Sync client context
      await loginAsAdmin(email, password);
    } catch (err: any) {
      setErrorMessage(err?.message || "Failed to complete authentication request.");
    } finally {
      setIsLoading(false);
    }
  };

  const fillInvalidDemo = () => {
    setEmail("subscriber.test@novartis.com");
    setPassword("wrongpassword");
    setErrorMessage(null);
  };

  const fillSubscriberDemo = () => {
    setEmail("e.vance@novartis-pharma.com");
    setPassword("SubscriberPassword123!");
    setErrorMessage(null);
  };

  const fillAdminDemo = () => {
    setEmail("philgreen2236@hotmail.com");
    setPassword("Chesapeake2026!Secure");
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen bg-[#F5F8FA] flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8">
      {/* Security badge at top */}
      <div className="mb-6 flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-[#0B2D45] shadow-sm">
        <Lock size={13} className="text-[#42B7B9]" />
        <span>Restricted Area · Internal CMS Entrypoint</span>
      </div>

      <div className="w-full max-w-[460px] rounded-2xl border border-[#DCE6EB] bg-white p-7 sm:p-9 shadow-card">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center">
          <div className="relative mb-3 h-10 w-44">
            <Image
              src="/assets/chesapeake-wordmark-reference.png"
              alt="Chesapeake Pharma LLC"
              fill
              className="object-contain"
              priority
            />
          </div>
          <span className="inline-block rounded-md bg-[#0B2D45] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
            ADMINISTRATOR CMS
          </span>
          <h1 className="mt-4 text-2xl font-bold tracking-tight text-[#0B2D45]">
            Sign in to Chesapeake CMS
          </h1>
          <p className="mt-1.5 text-xs text-[#637786]">
            Enter authorized pharmaceutical administrator credentials.
          </p>
        </div>

        {/* Supabase Connection Status Badge */}
        <div className="mt-5 rounded-lg border border-teal-200 bg-[#EAF7F7] p-3 text-xs text-[#07546A]">
          <div className="flex items-start gap-2">
            <Database size={16} className="mt-0.5 shrink-0 text-[#289CA0]" />
            <div>
              <p className="font-bold">
                {supabaseLive ? "Supabase Auth Active (SSR)" : "Supabase SSR Configured · Awaiting .env Keys"}
              </p>
              <p className="mt-0.5 text-[11px] text-[#476375] leading-relaxed">
                {supabaseLive
                  ? "Live session refresh and server-side public.profiles role authorization enabled."
                  : "All SSR middleware and server actions are wired. Populate NEXT_PUBLIC_SUPABASE_URL to connect live project."}
              </p>
            </div>
          </div>
        </div>

        {/* Error message */}
        {errorMessage && (
          <div className="mt-4 flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-800 animate-in fade-in">
            <AlertCircle size={15} className="mt-0.5 shrink-0 text-red-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#0B2D45]">
              Administrator Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@chesapeakepharma.com"
              className="mt-1.5 w-full rounded-lg border border-[#DCE6EB] bg-white px-3.5 py-2.5 text-sm text-[#163449] placeholder:text-[#637786]/50 focus:border-[#42B7B9] focus:outline-none focus:ring-2 focus:ring-[#42B7B9]/20"
            />
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#0B2D45]">
                Password
              </label>
            </div>
            <div className="relative mt-1.5">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full rounded-lg border border-[#DCE6EB] bg-white px-3.5 py-2.5 pr-10 text-sm text-[#163449] placeholder:text-[#637786]/50 focus:border-[#42B7B9] focus:outline-none focus:ring-2 focus:ring-[#42B7B9]/20"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                tabIndex={-1}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-[#135C70] py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-sm transition hover:bg-[#0B3B48] disabled:opacity-60"
          >
            {isLoading ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                <span>Verifying credentials & role...</span>
              </>
            ) : (
              <>
                <span>Sign in to console</span>
                <ArrowRight size={14} />
              </>
            )}
          </button>
        </form>

        {/* Prototype Quick Test Buttons */}
        <div className="mt-6 border-t border-[#DCE6EB] pt-4">
          <p className="text-[11px] font-semibold text-slate-500">
            Phase 3 Test Cases:
          </p>
          <div className="mt-2 flex flex-wrap gap-2 text-xs">
            <button
              type="button"
              onClick={fillAdminDemo}
              className="rounded-md border border-teal-200 bg-[#EAF7F7] px-2.5 py-1 text-[11px] font-semibold text-[#135C70] hover:bg-teal-100"
            >
              Fill Admin Account
            </button>
            <button
              type="button"
              onClick={fillSubscriberDemo}
              className="rounded-md border border-amber-200 bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-800 hover:bg-amber-100"
            >
              Test Subscriber Login (Rejection)
            </button>
            <button
              type="button"
              onClick={fillInvalidDemo}
              className="rounded-md border border-red-200 bg-red-50 px-2.5 py-1 text-[11px] font-semibold text-red-800 hover:bg-red-100"
            >
              Test Invalid Password
            </button>
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-5 text-center text-[11px] text-slate-400">
          Strictly confidential. Unauthorized access is prohibited and monitored.
        </div>
      </div>
    </div>
  );
}
