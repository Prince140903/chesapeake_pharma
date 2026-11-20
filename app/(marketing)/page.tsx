import Link from "next/link";
import Image from "next/image";
import { ArrowRight, FileText, CheckCircle2 } from "lucide-react";
import { TealWedge } from "@/components/ui";
import {
  MerckLogoBadge,
  NovartisLogoBadge,
} from "@/components/reference-icons";
import { getSiteContentAction } from "@/app/admin/content-actions";
import { HomePageContent, defaultHomePageContent } from "@/lib/content-schema";
import { HeroBannerSlider } from "@/components/hero-banner-slider";
import { ServicesExpertiseSection } from "@/components/services-expertise-section";

export const revalidate = 0; // Dynamic route

export default async function HomePage() {
  const contentRes = await getSiteContentAction<HomePageContent>("home");
  const content: HomePageContent = contentRes?.data || defaultHomePageContent;

  const hero = content.hero || defaultHomePageContent.hero;
  const strat = content.strategic_leadership || defaultHomePageContent.strategic_leadership;
  const leader = content.leadership_spotlight || defaultHomePageContent.leadership_spotlight;
  const services = content.services_list || defaultHomePageContent.services_list;
  const focusAreas = content.focused_areas || defaultHomePageContent.focused_areas;
  const testimonials = content.testimonials || defaultHomePageContent.testimonials;
  const expertise = content.expertise_section || defaultHomePageContent.expertise_section;

  // Helper to render logo badge
  const renderLogoBadge = (logo: string) => {
    if (logo?.toLowerCase().includes("novartis")) {
      return <NovartisLogoBadge />;
    }
    return <MerckLogoBadge />;
  };

  return (
    <div className="w-full bg-[#F5F8FA] pb-16 pt-6 sm:pt-8 lg:pt-10 space-y-12 sm:space-y-16 lg:space-y-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 sm:space-y-16 lg:space-y-20">
        {/* ========================================================
            1. HERO SECTION - Image Slider Component with Content Overlay
           ======================================================== */}
        <HeroBannerSlider hero={hero} />

        {/* ========================================================
            2. EXPERTISE & KEY SERVICES SECTION (Unified)
               Includes lead expertise narrative, responsive image slider (1-2 on mobile, 3-4 on desktop),
               and the 3 Key Service areas specified in revisions doc
           ======================================================== */}
        <ServicesExpertiseSection expertise={expertise} services={services} />

        {/* ========================================================
            3. FOCUSED AREAS (Therapeutic Modalities)
           ======================================================== */}
        <section
          aria-label="Focused Modalities"
          className="rounded-2xl lg:rounded-3xl border border-[#CDE5E7] bg-white p-7 sm:p-10 xl:p-12 shadow-[0_10px_35px_rgba(11,45,69,0.05)]"
        >
          {/* Section Header */}
          {/* <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-4 border-b border-[#E6EFF1]">
            <div className="flex items-center gap-3">
              <h2 className="text-sm sm:text-base font-extrabold uppercase tracking-widest text-[#0B2D45]">
                FOCUSED AREAS
              </h2>
              <TealWedge className="w-10 h-3" />
            </div>
            <p className="text-xs sm:text-sm text-[#476375] font-medium">
              Target therapeutic modalities driving high-volume delivery and
              formulation transitions
            </p>
          </div> */}

          {/* Modality Focus Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {focusAreas.map((card, idx) => (
              <div
                key={idx}
                className="rounded-xl bg-[#F7FCFD] border border-[#D5E7EA] overflow-hidden flex flex-col justify-between hover:border-[#289CA0] hover:shadow-md transition-all duration-300 group"
              >
                <div>
                  <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-900">
                    <Image
                      src={card.image || "/assets/monoclonal antibodies 1.png"}
                      alt={card.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0B2D45]/40 via-transparent to-transparent" />
                    <span className="absolute top-3 left-3 rounded-md bg-[#0B2D45]/85 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-sm">
                      {card.tag}
                    </span>
                  </div>
                  {/* <div className="p-5 sm:p-6">
                    <h3 className="text-base sm:text-lg font-bold text-[#0B2D45] tracking-tight group-hover:text-[#135C70] transition-colors">
                      {card.title}
                    </h3>
                    <p className="mt-2 text-xs sm:text-sm leading-relaxed text-[#516C7D]">
                      {card.description}
                    </p>
                  </div> */}
                </div>
                {/* <div className="px-5 pb-5 sm:px-6 sm:pb-6 pt-1">
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#135C70]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#289CA0]" />
                    {card.footer}
                  </span>
                </div> */}
              </div>
            ))}
          </div>

          {/* AI Disclaimer Footnote */}
          <div className="mt-8 pt-4 border-t border-[#E6EFF1] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-[#718898]">
            <p className="italic">
              * Note: The molecular and cellular images above were generated
              using AI for representational purposes only.
            </p>
            <span className="font-semibold text-[#135C70]">
              Chesapeake Pharma Technical Focus
            </span>
          </div>
        </section>

        {/* ========================================================
            4. ABOUT OUR LEADERSHIP SECTION
           ======================================================== */}
        <section
          aria-label="About Our Leadership"
          className="rounded-2xl lg:rounded-3xl border border-[#CDE5E7] bg-white p-7 sm:p-10 xl:p-12 shadow-[0_10px_35px_rgba(11,45,69,0.05)]"
        >
          {/* Section Header */}
          <div className="flex items-center gap-3 mb-8 pb-4 border-b border-[#E6EFF1]">
            <h2 className="text-sm sm:text-base font-extrabold uppercase tracking-widest text-[#0B2D45]">
              ABOUT OUR LEADERSHIP
            </h2>
            <TealWedge className="w-10 h-3" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-10 items-start">
            {/* Leadership Portrait */}
            <div className="md:col-span-4 lg:col-span-3 flex flex-col items-center sm:items-start">
              <div className="relative aspect-[4/5] rounded-xl overflow-hidden border-2 border-[#D4E8EB] bg-[#E8F6F8] w-full max-w-[240px] shadow-sm">
                <Image
                  src={leader.image || "/assets/image.png"}
                  alt={leader.image_alt || "Philip Green, Ph.D. — President, Chesapeake Pharma"}
                  fill
                  sizes="(max-width: 768px) 240px, 20vw"
                  className="object-contain object-center"
                />
              </div>
              <div className="mt-3.5 flex items-center gap-2 text-xs font-semibold text-[#07546A]">
                <CheckCircle2 size={15} className="text-[#289CA0]" />
                <span>{leader.badge_text || "Verified Biopharma Executive"}</span>
              </div>
            </div>

            {/* Leadership Biography Content */}
            <div className="md:col-span-8 lg:col-span-9 flex flex-col justify-between h-full space-y-4">
              <div>
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-[#0B2D45] tracking-tight">
                    {leader.name}
                  </h3>
                  <span className="text-xs font-bold uppercase tracking-wider text-[#289CA0] bg-[#EAF7F8] px-3 py-1 rounded-full border border-[#BCE1E4]">
                    {leader.role_badge}
                  </span>
                </div>
                <p className="text-sm font-semibold text-[#163449]/70 mt-1 mb-4">
                  {leader.title_subtitle}
                </p>

                <div className="space-y-3.5 text-sm sm:text-[15px] leading-relaxed text-[#3D5668]">
                  <p>{leader.paragraph1}</p>
                  <p>{leader.paragraph2}</p>
                </div>
              </div>

              <div className="pt-4 flex flex-wrap items-center gap-3">
                <Link
                  href="/leadership"
                  className="focus-ring inline-flex items-center gap-2 rounded-lg bg-[#135C70] hover:bg-[#0B3B48] px-5 py-2.5 text-xs sm:text-sm font-bold text-white shadow-sm transition-all active:scale-[0.98] group"
                >
                  <FileText size={15} />
                  <span>View Full CV</span>
                  <ArrowRight
                    size={14}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </Link>

                <Link
                  href="/contact"
                  className="focus-ring inline-flex items-center gap-2 rounded-lg border border-line bg-white hover:bg-aqua px-4 py-2.5 text-xs sm:text-sm font-semibold text-navy transition"
                >
                  Schedule Executive Consultation
                </Link>
              </div>
            </div>
          </div>
        </section>

        

        {/* ========================================================
           5. TESTIMONIALS & TRUSTED BY
           ======================================================== */}
        <section
          aria-label="Testimonials and Trusted By"
          className="rounded-2xl lg:rounded-3xl border border-[#CDE5E7] bg-white p-7 sm:p-10 xl:p-12 shadow-[0_10px_35px_rgba(11,45,69,0.05)]"
        >
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-4 border-b border-[#E6EFF1]">
            <div className="flex items-center gap-3">
              <h2 className="text-sm sm:text-base font-extrabold uppercase tracking-widest text-[#0B2D45]">
                TESTIMONIALS & TRUSTED BY
              </h2>
              <TealWedge className="w-10 h-3" />
            </div>
            <span className="text-xs text-[#516C7D] font-medium">
              Industry peer recognition & pharmaceutical partnership references
            </span>
          </div>

          {/* Client Testimonial Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 items-stretch">
            {testimonials.map((t, idx) => (
              <div
                key={idx}
                className="rounded-xl border border-[#D5E7EA] bg-[#F7FCFD] p-5 flex flex-col justify-between hover:bg-white hover:border-[#289CA0] transition shadow-xs"
              >
                <div>
                  <div className="flex items-center justify-between border-b border-line/60 pb-3">
                    {renderLogoBadge(t.logo)}
                    <span className="text-[10px] font-semibold text-muted">
                      Client Quote
                    </span>
                  </div>
                  <p className="mt-3.5 text-xs sm:text-sm leading-relaxed text-[#4A6273] italic">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                </div>
                <p className="mt-4 pt-3 border-t border-line/40 text-[11px] font-bold text-[#0B2D45]">
                  {t.attribution}
                </p>
              </div>
            ))}
          </div>

          {/* Compliance & Verification Footnote */}
          <div className="mt-6 pt-4 border-t border-line/50 text-center">
            <p className="text-xs text-[#6F8A99]">
              * Content & client logos reflect the layout reference design.
              Formal endorsement approvals and verified client testimonials
              pending client confirmation.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
