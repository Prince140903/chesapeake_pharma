"use client";

import React, { useRef, useState } from "react";
import { Upload, Check, AlertCircle, Loader2, Plus, Trash2, Image as ImageIcon } from "lucide-react";
import { uploadSiteImageAction } from "@/app/admin/content-actions";

interface MultiImageUploadFieldProps {
  label: string;
  images: string[];
  onChange: (images: string[]) => void;
  hint?: string;
}

export function MultiImageUploadField({
  label,
  images,
  onChange,
  hint
}: MultiImageUploadFieldProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setStatusMessage(null);

    try {
      const newUrls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.size > 10 * 1024 * 1024) continue;

        const formData = new FormData();
        formData.append("file", file);

        const res = await uploadSiteImageAction(formData);
        if (res.success && res.data?.url) {
          newUrls.push(res.data.url);
        }
      }

      if (newUrls.length > 0) {
        onChange([...images, ...newUrls]);
        setStatusMessage({
          type: "success",
          text: `Successfully uploaded ${newUrls.length} image(s) to Supabase Storage!`
        });
      } else {
        setStatusMessage({
          type: "error",
          text: "Upload failed or files exceeded 10MB limit."
        });
      }
    } catch (err: any) {
      setStatusMessage({
        type: "error",
        text: err?.message || "Failed to upload images."
      });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
      setTimeout(() => setStatusMessage(null), 5000);
    }
  };

  const handleRemove = (index: number) => {
    const updated = images.filter((_, idx) => idx !== index);
    onChange(updated);
  };

  const handleTextChange = (text: string) => {
    const lines = text
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
    onChange(lines);
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <label className="block text-xs font-semibold text-[#163449]">
            {label}
          </label>
          {hint && <p className="text-[11px] text-[#637786]">{hint}</p>}
        </div>

        {/* Upload Button */}
        <div className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleFileUpload}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="focus-ring inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#EAF7F8] hover:bg-[#D5EEF2] border border-[#BCE1E4] text-[#135C70] text-xs font-semibold transition active:scale-[0.98] disabled:opacity-50"
          >
            {uploading ? (
              <>
                <Loader2 size={13} className="animate-spin text-[#289CA0]" />
                <span>Uploading...</span>
              </>
            ) : (
              <>
                <Upload size={13} />
                <span>Upload New Images</span>
              </>
            )}
          </button>
        </div>
      </div>

      {statusMessage && (
        <div
          className={`flex items-center gap-1.5 text-[11px] font-semibold ${
            statusMessage.type === "success"
              ? "text-emerald-700"
              : "text-rose-600"
          }`}
        >
          {statusMessage.type === "success" ? (
            <Check size={13} className="shrink-0" />
          ) : (
            <AlertCircle size={13} className="shrink-0" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Raw list textarea for manual URL edits */}
      <div>
        <label className="block text-[11px] text-slate-500 mb-1">
          Or paste image URLs directly (one URL per line):
        </label>
        <textarea
          rows={3}
          value={images.join("\n")}
          onChange={(e) => handleTextChange(e.target.value)}
          placeholder="https://...supabase.co/...&#10;/assets/banner.png"
          className="input-control text-xs font-mono"
        />
      </div>

      {/* Thumbnail Previews with individual delete */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2 pt-1">
          {images.map((url, idx) => (
            <div
              key={idx}
              className="relative group rounded-lg border border-[#D5E7EA] bg-white overflow-hidden p-1 shadow-xs"
            >
              <div className="relative aspect-[4/3] w-full bg-slate-50 rounded overflow-hidden">
                <img
                  src={url}
                  alt={`Slide ${idx + 1}`}
                  className="w-full h-full object-contain"
                />
              </div>
              <p className="mt-1 text-[10px] text-slate-500 truncate font-mono" title={url}>
                {url.split("/").pop()}
              </p>
              <button
                type="button"
                onClick={() => handleRemove(idx)}
                className="absolute top-1.5 right-1.5 p-1 rounded-full bg-red-600/80 text-white opacity-0 group-hover:opacity-100 transition hover:bg-red-700"
                title="Remove image"
              >
                <Trash2 size={11} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
