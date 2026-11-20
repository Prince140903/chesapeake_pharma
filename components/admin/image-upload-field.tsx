"use client";

import React, { useRef, useState } from "react";
import { Upload, Check, AlertCircle, Loader2, Image as ImageIcon } from "lucide-react";
import { uploadSiteImageAction } from "@/app/admin/content-actions";

interface ImageUploadFieldProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  placeholder?: string;
  hint?: string;
}

export function ImageUploadField({
  label,
  value,
  onChange,
  placeholder = "/assets/banner.png or https://...",
  hint
}: ImageUploadFieldProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setUploadStatus({
        type: "error",
        message: "File is too large (maximum 10MB allowed)."
      });
      return;
    }

    setUploading(true);
    setUploadStatus(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await uploadSiteImageAction(formData);

      if (res.success && res.data?.url) {
        onChange(res.data.url);
        setUploadStatus({
          type: "success",
          message: "Uploaded to Supabase Storage successfully!"
        });
      } else {
        setUploadStatus({
          type: "error",
          message: res.error || "Failed to upload image."
        });
      }
    } catch (err: any) {
      setUploadStatus({
        type: "error",
        message: err?.message || "Upload failed."
      });
    } finally {
      setUploading(false);
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      setTimeout(() => setUploadStatus(null), 5000);
    }
  };

  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-semibold text-[#163449]">
        {label}
      </label>

      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="input-control text-xs font-mono pr-8"
          />
          {value && (
            <div className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400">
              <ImageIcon size={14} />
            </div>
          )}
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileSelect}
        />

        {/* Upload Trigger Button */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="focus-ring inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#EAF7F8] hover:bg-[#D5EEF2] border border-[#BCE1E4] text-[#135C70] text-xs font-semibold shrink-0 transition active:scale-[0.98] disabled:opacity-50"
          title="Upload new image to Supabase Storage"
        >
          {uploading ? (
            <>
              <Loader2 size={14} className="animate-spin text-[#289CA0]" />
              <span>Uploading...</span>
            </>
          ) : (
            <>
              <Upload size={14} />
              <span>Upload File</span>
            </>
          )}
        </button>
      </div>

      {hint && <p className="text-[11px] text-[#637786]">{hint}</p>}

      {uploadStatus && (
        <div
          className={`flex items-center gap-1.5 text-[11px] font-semibold mt-1 ${
            uploadStatus.type === "success"
              ? "text-emerald-700"
              : "text-rose-600"
          }`}
        >
          {uploadStatus.type === "success" ? (
            <Check size={13} className="shrink-0" />
          ) : (
            <AlertCircle size={13} className="shrink-0" />
          )}
          <span>{uploadStatus.message}</span>
        </div>
      )}
    </div>
  );
}
