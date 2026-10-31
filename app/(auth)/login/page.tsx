"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, KeyRound } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { StatusLine } from "@/components/ui";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (!email.trim()) {
      setError("Please enter your email");
      return;
    }
    if (!email.includes("@")) {
      setError("Please enter a valid email address");
      return;
    }
    if (!password.trim()) {
      setError("Please enter your password");
      return;
    }

    setIsLoading(true);

    try {
      const supabase = createClient();
      if (!supabase) {
        setError("Supabase not configured");
        return;
      }

      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (authError) {
        setError(authError.message || "Invalid email or password");
        return;
      }

      if (data.user) {
        setMessage("Successfully signed in! Redirecting...");
        // Redirect to portal
        setTimeout(() => {
          window.location.href = "/portal";
        }, 1000);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-[480px] rounded-[28px] border border-line bg-white p-7 shadow-soft sm:p-9">
      <div className="grid h-12 w-12 place-items-center rounded-2xl bg-navy text-teal">
        <KeyRound size={22} />
      </div>

      <p className="eyebrow mt-7">Chesapeake Pharma portal</p>
      <h1 className="mt-3 text-3xl font-bold text-navy">Client login</h1>
      <p className="mt-3 text-sm leading-6 text-muted">
        Sign in with your approved account credentials to access the drug database.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 grid gap-4">
        {error && (
          <StatusLine type="error">
            <span>{error}</span>
          </StatusLine>
        )}

        {message && (
          <StatusLine type="success">
            <span>{message}</span>
          </StatusLine>
        )}

        <div>
          <label htmlFor="email" className="block text-sm font-semibold text-navy mb-2">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@company.com"
            className="input-control w-full"
            disabled={isLoading}
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-semibold text-navy mb-2">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="input-control w-full"
            disabled={isLoading}
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="button-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "Signing in..." : "Sign in"}
        </button>
      </form>

      <div className="mt-7 flex items-center justify-between border-t border-line pt-5 text-sm">
        <Link href="/" className="inline-flex items-center gap-2 font-semibold text-muted hover:text-navy">
          <ArrowLeft size={14} /> Public website
        </Link>
        <Link href="/register" className="font-semibold text-navy hover:text-teal">
          Request access
        </Link>
      </div>
    </div>
  );
}
