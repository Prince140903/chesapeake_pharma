"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ShieldCheck, CheckCircle2 } from "lucide-react";
import { submitAccessRequestAction } from "@/app/admin/access-request-actions";
import { StatusLine } from "@/components/ui";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    company_name: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!formData.full_name.trim()) {
      setError("Please enter your full name");
      return;
    }
    if (!formData.email.trim()) {
      setError("Please enter your corporate email");
      return;
    }
    if (!formData.email.includes("@")) {
      setError("Please enter a valid email address");
      return;
    }
    if (!formData.company_name.trim()) {
      setError("Please enter your company name");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await submitAccessRequestAction(formData);
      
      if (result.success) {
        setSuccess(result.message || "Request submitted successfully!");
        setSubmitted(true);
        setFormData({
          full_name: "",
          email: "",
          company_name: ""
        });
      } else {
        setError(result.error || "Failed to submit request. Please try again.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="mx-auto w-full max-w-[620px] rounded-[28px] border border-line bg-white p-8 shadow-soft sm:p-12">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-emerald-50 text-emerald-600">
          <CheckCircle2 size={28} />
        </div>
        
        <p className="eyebrow mt-8 text-center">Request Submitted</p>
        <h1 className="mt-4 text-center text-4xl font-bold text-navy">
          Thank you, {formData.full_name.split(" ")[0]}!
        </h1>
        <p className="mx-auto mt-5 max-w-lg text-center text-base leading-7 text-muted">
          Your database access request has been submitted. Our team will review your request and contact you at <strong>{formData.email}</strong> within 1-2 business days.
        </p>

        <div className="mt-8 rounded-2xl border border-blue-200 bg-blue-50 p-4 text-left text-sm leading-6 text-blue-900">
          <p><strong>What happens next?</strong></p>
          <ul className="mt-2 space-y-1 list-disc list-inside">
            <li>We verify your company information</li>
            <li>An admin will assign appropriate database access</li>
            <li>You&apos;ll receive login credentials via email</li>
          </ul>
        </div>

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/" className="button-secondary text-center">
            Return to website
          </Link>
          <Link href="/contact" className="button-primary text-center">
            Contact us
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[620px] rounded-[28px] border border-line bg-white p-8 shadow-soft sm:p-12">
      <div className="grid h-12 w-12 place-items-center rounded-2xl bg-navy text-teal">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      </div>

      <p className="eyebrow mt-8">Chesapeake Pharma Portal</p>
      <h1 className="mt-4 text-4xl font-bold text-navy">Request database access</h1>
      <p className="mt-4 text-base leading-7 text-muted">
        Access is restricted to approved customers. Submit a request and Chesapeake Pharma will review it manually. Once approved, an admin will assign you the appropriate database access.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 grid gap-6">
        {error && (
          <StatusLine type="error">
            <span>{error}</span>
          </StatusLine>
        )}

        {success && (
          <StatusLine type="success">
            <span>{success}</span>
          </StatusLine>
        )}

        <div>
          <label htmlFor="full_name" className="block text-sm font-semibold text-navy mb-2">
            Full Name
          </label>
          <input
            id="full_name"
            name="full_name"
            type="text"
            value={formData.full_name}
            onChange={handleChange}
            placeholder="John Doe"
            className="input-control w-full"
            disabled={isSubmitting}
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-semibold text-navy mb-2">
            Corporate email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="name@company.com"
            className="input-control w-full"
            disabled={isSubmitting}
          />
        </div>

        <div>
          <label htmlFor="company_name" className="block text-sm font-semibold text-navy mb-2">
            Company / Organization
          </label>
          <input
            id="company_name"
            name="company_name"
            type="text"
            value={formData.company_name}
            onChange={handleChange}
            placeholder="Your organization"
            className="input-control w-full"
            disabled={isSubmitting}
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="button-primary w-full mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Submitting request..." : "Submit access request"}
        </button>
      </form>

      <div className="mt-8 flex items-center justify-between border-t border-line pt-5 text-sm">
        <Link href="/" className="inline-flex items-center gap-2 font-semibold text-muted hover:text-navy">
          <ArrowLeft size={14} /> Public website
        </Link>
        <Link href="/login" className="font-semibold text-navy hover:text-teal">
          Already have access?
        </Link>
      </div>

      <div className="mt-6 flex gap-2 text-xs text-muted">
        <ShieldCheck size={15} className="shrink-0 text-teal" />
        <span>Private data will only appear after server-side approval and an active dataset entitlement.</span>
      </div>
    </div>
  );
}
