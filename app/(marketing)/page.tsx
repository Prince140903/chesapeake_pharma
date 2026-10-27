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

export default function HomePage() {
  return (
    <div className="w-full bg-[#F5F8FA] pb-16 pt-6 sm:pt-8 lg:pt-10 space-y-12 sm:space-y-16 lg:space-y-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 sm:space-y-16 lg:space-y-20">

        {/* ========================================================
            1. HERO SECTION
           ======================================================== */}
        <section
          aria-label="Chesapeake Pharma Overview"
          className="rounded-2xl lg:rounded-3xl overflow-hidden border border-[#CDE5E7] bg-white shadow-[0_12px_40px_rgba(11,45,69,0.06)]"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch min-h-[380px] xl:min-h-[420px]">
            {/* Left Content Side */}
            <div className="lg:col-span-7 p-7 sm:p-10 xl:p-14 flex flex-col justify-between bg-gradient-to-br from-[#EBF6F8] via-[#E2F3F5] to-[#D5EEF2]">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/70 border border-[#289CA0]/30 text-[#07546A] text-[11px] font-bold uppercase tracking-widest shadow-xs mb-5">
                  <span className="w-2 h-2 rounded-full bg-[#289CA0] animate-pulse" />
                  Drug Delivery Advisory
                </div>

                <h1 className="text-2xl sm:text-3xl xl:text-[38px] font-extrabold uppercase leading-[1.18] tracking-tight text-[#0B2D45]">
                  CHESAPEAKE PHARMA:
                  <br />
                  <span className="text-[#135C70]">DELIVERING STRATEGIC DRUG</span>
                  <br />
                  INSIGHTS & DELIVERY
                  <br />
                  TECHNOLOGY
                  <br />
                  COMMERCIALIZATION
                </h1>

                <p className="mt-5 text-sm sm:text-base leading-relaxed text-[#3D5668] max-w-xl font-normal">
                  Expert guidance on combination products, novel injectables, and IV-to-subcutaneous
                  transitions to derisk pharmaceutical pipeline investments.
                </p>
              </div>

              <div className="pt-8 sm:pt-10 flex flex-wrap items-center gap-4">
                <Link
                  href="/contact"
                  className="focus-ring inline-flex items-center justify-center gap-2.5 rounded-lg bg-[#135C70] hover:bg-[#0B3B48] px-6 py-3.5 text-xs sm:text-sm font-bold uppercase tracking-wider text-white shadow-md hover:shadow-lg transition-all duration-200 active:scale-[0.98] group"
                >
                  <span>SCHEDULE A CONSULTATION</span>
                  <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                </Link>

                <Link
                  href="/services"
                  className="focus-ring inline-flex items-center justify-center rounded-lg bg-white/80 hover:bg-white border border-[#B8DCDE] px-5 py-3.5 text-xs sm:text-sm font-semibold text-[#0B2D45] transition-all hover:border-[#135C70]"
                >
                  Explore Key Services
                </Link>
              </div>
            </div>

            {/* Right Photo Side */}
            <div className="lg:col-span-5 relative min-h-[300px] lg:min-h-full bg-[#E2F0F2] overflow-hidden">
              <Image
                src="/assets/MDS-white.png"
                alt="Dr. Philip Green in biotechnology consulting laboratory"
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 45vw"
                className="object-cover object-center transition-transform duration-700 hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0B2D45]/30 via-transparent to-transparent lg:hidden" />
            </div>
          </div>
        </section>

        {/* ========================================================
            2. ABOUT OUR LEADERSHIP SECTION (Directly under Hero)
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
                  src="/assets/dr-philip-green.png"
                  alt="Philip Green, Ph.D. — President, Chesapeake Pharma"
                  fill
                  sizes="(max-width: 768px) 240px, 20vw"
                  className="object-cover object-top"
                />
              </div>
              <div className="mt-3.5 flex items-center gap-2 text-xs font-semibold text-[#07546A]">
                <CheckCircle2 size={15} className="text-[#289CA0]" />
                <span>Verified Biopharma Executive</span>
              </div>
            </div>

            {/* Leadership Biography Content */}
            <div className="md:col-span-8 lg:col-span-9 flex flex-col justify-between h-full space-y-4">
              <div>
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-[#0B2D45] tracking-tight">
                    Philip Green, Ph.D.
                  </h3>
                  <span className="text-xs font-bold uppercase tracking-wider text-[#289CA0] bg-[#EAF7F8] px-3 py-1 rounded-full border border-[#BCE1E4]">
                    President
                  </span>
                </div>
                <p className="text-sm font-semibold text-[#163449]/70 mt-1 mb-4">
                  President & Founder, Chesapeake Pharma LLC · Weehawken, NJ, USA
                </p>

                <div className="space-y-3.5 text-sm sm:text-[15px] leading-relaxed text-[#3D5668]">
                  <p>
                    Dr. Green has a distinguished career specializing in the commercialization
                    of drug delivery technologies, spanning commercial strategy and market
                    positioning of combination products, novel injectables, and
                    IV-to-subcutaneous transitions. Currently, he consults with leading
                    pharmaceutical and biotech companies on commercial strategy, business
                    development, and pipeline optimization.
                  </p>
                  <p>
                    Previously, Dr. Green served as Executive Director of Biologics Device Strategy
                    at Merck US (where he led Keytruda SubQ formulation marketing), and spent 16 years
                    at Becton-Dickinson directing advanced delivery initiatives (transdermal,
                    microneedle, and high-volume subcutaneous pumps). He holds a PhD in Pharmaceutical
                    Chemistry from Cardiff University and completed post-doctoral training at the
                    University of California, San Francisco (UCSF).
                  </p>
                </div>
              </div>

              <div className="pt-4 flex flex-wrap items-center gap-3">
                <Link
                  href="/leadership"
                  className="focus-ring inline-flex items-center gap-2 rounded-lg bg-[#135C70] hover:bg-[#0B3B48] px-5 py-2.5 text-xs sm:text-sm font-bold text-white shadow-sm transition-all active:scale-[0.98] group"
                >
                  <FileText size={15} />
                  <span>View Full CV</span>
                  <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
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
            3. KEY SERVICES SECTION (Directly under Leadership)
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
            {/* Service 1 */}
            <div className="rounded-xl bg-white border border-[#D0E6E8] p-6 flex flex-col justify-between hover:border-[#289CA0] hover:shadow-md transition-all duration-300 group">
              <div>
                <div className="w-12 h-12 rounded-xl bg-[#E8F6F8] flex items-center justify-center border border-[#CFE8EA] group-hover:scale-105 transition-transform">
                  <CommercialStrategyIcon className="w-7 h-7" />
                </div>
                <h3 className="mt-5 text-sm sm:text-base font-bold uppercase tracking-tight text-[#0B2D45] leading-snug">
                  Commercial
                  <br />
                  Strategy
                </h3>
                <p className="mt-2.5 text-xs sm:text-sm leading-relaxed text-[#516C7D]">
                  Frame delivery choices around market needs, physician adoption, competitive differentiation, and practical payer positioning.
                </p>
              </div>
              <div className="mt-6 pt-3 border-t border-line/60">
                <Link
                  href="/services"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#135C70] group-hover:text-[#289CA0] transition"
                >
                  <span>Learn more</span>
                  <ArrowRight size={13} className="transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </div>

            {/* Service 2 */}
            <div className="rounded-xl bg-white border border-[#D0E6E8] p-6 flex flex-col justify-between hover:border-[#289CA0] hover:shadow-md transition-all duration-300 group">
              <div>
                <div className="w-12 h-12 rounded-xl bg-[#E8F6F8] flex items-center justify-center border border-[#CFE8EA] group-hover:scale-105 transition-transform">
                  <DrugDeliveryIcon className="w-7 h-7" />
                </div>
                <h3 className="mt-5 text-sm sm:text-base font-bold uppercase tracking-tight text-[#0B2D45] leading-snug">
                  Drug Delivery
                  <br />
                  Assessment
                </h3>
                <p className="mt-2.5 text-xs sm:text-sm leading-relaxed text-[#516C7D]">
                  Evaluate route, device, autoinjector, and large-volume formulation compatibility to select optimal combination systems.
                </p>
              </div>
              <div className="mt-6 pt-3 border-t border-line/60">
                <Link
                  href="/services"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#135C70] group-hover:text-[#289CA0] transition"
                >
                  <span>Learn more</span>
                  <ArrowRight size={13} className="transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </div>

            {/* Service 3 */}
            <div className="rounded-xl bg-white border border-[#D0E6E8] p-6 flex flex-col justify-between hover:border-[#289CA0] hover:shadow-md transition-all duration-300 group">
              <div>
                <div className="w-12 h-12 rounded-xl bg-[#E8F6F8] flex items-center justify-center border border-[#CFE8EA] group-hover:scale-105 transition-transform">
                  <BusinessDevIcon className="w-7 h-7" />
                </div>
                <h3 className="mt-5 text-sm sm:text-base font-bold uppercase tracking-tight text-[#0B2D45] leading-snug">
                  Business
                  <br />
                  Development
                </h3>
                <p className="mt-2.5 text-xs sm:text-sm leading-relaxed text-[#516C7D]">
                  Translate technical delivery signals into strategic partnership structures, licensing agreements, and co-development terms.
                </p>
              </div>
              <div className="mt-6 pt-3 border-t border-line/60">
                <Link
                  href="/services"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#135C70] group-hover:text-[#289CA0] transition"
                >
                  <span>Learn more</span>
                  <ArrowRight size={13} className="transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </div>

            {/* Service 4 */}
            <div className="rounded-xl bg-white border border-[#D0E6E8] p-6 flex flex-col justify-between hover:border-[#289CA0] hover:shadow-md transition-all duration-300 group">
              <div>
                <div className="w-12 h-12 rounded-xl bg-[#E8F6F8] flex items-center justify-center border border-[#CFE8EA] group-hover:scale-105 transition-transform">
                  <CompetitiveIntelIcon className="w-7 h-7" />
                </div>
                <h3 className="mt-5 text-sm sm:text-base font-bold uppercase tracking-tight text-[#0B2D45] leading-snug">
                  Competitive
                  <br />
                  Intelligence
                </h3>
                <p className="mt-2.5 text-xs sm:text-sm leading-relaxed text-[#516C7D]">
                  Continuously monitor competing drug delivery technologies, patent landscapes, formulation patents, and competitor pipeline milestones.
                </p>
              </div>
              <div className="mt-6 pt-3 border-t border-line/60">
                <Link
                  href="/services"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#135C70] group-hover:text-[#289CA0] transition"
                >
                  <span>Learn more</span>
                  <ArrowRight size={13} className="transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================
            4. FOCUSED AREAS (Directly under Key Services)
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
              Target therapeutic modalities driving high-volume delivery and formulation transitions
            </p>
          </div>

          {/* 3 Modality Focus Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1: Monoclonal Antibodies */}
            <div className="rounded-xl bg-[#F7FCFD] border border-[#D5E7EA] overflow-hidden flex flex-col justify-between hover:border-[#289CA0] hover:shadow-md transition-all duration-300 group">
              <div>
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-900">
                  <Image
                    src="/assets/monoclonal antibodies 1.png"
                    alt="Monoclonal Antibodies molecular binding illustration"
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0B2D45]/40 via-transparent to-transparent" />
                  <span className="absolute top-3 left-3 rounded-md bg-[#0B2D45]/85 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-sm">
                    Biologics Modality
                  </span>
                </div>
                <div className="p-5 sm:p-6">
                  <h3 className="text-base sm:text-lg font-bold text-[#0B2D45] tracking-tight group-hover:text-[#135C70] transition-colors">
                    Monoclonal Antibodies (mAbs)
                  </h3>
                  <p className="mt-2 text-xs sm:text-sm leading-relaxed text-[#516C7D]">
                    Strategic commercialization and device selection for standard and high-concentration mAbs transitioning from hospital IV infusions to rapid, patient-administered subcutaneous formulations.
                  </p>
                </div>
              </div>
              <div className="px-5 pb-5 sm:px-6 sm:pb-6 pt-1">
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#135C70]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#289CA0]" />
                  SC formulation & autoinjector integration
                </span>
              </div>
            </div>

            {/* Card 2: Bispecific Antibodies */}
            <div className="rounded-xl bg-[#F7FCFD] border border-[#D5E7EA] overflow-hidden flex flex-col justify-between hover:border-[#289CA0] hover:shadow-md transition-all duration-300 group">
              <div>
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-900">
                  <Image
                    src="/assets/bispecific antibodies 1.png"
                    alt="Bispecific Antibodies dual-targeting mechanism illustration"
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0B2D45]/40 via-transparent to-transparent" />
                  <span className="absolute top-3 left-3 rounded-md bg-[#0B2D45]/85 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-sm">
                    Dual-Targeting
                  </span>
                </div>
                <div className="p-5 sm:p-6">
                  <h3 className="text-base sm:text-lg font-bold text-[#0B2D45] tracking-tight group-hover:text-[#135C70] transition-colors">
                    Bispecific Antibodies
                  </h3>
                  <p className="mt-2 text-xs sm:text-sm leading-relaxed text-[#516C7D]">
                    Navigating complex dose optimization, target affinity balance, immunogenicity risks, and wearable infuser requirements for next-generation multi-specific antibody formats.
                  </p>
                </div>
              </div>
              <div className="px-5 pb-5 sm:px-6 sm:pb-6 pt-1">
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#135C70]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#289CA0]" />
                  T-cell engagers & on-body delivery
                </span>
              </div>
            </div>

            {/* Card 3: Nucleic Acids */}
            <div className="rounded-xl bg-[#F7FCFD] border border-[#D5E7EA] overflow-hidden flex flex-col justify-between hover:border-[#289CA0] hover:shadow-md transition-all duration-300 group">
              <div>
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-900">
                  <Image
                    src="/assets/nucleic acids 1.png"
                    alt="Nucleic Acids DNA and RNA strand delivery illustration"
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0B2D45]/40 via-transparent to-transparent" />
                  <span className="absolute top-3 left-3 rounded-md bg-[#0B2D45]/85 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-sm">
                    Genetic Medicines
                  </span>
                </div>
                <div className="p-5 sm:p-6">
                  <h3 className="text-base sm:text-lg font-bold text-[#0B2D45] tracking-tight group-hover:text-[#135C70] transition-colors">
                    Nucleic Acids & Oligonucleotides
                  </h3>
                  <p className="mt-2 text-xs sm:text-sm leading-relaxed text-[#516C7D]">
                    Formulation stabilization, lipid nanoparticle (LNP) delivery pathways, cold-chain considerations, and target delivery routing across mRNA, siRNA, and gene therapies.
                  </p>
                </div>
              </div>
              <div className="px-5 pb-5 sm:px-6 sm:pb-6 pt-1">
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#135C70]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#289CA0]" />
                  mRNA, siRNA & LNP delivery pathways
                </span>
              </div>
            </div>
          </div>

          {/* AI Disclaimer Footnote */}
          <div className="mt-8 pt-4 border-t border-[#E6EFF1] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-[#718898]">
            <p className="italic">
              * Note: The molecular and cellular images above were generated using AI for representational purposes only.
            </p>
            <span className="font-semibold text-[#135C70]">
              Chesapeake Pharma Technical Focus
            </span>
          </div>
        </section>

        {/* ========================================================
            5. TESTIMONIALS & TRUSTED BY (Directly under Focused Areas)
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

          {/* 4 Client Testimonial Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 items-stretch">
            {/* Card 1 */}
            <div className="rounded-xl border border-[#D5E7EA] bg-[#F7FCFD] p-5 flex flex-col justify-between hover:bg-white hover:border-[#289CA0] transition shadow-xs">
              <div>
                <div className="flex items-center justify-between border-b border-line/60 pb-3">
                  <MerckLogoBadge />
                  <span className="text-[10px] font-semibold text-muted">Client Quote</span>
                </div>
                <p className="mt-3.5 text-xs sm:text-sm leading-relaxed text-[#4A6273] italic">
                  &ldquo;Dr. Green pharmaceutical clients to penetration pharma pharmaceutical company key clients.&rdquo;
                </p>
              </div>
              <p className="mt-4 pt-3 border-t border-line/40 text-[11px] font-bold text-[#0B2D45]">
                Biologics Device Advisory
              </p>
            </div>

            {/* Card 2 */}
            <div className="rounded-xl border border-[#D5E7EA] bg-[#F7FCFD] p-5 flex flex-col justify-between hover:bg-white hover:border-[#289CA0] transition shadow-xs">
              <div>
                <div className="flex items-center justify-between border-b border-line/60 pb-3">
                  <NovartisLogoBadge />
                  <span className="text-[10px] font-semibold text-muted">Client Quote</span>
                </div>
                <p className="mt-3.5 text-xs sm:text-sm leading-relaxed text-[#4A6273] italic">
                  &ldquo;Dr. Green has a highest pharmaceutical sporadically inovartis.&rdquo;
                </p>
              </div>
              <p className="mt-4 pt-3 border-t border-line/40 text-[11px] font-bold text-[#0B2D45]">
                Combination Strategy Review
              </p>
            </div>

            {/* Card 3 */}
            <div className="rounded-xl border border-[#D5E7EA] bg-[#F7FCFD] p-5 flex flex-col justify-between hover:bg-white hover:border-[#289CA0] transition shadow-xs">
              <div>
                <div className="flex items-center justify-between border-b border-line/60 pb-3">
                  <NovartisLogoBadge />
                  <span className="text-[10px] font-semibold text-muted">Client Quote</span>
                </div>
                <p className="mt-3.5 text-xs sm:text-sm leading-relaxed text-[#4A6273] italic">
                  &ldquo;Dr. Green has distinguished pharmaceutical surg strategy and usen imvental nnovartis.&rdquo;
                </p>
              </div>
              <p className="mt-4 pt-3 border-t border-line/40 text-[11px] font-bold text-[#0B2D45]">
                Subcutaneous Transition
              </p>
            </div>

            {/* Card 4 */}
            <div className="rounded-xl border border-[#D5E7EA] bg-[#F7FCFD] p-5 flex flex-col justify-between hover:bg-white hover:border-[#289CA0] transition shadow-xs">
              <div>
                <div className="flex items-center justify-between border-b border-line/60 pb-3">
                  <MerckLogoBadge />
                  <span className="text-[10px] font-semibold text-muted">Client Quote</span>
                </div>
                <p className="mt-3.5 text-xs sm:text-sm leading-relaxed text-[#4A6273] italic">
                  &ldquo;Dr. Green has euntelization pharmaceutical analytics and consultantfy pharmaceutial dest.&rdquo;
                </p>
              </div>
              <p className="mt-4 pt-3 border-t border-line/40 text-[11px] font-bold text-[#0B2D45]">
                Formulation Analytics Lead
              </p>
            </div>
          </div>

          {/* Compliance & Verification Footnote */}
          <div className="mt-6 pt-4 border-t border-line/50 text-center">
            <p className="text-xs text-[#6F8A99]">
              * Content & client logos reflect the layout reference design. Formal endorsement approvals and verified client testimonials pending client confirmation.
            </p>
          </div>
        </section>

      </div>
    </div>
  );
}
