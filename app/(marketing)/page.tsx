import Link from "next/link";
import Image from "next/image";
import { ArrowRight, FileText, CheckCircle2 } from "lucide-react";
import { TealWedge } from "@/components/ui";
import {
  CommercialStrategyIcon,
  DrugDeliveryIcon,
  BusinessDevIcon,
  CompetitiveIntelIcon,
  MerckLogoBadge,
  NovartisLogoBadge,
} from "@/components/reference-icons";
import { getSiteContentAction } from "@/app/admin/content-actions";
import { HomePageContent, defaultHomePageContent } from "@/lib/content-schema";

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

  // Helper to map icon identifier string to component
  const renderServiceIcon = (iconName: string) => {
    switch (iconName) {
      case "DrugDelivery":
        return <DrugDeliveryIcon className="w-7 h-7" />;
      case "BusinessDev":
        return <BusinessDevIcon className="w-7 h-7" />;
      case "CompetitiveIntel":
        return <CompetitiveIntelIcon className="w-7 h-7" />;
      case "CommercialStrategy":
      default:
        return <CommercialStrategyIcon className="w-7 h-7" />;
    }
  };

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
            1. HERO SECTION - Full Image with Text Overlay
           ======================================================== */}
        <section
          aria-label="Chesapeake Pharma Overview"
          className="rounded-2xl lg:rounded-3xl overflow-hidden border border-[#CDE5E7] shadow-[0_12px_40px_rgba(11,45,69,0.06)]"
        >
          <div className="relative w-full min-h-[420px] sm:min-h-[480px] xl:min-h-[540px] overflow-hidden">
            {/* Background Image */}
            <Image
              src={hero.banner_image || "/assets/banner.png"}
              alt={hero.banner_image_alt || "Chesapeake Pharma consulting banner"}
              fill
              priority
              sizes="100vw"
              className="object-contain object-center"
            />

            {/* Gradient Overlay - Blue on left, fades to transparent on right */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#0B2D45]/85 via-[#0B2D45]/55 to-transparent" />

            {/* Text Content - Positioned on top */}
            <div className="absolute inset-0 flex flex-col justify-between p-7 sm:p-10 xl:p-14">
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 border border-white/30 text-white text-[11px] font-bold uppercase tracking-widest shadow-xs mb-5 backdrop-blur-sm">
                  <span className="w-2 h-2 rounded-full bg-[#62D4DB] animate-pulse" />
                  {hero.badge || "Drug Delivery Advisory"}
                </div>

                <h1 className="text-2xl sm:text-3xl xl:text-[38px] font-extrabold uppercase leading-[1.18] tracking-tight text-white">
                  {hero.title_line1}
                  <br />
                  <span className="text-[#62D4DB]">
                    {hero.title_highlight}
                  </span>
                  <br />
                  {hero.title_line2}
                  {hero.title_line3 && (
                    <>
                      <br />
                      {hero.title_line3}
                    </>
                  )}
                  {hero.title_line4 && (
                    <>
                      <br />
                      {hero.title_line4}
                    </>
                  )}
                </h1>

                <p className="mt-5 text-sm sm:text-base leading-relaxed text-white/90 max-w-xl font-normal">
                  {hero.description}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-4 pt-4">
                <Link
                  href={hero.primary_btn_link || "/contact"}
                  className="focus-ring inline-flex items-center justify-center gap-2.5 rounded-lg bg-[#135C70] hover:bg-[#0B3B48] px-6 py-3.5 text-xs sm:text-sm font-bold uppercase tracking-wider text-white shadow-md hover:shadow-lg transition-all duration-200 active:scale-[0.98] group"
                >
                  <span>{hero.primary_btn_text || "SCHEDULE A CONSULTATION"}</span>
                  <ArrowRight
                    size={16}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </Link>

                <Link
                  href={hero.secondary_btn_link || "/services"}
                  className="focus-ring inline-flex items-center justify-center rounded-lg bg-white/20 hover:bg-white/30 border border-white/40 backdrop-blur-sm px-5 py-3.5 text-xs sm:text-sm font-semibold text-white transition-all hover:border-white/60"
                >
                  {hero.secondary_btn_text || "Explore Key Services"}
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================
            2. STRATEGIC LEADERSHIP SECTION - Image Left, Content Right
           ======================================================== */}
        <section
          aria-label="Strategic Leadership & Experience"
          className="rounded-2xl lg:rounded-3xl border border-[#CDE5E7] bg-white p-0 overflow-hidden shadow-[0_10px_35px_rgba(11,45,69,0.05)]"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[500px] sm:min-h-[550px]">
            {/* Left Side - Image */}
            <div className="relative bg-gradient-to-b from-[#EBF6F8] to-[#D5EEF2] min-h-[350px] lg:min-h-full flex items-center justify-center p-6 sm:p-8 order-2 lg:order-1">
              <Image
                src={strat.image || "/assets/Picture1.png"}
                alt={strat.image_alt || "Advancing drug delivery and biologics commercialization"}
                fill
                sizes=""
                className="object-contain object-center w-[50%]"
              />
            </div>

            {/* Right Side - Content */}
            <div className="p-7 sm:p-10 xl:p-14 flex flex-col justify-between bg-white order-1 lg:order-2">
              {/* Header */}
              <div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0B2D45] tracking-tight mb-4">
                  {strat.title}
                </h2>
                <p className="text-sm sm:text-base text-[#476375] font-medium leading-relaxed mb-6">
                  {strat.subtitle}
                </p>

                {/* Main Description */}
                <div className="space-y-4 text-sm sm:text-[15px] leading-relaxed text-[#3D5668]">
                  <p>{strat.paragraph1}</p>
                  <p>{strat.paragraph2}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================
            3. ABOUT OUR LEADERSHIP SECTION (Directly under Hero)
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
            4. KEY SERVICES SECTION
           ======================================================== */}
        <section
          aria-label="Key Services"
          className="rounded-2xl lg:rounded-3xl border border-[#CDE5E7] bg-[#EEF8FA] p-7 sm:p-10 xl:p-12 shadow-[0_10px_35px_rgba(11,45,69,0.05)]"
        >
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-4 border-b border-[#D8ECF0]">
            <div className="flex items-center gap-3">
              <h2 className="text-sm sm:text-base font-extrabold uppercase tracking-widest text-[#0B2D45]">
                KEY SERVICES
              </h2>
              <TealWedge className="w-10 h-3" />
            </div>
            <p className="text-xs sm:text-sm text-[#476375] font-medium">
              Four specialized pillars of drug delivery commercial advisory
            </p>
          </div>

          {/* 4 Polished Services Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {services.map((svc, idx) => (
              <div
                key={idx}
                className="rounded-xl bg-white border border-[#D0E6E8] p-6 flex flex-col justify-between hover:border-[#289CA0] hover:shadow-md transition-all duration-300 group"
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-[#E8F6F8] flex items-center justify-center border border-[#CFE8EA] group-hover:scale-105 transition-transform">
                    {renderServiceIcon(svc.icon)}
                  </div>
                  <h3 className="mt-5 text-sm sm:text-base font-bold uppercase tracking-tight text-[#0B2D45] leading-snug whitespace-pre-line">
                    {svc.title}
                  </h3>
                  <p className="mt-2.5 text-xs sm:text-sm leading-relaxed text-[#516C7D]">
                    {svc.description}
                  </p>
                </div>
                <div className="mt-6 pt-3 border-t border-line/60">
                  <Link
                    href="/services"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#135C70] group-hover:text-[#289CA0] transition"
                  >
                    <span>Learn more</span>
                    <ArrowRight
                      size={13}
                      className="transition-transform group-hover:translate-x-1"
                    />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ========================================================
            5. FOCUSED AREAS
           ======================================================== */}
        <section
          aria-label="Focused Areas"
          className="rounded-2xl lg:rounded-3xl border border-[#CDE5E7] bg-white p-7 sm:p-10 xl:p-12 shadow-[0_10px_35px_rgba(11,45,69,0.05)]"
        >
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-4 border-b border-[#E6EFF1]">
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
          </div>

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
                  <div className="p-5 sm:p-6">
                    <h3 className="text-base sm:text-lg font-bold text-[#0B2D45] tracking-tight group-hover:text-[#135C70] transition-colors">
                      {card.title}
                    </h3>
                    <p className="mt-2 text-xs sm:text-sm leading-relaxed text-[#516C7D]">
                      {card.description}
                    </p>
                  </div>
                </div>
                <div className="px-5 pb-5 sm:px-6 sm:pb-6 pt-1">
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#135C70]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#289CA0]" />
                    {card.footer}
                  </span>
                </div>
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
            6. TESTIMONIALS & TRUSTED BY
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
