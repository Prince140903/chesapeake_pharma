"use client";

import { useState, useEffect } from "react";
import { Lock, CheckCircle2, AlertCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { setUserPasswordAction } from "@/app/admin/password-actions";
import { StatusLine } from "@/components/ui";

export default function SetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [passwordStrength, setPasswordStrength] = useState(0);

  // Check if user is logged in
  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient();
      if (!supabase) {
        setIsLoggedIn(false);
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsLoggedIn(false);
      }
    };

    checkAuth();
  }, []);

  // Calculate password strength
  useEffect(() => {
    let strength = 0;
    if (password.length >= 6) strength += 1;
    if (password.length >= 12) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[!@#$%^&*]/.test(password)) strength += 1;
    setPasswordStrength(strength);
  }, [password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (!password.trim()) {
      setError("Please enter a new password");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsLoading(true);

    try {
      const result = await setUserPasswordAction(password);

      if (!result.success) {
        setError(result.error || "Failed to update password");
        return;
      }

      setMessage(result.message || "Password updated successfully!");
      
      // Redirect to portal after a short delay
      setTimeout(() => {
        window.location.href = "/portal";
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="mx-auto w-full max-w-[480px] rounded-[28px] border border-line bg-white p-7 shadow-soft sm:p-9">
        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-red-100 text-red-600">
          <AlertCircle size={22} />
        </div>
        <p className="eyebrow mt-7">Authentication Required</p>
        <h1 className="mt-3 text-3xl font-bold text-navy">Not logged in</h1>
        <p className="mt-3 text-sm leading-6 text-muted">
          You must be logged in with your temporary credentials to set a new password.
        </p>
        <a
          href="/login"
          className="button-primary w-full mt-6 inline-block text-center"
        >
          Return to Login
        </a>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[480px] rounded-[28px] border border-line bg-white p-7 shadow-soft sm:p-9">
      <div className="grid h-12 w-12 place-items-center rounded-2xl bg-navy text-teal">
        <Lock size={22} />
      </div>

      <p className="eyebrow mt-7">Chesapeake Pharma portal</p>
      <h1 className="mt-3 text-3xl font-bold text-navy">Create Your Password</h1>
      <p className="mt-3 text-sm leading-6 text-muted">
        Your account has been approved! Please create a secure password to access the drug database.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 grid gap-4">
        {error && (
          <StatusLine type="error">
            <span>{error}</span>
          </StatusLine>
        )}

        {message && (
          <StatusLine type="success">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} />
              <span>{message}</span>
            </div>
          </StatusLine>
        )}

        <div>
          <label htmlFor="password" className="block text-sm font-semibold text-navy mb-2">
            New Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter a secure password"
            className="input-control w-full"
            disabled={isLoading}
            autoComplete="new-password"
          />
          
          {password && (
            <div className="mt-2">
              <div className="flex gap-1 mb-1">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className={`h-1 flex-1 rounded ${
                      i < passwordStrength
                        ? passwordStrength <= 2
                          ? "bg-red-500"
                          : passwordStrength <= 3
                          ? "bg-yellow-500"
                          : "bg-green-500"
                        : "bg-line"
                    }`}
                  />
                ))}
              </div>
              <p className="text-xs text-muted">
                {passwordStrength <= 2 && "Weak password"}
                {passwordStrength === 3 && "Fair password"}
                {passwordStrength === 4 && "Good password"}
                {passwordStrength === 5 && "Strong password"}
              </p>
            </div>
          )}

          <p className="mt-2 text-xs text-muted">
            Password should have at least 6 characters. Include uppercase letters, numbers, and symbols for better security.
          </p>
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-semibold text-navy mb-2">
            Confirm Password
          </label>
          <input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Re-enter your password"
            className="input-control w-full"
            disabled={isLoading}
            autoComplete="new-password"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading || !password || password !== confirmPassword}
          className="button-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "Setting password..." : "Set Password & Continue"}
        </button>
      </form>

      <div className="mt-7 rounded-lg bg-teal-50 border border-teal-200 p-4">
        <p className="text-xs text-teal-900">
          <strong>Security Note:</strong> Your password is securely stored by our authentication provider and will be required for all future logins.
        </p>
      </div>
    </div>
  );
}
