"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  Globe,
  FileText,
  BookOpen,
  Mail,
  Save,
  Plus,
  Trash2,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Image as ImageIcon,
  Edit2
} from "lucide-react";
import {
  HomePageContent,
  AboutPageContent,
  ContactPageContent,
  PublicationsPageContent,
  PublicationItem,
  defaultHomePageContent,
  defaultAboutPageContent,
  defaultContactPageContent,
  defaultPublicationsPageContent
} from "@/lib/content-schema";
import {
  getSiteContentAction,
  updateSiteContentAction,
  addPublicationAction,
  updatePublicationAction,
  deletePublicationAction
} from "@/app/admin/content-actions";
import { ImageUploadField } from "@/components/admin/image-upload-field";
import { MultiImageUploadField } from "@/components/admin/multi-image-upload-field";

type TabKey = "home" | "publications" | "about" | "contact";

export default function AdminContentPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("home");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Form State
  const [homeData, setHomeData] = useState<HomePageContent>(defaultHomePageContent);
  const [aboutData, setAboutData] = useState<AboutPageContent>(defaultAboutPageContent);
  const [contactData, setContactData] = useState<ContactPageContent>(defaultContactPageContent);
  const [publicationsData, setPublicationsData] = useState<PublicationsPageContent>(defaultPublicationsPageContent);

  // Publication Modal State for Add / Edit
  const [editingPub, setEditingPub] = useState<PublicationItem | null>(null);
  const [isPubModalOpen, setIsPubModalOpen] = useState(false);

  // Load existing content on mount
  useEffect(() => {
    async function loadAllContent() {
      setLoading(true);
      try {
        const [homeRes, aboutRes, contactRes, pubRes] = await Promise.all([
          getSiteContentAction<HomePageContent>("home"),
          getSiteContentAction<AboutPageContent>("about"),
          getSiteContentAction<ContactPageContent>("contact"),
          getSiteContentAction<PublicationsPageContent>("publications")
        ]);

        if (homeRes.data) setHomeData(homeRes.data);
        if (aboutRes.data) setAboutData(aboutRes.data);
        if (contactRes.data) setContactData(contactRes.data);
        if (pubRes.data) setPublicationsData(pubRes.data);
      } catch (err: any) {
        console.error("Failed to load content:", err);
      } finally {
        setLoading(false);
      }
    }

    loadAllContent();
  }, []);

  // Save current active tab content
  const handleSaveContent = async () => {
    setSaving(true);
    setStatusMessage(null);
    try {
      let result;
      if (activeTab === "home") {
        result = await updateSiteContentAction("home", homeData);
      } else if (activeTab === "about") {
        result = await updateSiteContentAction("about", aboutData);
      } else if (activeTab === "contact") {
        result = await updateSiteContentAction("contact", contactData);
      } else if (activeTab === "publications") {
        result = await updateSiteContentAction("publications", publicationsData);
      }

      if (result?.success) {
        setStatusMessage({ type: "success", text: `${activeTab.toUpperCase()} content saved and published successfully!` });
      } else {
        setStatusMessage({ type: "error", text: result?.error || "Failed to update content." });
      }
    } catch (err: any) {
      setStatusMessage({ type: "error", text: err?.message || "An unexpected error occurred." });
    } finally {
      setSaving(false);
      setTimeout(() => setStatusMessage(null), 5000);
    }
  };

  // Publications CRUD
  const handleOpenPubModal = (pub?: PublicationItem) => {
    if (pub) {
      setEditingPub(pub);
    } else {
      setEditingPub({
        id: "",
        title: "",
        authors: "",
        journal: "",
        volume: "",
        year: new Date().getFullYear().toString(),
        doi: "",
        link: "",
        badge: "Scientific Article",
        status: "Published"
      });
    }
    setIsPubModalOpen(true);
  };

  const handleSavePublication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPub) return;

    setSaving(true);
    try {
      let res;
      if (editingPub.id) {
        res = await updatePublicationAction(editingPub);
      } else {
        res = await addPublicationAction(editingPub);
      }

      if (res.success) {
        // Refresh local publications state
        const refreshed = await getSiteContentAction<PublicationsPageContent>("publications");
        if (refreshed.data) setPublicationsData(refreshed.data);
        setIsPubModalOpen(false);
        setEditingPub(null);
        setStatusMessage({ type: "success", text: "Publication saved successfully!" });
      } else {
        setStatusMessage({ type: "error", text: res.error || "Failed to save publication" });
      }
    } finally {
      setSaving(false);
      setTimeout(() => setStatusMessage(null), 5000);
    }
  };

  const handleDeletePublication = async (id: string) => {
    if (!confirm("Are you sure you want to delete this publication?")) return;
    setSaving(true);
    try {
      const res = await deletePublicationAction(id);
      if (res.success) {
        setPublicationsData((prev) => ({
          ...prev,
          items: prev.items.filter((item) => item.id !== id)
        }));
        setStatusMessage({ type: "success", text: "Publication deleted successfully!" });
      } else {
        setStatusMessage({ type: "error", text: res.error || "Failed to delete publication" });
      }
    } finally {
      setSaving(false);
      setTimeout(() => setStatusMessage(null), 5000);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-3">
          <div className="h-8 w-8 border-4 border-[#42B7B9]/30 border-t-[#42B7B9] rounded-full animate-spin mx-auto" />
          <p className="text-xs text-[#637786]">Loading site content...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#DCE6EB] pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#EAF7F8] border border-[#BCE1E4] text-[#135C70] text-[11px] font-bold uppercase tracking-wider mb-1">
            Dynamic Website Management
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#0B2D45]">
            Website CMS & Content Editor
          </h1>
          <p className="text-xs text-[#637786] mt-0.5">
            Manage text, imagery, publications, and contact info displayed across the public website.
          </p>
        </div>

        <button
          onClick={handleSaveContent}
          disabled={saving}
          className="focus-ring inline-flex items-center justify-center gap-2 rounded-lg bg-[#135C70] hover:bg-[#0B3B48] px-5 py-2.5 text-xs font-bold text-white shadow-sm transition active:scale-[0.98] disabled:opacity-50"
        >
          <Save size={16} />
          <span>{saving ? "Publishing Changes..." : `Save & Publish ${activeTab.toUpperCase()}`}</span>
        </button>
      </div>

      {/* Status banner */}
      {statusMessage && (
        <div
          className={`p-4 rounded-xl border flex items-center gap-3 text-xs font-semibold ${
            statusMessage.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-900"
              : "bg-rose-50 border-rose-200 text-rose-900"
          }`}
        >
          {statusMessage.type === "success" ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-[#DCE6EB] gap-2 overflow-x-auto">
        {[
          { key: "home", label: "Home Page", icon: Globe },
          { key: "publications", label: "Publications", icon: BookOpen },
          { key: "about", label: "About Us", icon: FileText },
          { key: "contact", label: "Contact Info", icon: Mail }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as TabKey)}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold transition border-b-2 whitespace-nowrap ${
                isActive
                  ? "border-[#289CA0] text-[#135C70] bg-white rounded-t-lg"
                  : "border-transparent text-[#637786] hover:text-[#0B2D45]"
              }`}
            >
              <Icon size={15} />
              <span>{tab.label}</span>
              {tab.key === "publications" && (
                <span className="ml-1 px-1.5 py-0.5 rounded-full bg-[#EAF7F8] text-[10px] text-[#289CA0]">
                  {publicationsData.items?.length || 0}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ========================================================
          TAB 1: HOME PAGE
         ======================================================== */}
      {activeTab === "home" && (
        <div className="space-y-8">
          {/* Hero Banner Section */}
          <div className="rounded-xl border border-[#DCE6EB] bg-white p-6 shadow-sm space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#0B2D45] flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#289CA0]" />
              Hero Banner Section
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#163449] mb-1">Badge Text</label>
                <input
                  type="text"
                  value={homeData.hero?.badge || ""}
                  onChange={(e) =>
                    setHomeData({ ...homeData, hero: { ...homeData.hero, badge: e.target.value } })
                  }
                  className="input-control text-xs"
                />
              </div>

              <div>
                <ImageUploadField
                  label="Primary Background Image"
                  value={homeData.hero?.banner_image || ""}
                  onChange={(url) =>
                    setHomeData({
                      ...homeData,
                      hero: { ...homeData.hero, banner_image: url }
                    })
                  }
                  placeholder="/assets/banner.png or https://...supabase.co/..."
                  hint="Enter URL or upload a file directly to Supabase Storage"
                />
              </div>

              <div className="md:col-span-2">
                <MultiImageUploadField
                  label="Banner Slider Images Sequence"
                  images={
                    homeData.hero?.banner_images && homeData.hero.banner_images.length > 0
                      ? homeData.hero.banner_images
                      : [homeData.hero?.banner_image || "/assets/banner.png"]
                  }
                  onChange={(imgs) =>
                    setHomeData({
                      ...homeData,
                      hero: {
                        ...homeData.hero,
                        banner_images: imgs,
                        banner_image: imgs[0] || homeData.hero?.banner_image || ""
                      }
                    })
                  }
                  hint="Upload multiple images to Supabase Storage to display an image sequence in the hero banner slider."
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-[#163449] mb-1">Citation / Reference Footnote (Optional)</label>
                <input
                  type="text"
                  value={homeData.hero?.citation || ""}
                  onChange={(e) =>
                    setHomeData({ ...homeData, hero: { ...homeData.hero, citation: e.target.value } })
                  }
                  placeholder="*From: Lyness A, Burke J..."
                  className="input-control text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#163449] mb-1">Title Line 1</label>
                <input
                  type="text"
                  value={homeData.hero?.title_line1 || ""}
                  onChange={(e) =>
                    setHomeData({ ...homeData, hero: { ...homeData.hero, title_line1: e.target.value } })
                  }
                  className="input-control text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#163449] mb-1">Highlight Line (Cyan)</label>
                <input
                  type="text"
                  value={homeData.hero?.title_highlight || ""}
                  onChange={(e) =>
                    setHomeData({ ...homeData, hero: { ...homeData.hero, title_highlight: e.target.value } })
                  }
                  className="input-control text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#163449] mb-1">Title Line 2</label>
                <input
                  type="text"
                  value={homeData.hero?.title_line2 || ""}
                  onChange={(e) =>
                    setHomeData({ ...homeData, hero: { ...homeData.hero, title_line2: e.target.value } })
                  }
                  className="input-control text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#163449] mb-1">Title Line 3 (Optional)</label>
                <input
                  type="text"
                  value={homeData.hero?.title_line3 || ""}
                  onChange={(e) =>
                    setHomeData({ ...homeData, hero: { ...homeData.hero, title_line3: e.target.value } })
                  }
                  className="input-control text-xs"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-[#163449] mb-1">Description Subtitle</label>
                <textarea
                  rows={2}
                  value={homeData.hero?.description || ""}
                  onChange={(e) =>
                    setHomeData({ ...homeData, hero: { ...homeData.hero, description: e.target.value } })
                  }
                  className="input-control text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#163449] mb-1">Primary CTA Button Label</label>
                <input
                  type="text"
                  value={homeData.hero?.primary_btn_text || ""}
                  onChange={(e) =>
                    setHomeData({ ...homeData, hero: { ...homeData.hero, primary_btn_text: e.target.value } })
                  }
                  className="input-control text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#163449] mb-1">Primary CTA Link</label>
                <input
                  type="text"
                  value={homeData.hero?.primary_btn_link || ""}
                  onChange={(e) =>
                    setHomeData({ ...homeData, hero: { ...homeData.hero, primary_btn_link: e.target.value } })
                  }
                  className="input-control text-xs font-mono"
                />
              </div>
            </div>
          </div>

          {/* Unified Expertise & Key Services Section */}
          <div className="rounded-xl border border-[#DCE6EB] bg-white p-6 shadow-sm space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#0B2D45] flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#289CA0]" />
              Expertise & Key Services (Merged Unified Section)
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#163449] mb-1">Section Title</label>
                <input
                  type="text"
                  value={homeData.expertise_section?.title || "EXPERTISE"}
                  onChange={(e) =>
                    setHomeData({
                      ...homeData,
                      expertise_section: {
                        ...(homeData.expertise_section || defaultHomePageContent.expertise_section!),
                        title: e.target.value
                      }
                    })
                  }
                  className="input-control text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#163449] mb-1">Badge</label>
                <input
                  type="text"
                  value={homeData.expertise_section?.badge || "Key Services"}
                  onChange={(e) =>
                    setHomeData({
                      ...homeData,
                      expertise_section: {
                        ...(homeData.expertise_section || defaultHomePageContent.expertise_section!),
                        badge: e.target.value
                      }
                    })
                  }
                  className="input-control text-xs"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-[#163449] mb-1">Lead Narrative Text</label>
                <textarea
                  rows={3}
                  value={homeData.expertise_section?.lead_text || ""}
                  onChange={(e) =>
                    setHomeData({
                      ...homeData,
                      expertise_section: {
                        ...(homeData.expertise_section || defaultHomePageContent.expertise_section!),
                        lead_text: e.target.value
                      }
                    })
                  }
                  className="input-control text-xs"
                />
              </div>

              <div className="md:col-span-2">
                <MultiImageUploadField
                  label="Section Slider Images (Delivery Devices & Clinical Imaging Modalities)"
                  images={
                    homeData.expertise_section?.slider_images && homeData.expertise_section.slider_images.length > 0
                      ? homeData.expertise_section.slider_images
                      : [
                          "/assets/docx_images/image6.png",
                          "/assets/docx_images/image7.jpeg",
                          "/assets/docx_images/image8.png",
                          "/assets/docx_images/image9.png",
                          "/assets/docx_images/image5.png"
                        ]
                  }
                  onChange={(imgs) =>
                    setHomeData({
                      ...homeData,
                      expertise_section: {
                        ...(homeData.expertise_section || defaultHomePageContent.expertise_section!),
                        slider_images: imgs
                      }
                    })
                  }
                  hint="Upload images directly to Supabase Storage or edit URLs. Responsive slider shows 1/2 on mobile and 3/4 on large screens."
                />
              </div>
            </div>

            {/* Three Key Areas Editor */}
            <div className="pt-4 border-t border-[#DCE6EB] space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#135C70]">
                Three Key Service Areas
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {homeData.services_list?.map((svc, idx) => (
                  <div key={idx} className="p-4 rounded-lg border border-[#D8ECF0] bg-[#F7FCFD] space-y-3">
                    <span className="text-[11px] font-bold text-[#135C70]">Service Area #{idx + 1}</span>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700">Area Title</label>
                      <input
                        type="text"
                        value={svc.title}
                        onChange={(e) => {
                          const next = [...homeData.services_list];
                          next[idx].title = e.target.value;
                          setHomeData({ ...homeData, services_list: next });
                        }}
                        className="input-control text-xs mt-1"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700">Summary Description</label>
                      <textarea
                        rows={2}
                        value={svc.description}
                        onChange={(e) => {
                          const next = [...homeData.services_list];
                          next[idx].description = e.target.value;
                          setHomeData({ ...homeData, services_list: next });
                        }}
                        className="input-control text-xs mt-1"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700">
                        Bullet Points (One per line)
                      </label>
                      <textarea
                        rows={3}
                        value={svc.points ? svc.points.join("\n") : ""}
                        onChange={(e) => {
                          const next = [...homeData.services_list];
                          next[idx].points = e.target.value
                            .split("\n")
                            .map((p) => p.trim())
                            .filter(Boolean);
                          setHomeData({ ...homeData, services_list: next });
                        }}
                        className="input-control text-xs mt-1"
                        placeholder="Bullet point 1&#10;Bullet point 2"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* About Leadership Spotlight */}
          <div className="rounded-xl border border-[#DCE6EB] bg-white p-6 shadow-sm space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#0B2D45] flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#289CA0]" />
              Executive Portrait & Bio
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#163449] mb-1">Executive Name</label>
                <input
                  type="text"
                  value={homeData.leadership_spotlight?.name || ""}
                  onChange={(e) =>
                    setHomeData({
                      ...homeData,
                      leadership_spotlight: { ...homeData.leadership_spotlight, name: e.target.value }
                    })
                  }
                  className="input-control text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#163449] mb-1">Role Badge</label>
                <input
                  type="text"
                  value={homeData.leadership_spotlight?.role_badge || ""}
                  onChange={(e) =>
                    setHomeData({
                      ...homeData,
                      leadership_spotlight: { ...homeData.leadership_spotlight, role_badge: e.target.value }
                    })
                  }
                  className="input-control text-xs"
                />
              </div>

              <div>
                <ImageUploadField
                  label="Portrait Image"
                  value={homeData.leadership_spotlight?.image || ""}
                  onChange={(url) =>
                    setHomeData({
                      ...homeData,
                      leadership_spotlight: {
                        ...homeData.leadership_spotlight,
                        image: url
                      }
                    })
                  }
                  placeholder="/assets/image.png or https://...supabase.co/..."
                  hint="Upload an executive portrait or paste a URL"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#163449] mb-1">Subtitle / Location Tag</label>
                <input
                  type="text"
                  value={homeData.leadership_spotlight?.title_subtitle || ""}
                  onChange={(e) =>
                    setHomeData({
                      ...homeData,
                      leadership_spotlight: { ...homeData.leadership_spotlight, title_subtitle: e.target.value }
                    })
                  }
                  className="input-control text-xs"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-[#163449] mb-1">Bio Paragraph 1</label>
                <textarea
                  rows={3}
                  value={homeData.leadership_spotlight?.paragraph1 || ""}
                  onChange={(e) =>
                    setHomeData({
                      ...homeData,
                      leadership_spotlight: { ...homeData.leadership_spotlight, paragraph1: e.target.value }
                    })
                  }
                  className="input-control text-xs"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-[#163449] mb-1">Bio Paragraph 2</label>
                <textarea
                  rows={3}
                  value={homeData.leadership_spotlight?.paragraph2 || ""}
                  onChange={(e) =>
                    setHomeData({
                      ...homeData,
                      leadership_spotlight: { ...homeData.leadership_spotlight, paragraph2: e.target.value }
                    })
                  }
                  className="input-control text-xs"
                />
              </div>
            </div>
          </div>

          {/* Focused Areas / Modalities */}
          <div className="rounded-xl border border-[#DCE6EB] bg-white p-6 shadow-sm space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#0B2D45] flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#289CA0]" />
              Focused Areas (3 Therapeutic Modality Cards)
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {homeData.focused_areas?.map((item, idx) => (
                <div key={idx} className="p-4 rounded-lg border border-[#D8ECF0] bg-[#F7FCFD] space-y-3">
                  <span className="text-[11px] font-bold text-[#135C70]">Card #{idx + 1}</span>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700">Badge Tag</label>
                    <input
                      type="text"
                      value={item.tag}
                      onChange={(e) => {
                        const next = [...homeData.focused_areas];
                        next[idx].tag = e.target.value;
                        setHomeData({ ...homeData, focused_areas: next });
                      }}
                      className="input-control text-xs mt-1"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700">Title</label>
                    <input
                      type="text"
                      value={item.title}
                      onChange={(e) => {
                        const next = [...homeData.focused_areas];
                        next[idx].title = e.target.value;
                        setHomeData({ ...homeData, focused_areas: next });
                      }}
                      className="input-control text-xs mt-1"
                    />
                  </div>
                  <div>
                    <ImageUploadField
                      label="Card Image"
                      value={item.image}
                      onChange={(url) => {
                        const next = [...homeData.focused_areas];
                        next[idx].image = url;
                        setHomeData({ ...homeData, focused_areas: next });
                      }}
                      placeholder="/assets/monoclonal antibodies 1.png"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700">Description</label>
                    <textarea
                      rows={3}
                      value={item.description}
                      onChange={(e) => {
                        const next = [...homeData.focused_areas];
                        next[idx].description = e.target.value;
                        setHomeData({ ...homeData, focused_areas: next });
                      }}
                      className="input-control text-xs mt-1"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 2: PUBLICATIONS (CRUD)
         ======================================================== */}
      {activeTab === "publications" && (
        <div className="space-y-6">
          {/* Header Info */}
          <div className="rounded-xl border border-[#DCE6EB] bg-white p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-sm font-bold uppercase tracking-wider text-[#0B2D45]">
                  Public Publications Page Copy
                </h2>
                <p className="text-xs text-slate-500">
                  Controls the title, intro, and literature papers displayed on /publications.
                </p>
              </div>

              <button
                type="button"
                onClick={() => handleOpenPubModal()}
                className="focus-ring inline-flex items-center gap-1.5 rounded-lg bg-[#289CA0] hover:bg-[#208386] px-4 py-2 text-xs font-bold text-white shadow-sm transition"
              >
                <Plus size={15} />
                <span>Add Publication</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#163449] mb-1">Page Eyebrow</label>
                <input
                  type="text"
                  value={publicationsData.eyebrow || ""}
                  onChange={(e) =>
                    setPublicationsData({ ...publicationsData, eyebrow: e.target.value })
                  }
                  className="input-control text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#163449] mb-1">Page Title</label>
                <input
                  type="text"
                  value={publicationsData.title || ""}
                  onChange={(e) =>
                    setPublicationsData({ ...publicationsData, title: e.target.value })
                  }
                  className="input-control text-xs"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-[#163449] mb-1">Subtitle / Overview</label>
                <textarea
                  rows={2}
                  value={publicationsData.subtitle || ""}
                  onChange={(e) =>
                    setPublicationsData({ ...publicationsData, subtitle: e.target.value })
                  }
                  className="input-control text-xs"
                />
              </div>
            </div>
          </div>

          {/* Publication Items List */}
          <div className="rounded-xl border border-[#DCE6EB] bg-white p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#0B2D45]">
                Publication Articles ({publicationsData.items?.length || 0})
              </h3>
            </div>

            <div className="space-y-3">
              {publicationsData.items && publicationsData.items.length > 0 ? (
                publicationsData.items.map((pub, idx) => (
                  <div
                    key={pub.id || idx}
                    className="p-4 rounded-xl border border-[#DCE6EB] bg-[#F7FCFD] hover:bg-white hover:border-[#289CA0] transition flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2">
                        {pub.badge && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#EAF7F8] text-[#135C70] border border-[#BCE1E4]">
                            {pub.badge}
                          </span>
                        )}
                        <span className="text-xs font-semibold text-slate-500">
                          {pub.year} · {pub.journal} {pub.volume && `(${pub.volume})`}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-[#0B2D45]">{pub.title}</h4>
                      <p className="text-xs text-slate-600">Authors: {pub.authors}</p>
                      {pub.doi && (
                        <p className="text-xs text-[#289CA0] font-mono break-all">DOI: {pub.doi}</p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleOpenPubModal(pub)}
                        className="p-2 rounded-lg border border-[#DCE6EB] bg-white text-[#135C70] hover:bg-slate-50 transition"
                        title="Edit publication"
                      >
                        <Edit2 size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeletePublication(pub.id)}
                        className="p-2 rounded-lg border border-red-200 bg-white text-red-600 hover:bg-red-50 transition"
                        title="Delete publication"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-xs text-slate-500">
                  No publications recorded yet. Click &quot;Add Publication&quot; above to add one.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 3: ABOUT US PAGE
         ======================================================== */}
      {activeTab === "about" && (
        <div className="rounded-xl border border-[#DCE6EB] bg-white p-6 shadow-sm space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-[#0B2D45] flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#289CA0]" />
            About Page Narrative & Principles
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#163449] mb-1">Eyebrow</label>
              <input
                type="text"
                value={aboutData.eyebrow || ""}
                onChange={(e) => setAboutData({ ...aboutData, eyebrow: e.target.value })}
                className="input-control text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#163449] mb-1">Main Heading</label>
              <input
                type="text"
                value={aboutData.title || ""}
                onChange={(e) => setAboutData({ ...aboutData, title: e.target.value })}
                className="input-control text-xs"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-[#163449] mb-1">Lead Intro Paragraph</label>
              <textarea
                rows={3}
                value={aboutData.intro_p1 || ""}
                onChange={(e) => setAboutData({ ...aboutData, intro_p1: e.target.value })}
                className="input-control text-xs"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-[#163449] mb-1">Secondary Paragraph</label>
              <textarea
                rows={3}
                value={aboutData.intro_p2 || ""}
                onChange={(e) => setAboutData({ ...aboutData, intro_p2: e.target.value })}
                className="input-control text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#163449] mb-1">Principles Eyebrow</label>
              <input
                type="text"
                value={aboutData.principles_eyebrow || ""}
                onChange={(e) => setAboutData({ ...aboutData, principles_eyebrow: e.target.value })}
                className="input-control text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#163449] mb-1">Principles Title</label>
              <input
                type="text"
                value={aboutData.principles_title || ""}
                onChange={(e) => setAboutData({ ...aboutData, principles_title: e.target.value })}
                className="input-control text-xs"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-[#163449] mb-1">Footnote Note</label>
              <input
                type="text"
                value={aboutData.footnote || ""}
                onChange={(e) => setAboutData({ ...aboutData, footnote: e.target.value })}
                className="input-control text-xs"
              />
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 4: CONTACT DATA
         ======================================================== */}
      {activeTab === "contact" && (
        <div className="rounded-xl border border-[#DCE6EB] bg-white p-6 shadow-sm space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-[#0B2D45] flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#289CA0]" />
            Contact & Company Details
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#163449] mb-1">Official Email</label>
              <input
                type="email"
                value={contactData.email || ""}
                onChange={(e) => setContactData({ ...contactData, email: e.target.value })}
                className="input-control text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#163449] mb-1">Location Address</label>
              <input
                type="text"
                value={contactData.location || ""}
                onChange={(e) => setContactData({ ...contactData, location: e.target.value })}
                className="input-control text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#163449] mb-1">Phone Number (Optional)</label>
              <input
                type="text"
                value={contactData.phone || ""}
                onChange={(e) => setContactData({ ...contactData, phone: e.target.value })}
                placeholder="+1 ..."
                className="input-control text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#163449] mb-1">Leadership Representative</label>
              <input
                type="text"
                value={contactData.leadership_name || ""}
                onChange={(e) => setContactData({ ...contactData, leadership_name: e.target.value })}
                className="input-control text-xs"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-[#163449] mb-1">Contact Page Title</label>
              <input
                type="text"
                value={contactData.title || ""}
                onChange={(e) => setContactData({ ...contactData, title: e.target.value })}
                className="input-control text-xs"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-[#163449] mb-1">Contact Page Subtitle</label>
              <input
                type="text"
                value={contactData.subtitle || ""}
                onChange={(e) => setContactData({ ...contactData, subtitle: e.target.value })}
                className="input-control text-xs"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-[#163449] mb-1">Advisory Summary</label>
              <textarea
                rows={2}
                value={contactData.summary || ""}
                onChange={(e) => setContactData({ ...contactData, summary: e.target.value })}
                className="input-control text-xs"
              />
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          PUBLICATION MODAL (ADD / EDIT)
         ======================================================== */}
      {isPubModalOpen && editingPub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-bold text-[#0B2D45]">
              {editingPub.id ? "Edit Publication" : "Add New Publication"}
            </h3>

            <form onSubmit={handleSavePublication} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Title *</label>
                <textarea
                  required
                  rows={2}
                  value={editingPub.title}
                  onChange={(e) => setEditingPub({ ...editingPub, title: e.target.value })}
                  className="input-control text-xs"
                  placeholder="Paper or review title..."
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Authors *</label>
                <input
                  required
                  type="text"
                  value={editingPub.authors}
                  onChange={(e) => setEditingPub({ ...editingPub, authors: e.target.value })}
                  className="input-control text-xs"
                  placeholder="e.g. Green, P., Schneider, A., & Lange, J."
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Journal / Publisher *</label>
                  <input
                    required
                    type="text"
                    value={editingPub.journal}
                    onChange={(e) => setEditingPub({ ...editingPub, journal: e.target.value })}
                    className="input-control text-xs"
                    placeholder="e.g. mAbs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Volume / Issue</label>
                  <input
                    type="text"
                    value={editingPub.volume}
                    onChange={(e) => setEditingPub({ ...editingPub, volume: e.target.value })}
                    className="input-control text-xs"
                    placeholder="e.g. 16(1) or in press"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Year</label>
                  <input
                    type="text"
                    value={editingPub.year}
                    onChange={(e) => setEditingPub({ ...editingPub, year: e.target.value })}
                    className="input-control text-xs"
                    placeholder="2026"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Badge Tag</label>
                  <input
                    type="text"
                    value={editingPub.badge || ""}
                    onChange={(e) => setEditingPub({ ...editingPub, badge: e.target.value })}
                    className="input-control text-xs"
                    placeholder="e.g. Systematic Review"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Status</label>
                  <input
                    type="text"
                    value={editingPub.status || ""}
                    onChange={(e) => setEditingPub({ ...editingPub, status: e.target.value })}
                    className="input-control text-xs"
                    placeholder="Published / In Press"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">DOI / Link</label>
                <input
                  type="url"
                  value={editingPub.link || ""}
                  onChange={(e) =>
                    setEditingPub({ ...editingPub, link: e.target.value, doi: e.target.value })
                  }
                  className="input-control text-xs font-mono"
                  placeholder="https://doi.org/..."
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsPubModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="button-primary px-4 py-2 text-xs font-bold"
                >
                  {saving ? "Saving..." : "Save Publication"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

