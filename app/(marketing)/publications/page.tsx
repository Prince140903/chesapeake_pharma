import Link from "next/link";
import { BookOpen, ExternalLink, FileText, ArrowRight, Calendar, UserCheck } from "lucide-react";
import { TealWedge } from "@/components/ui";
import { getSiteContentAction } from "@/app/admin/content-actions";
import { PublicationsPageContent, defaultPublicationsPageContent } from "@/lib/content-schema";

export const revalidate = 0; // Always serve fresh or revalidated data

export default async function PublicationsPage() {
  const contentRes = await getSiteContentAction<PublicationsPageContent>("publications");
  const content: PublicationsPageContent = contentRes?.data || defaultPublicationsPageContent;

  return (
    <div className="w-full bg-[#F5F8FA] pb-20 pt-8 sm:pt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Header Section */}
        <div className="rounded-2xl lg:rounded-3xl border border-[#CDE5E7] bg-white p-7 sm:p-10 xl:p-14 shadow-[0_10px_35px_rgba(11,45,69,0.05)]">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-xs sm:text-sm font-extrabold uppercase tracking-widest text-[#135C70]">
              {content.eyebrow || "Research & Insights"}
            </span>
            <TealWedge className="w-10 h-3" />
          </div>

          <h1 className="text-3xl sm:text-4xl xl:text-5xl font-extrabold text-[#0B2D45] tracking-tight">
            {content.title || "Publications & Industry Papers"}
          </h1>

          <p className="mt-4 max-w-3xl text-sm sm:text-base leading-relaxed text-[#476375] font-normal">
            {content.subtitle ||
              "Peer-reviewed literature, systematic reviews, and industry insights on subcutaneous formulation, combination products, and biologics delivery technology."}
          </p>
        </div>

        {/* Publications Grid / List */}
        <div className="space-y-6">
          <div className="flex items-center justify-between pb-2 border-b border-[#D8ECF0]">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#516C7D]">
              Peer-Reviewed Articles ({content.items?.length || 0})
            </h2>
            <span className="text-xs text-[#718898]">Chesapeake Pharma Scientific Contributions</span>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {content.items && content.items.length > 0 ? (
              content.items.map((pub, idx) => (
                <article
                  key={pub.id || idx}
                  className="rounded-2xl border border-[#D5E7EA] bg-white p-6 sm:p-8 shadow-card hover:border-[#289CA0] hover:shadow-lg transition-all duration-200 group"
                >
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="flex-1 space-y-3">
                      {/* Tags & Badges */}
                      <div className="flex flex-wrap items-center gap-2">
                        {pub.badge && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EAF7F8] border border-[#BCE1E4] text-[#135C70] text-xs font-bold uppercase tracking-wide">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#289CA0]" />
                            {pub.badge}
                          </span>
                        )}
                        {pub.status && (
                          <span className="px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 text-xs font-semibold">
                            {pub.status}
                          </span>
                        )}
                        <span className="inline-flex items-center gap-1 text-xs text-[#718898] font-medium ml-1">
                          <Calendar size={13} />
                          {pub.year}
                        </span>
                      </div>

                      {/* Title */}
                      <h3 className="text-lg sm:text-xl font-bold text-[#0B2D45] leading-snug group-hover:text-[#135C70] transition-colors">
                        {pub.title}
                      </h3>

                      {/* Authors */}
                      <p className="text-xs sm:text-sm text-[#476375] font-medium flex items-center gap-2">
                        <UserCheck size={14} className="text-[#289CA0] shrink-0" />
                        <span>{pub.authors}</span>
                      </p>

                      {/* Journal & Volume */}
                      <p className="text-xs sm:text-sm text-[#516C7D]">
                        <span className="font-semibold italic text-[#0B2D45]">{pub.journal}</span>
                        {pub.volume && <span className="ml-1 text-slate-500">· {pub.volume}</span>}
                      </p>

                      {/* DOI */}
                      {pub.doi && (
                        <p className="text-xs text-[#718898] break-all pt-1 font-mono">
                          DOI:{" "}
                          <a
                            href={pub.doi}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#135C70] hover:underline"
                          >
                            {pub.doi}
                          </a>
                        </p>
                      )}
                    </div>

                    {/* Action Link / Button */}
                    <div className="flex md:flex-col justify-end items-end gap-2 shrink-0 pt-2 md:pt-0">
                      {pub.link ? (
                        <a
                          href={pub.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="focus-ring inline-flex items-center gap-2 rounded-lg bg-[#135C70] hover:bg-[#0B3B48] px-4 py-2 text-xs sm:text-sm font-bold text-white shadow-sm transition-all"
                        >
                          <span>Read Article</span>
                          <ExternalLink size={14} />
                        </a>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 text-slate-500 text-xs font-semibold">
                          <BookOpen size={14} />
                          Citation in press
                        </span>
                      )}
                    </div>
                  </div>
                </article>
              ))
            ) : (
              <div className="p-12 text-center bg-white rounded-2xl border border-line text-muted">
                No publications available currently.
              </div>
            )}
          </div>
        </div>

        {/* Bottom Advisory Callout */}
        <div className="rounded-2xl border border-[#CDE5E7] bg-gradient-to-r from-[#0B2D45] to-[#135C70] p-8 text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-md">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="text-xl font-bold">Looking for proprietary research or custom dossiers?</h3>
            <p className="text-xs sm:text-sm text-slate-200">
              Chesapeake Pharma prepares bespoke commercial intelligence reports and drug-device transition evaluations.
            </p>
          </div>
          <Link
            href="/contact"
            className="shrink-0 focus-ring inline-flex items-center gap-2 rounded-lg bg-[#289CA0] hover:bg-[#208386] px-5 py-3 text-xs sm:text-sm font-bold text-white shadow-md transition"
          >
            <span>Request Research Consultation</span>
            <ArrowRight size={15} />
          </Link>
        </div>
      </div>
    </div>
  );
}

