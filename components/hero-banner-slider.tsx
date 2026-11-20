"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { HeroContent } from "@/lib/content-schema";
import { SafeImage } from "@/components/safe-image";

interface HeroBannerSliderProps {
  hero: HeroContent;
}

export function HeroBannerSlider({ hero }: HeroBannerSliderProps) {
  // Document images default fallback sequence
  const defaultDocImages = [
    "/assets/docx_images/image2.png",
    "/assets/docx_images/image3.png",
    "/assets/docx_images/image4.jpeg"
  ];

  // Prioritize docx images if hero still has the old banner.png
  const images: string[] =
    Array.isArray(hero.banner_images) &&
    hero.banner_images.length > 0 &&
    !hero.banner_images.includes("/assets/banner.png")
      ? hero.banner_images
      : defaultDocImages;

  const defaultFallback = defaultDocImages[0];
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-advance slides every 5 seconds if multiple slides exist
  useEffect(() => {
    if (images.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [images.length]);

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  return (
    <section
      aria-label="Chesapeake Pharma Hero"
      className="rounded-2xl lg:rounded-3xl border border-[#CDE5E7] bg-white shadow-[0_12px_40px_rgba(11,45,69,0.06)] overflow-hidden flex flex-col justify-between"
    >
      {/* ========================================================
          1. TOP PART: SLIDER COMPONENT (Visual Drug Delivery Device Showcase)
         ======================================================== */}
      <div className="relative w-full h-[220px] sm:h-[260px] md:h-[300px] lg:h-[320px] bg-gradient-to-b from-[#0B2D45] via-[#0E3854] to-[#13496B] overflow-hidden">
        {/* Subtle decorative grid/glow behind slider */}
        <div className="absolute inset-0 bg-[radial-gradient(#289CA0_1px,transparent_1px)] [background-size:24px_24px] opacity-20 pointer-events-none" />

        {/* Slides */}
        {images.map((imgSrc, idx) => (
          <div
            key={idx}
            className={`absolute inset-0 p-4 sm:p-6 transition-opacity duration-700 ease-in-out flex items-center justify-center ${
              idx === currentIndex
                ? "opacity-100 z-10"
                : "opacity-0 pointer-events-none z-0"
            }`}
          >
            <div className="relative w-full h-full max-w-4xl mx-auto flex items-center justify-center">
              <SafeImage
                src={imgSrc}
                fallbackSrc={defaultDocImages[idx % defaultDocImages.length] || defaultFallback}
                alt={hero.banner_image_alt || `Chesapeake Pharma delivery tech slide ${idx + 1}`}
                fill
                priority={idx === 0}
                sizes="(max-width: 768px) 100vw, 1200px"
                className="object-contain object-center drop-shadow-[0_10px_25px_rgba(0,0,0,0.45)]"
              />
            </div>
          </div>
        ))}

        {/* Top-Right Badge Overlay */}
        <div className="absolute top-4 right-4 sm:top-5 sm:right-6 z-20">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/40 border border-white/20 text-white text-[10px] sm:text-[11px] font-bold uppercase tracking-widest backdrop-blur-md shadow-xs">
            <span className="w-2 h-2 rounded-full bg-[#62D4DB] animate-pulse" />
            {hero.badge || "Drug Delivery Advisory"}
          </div>
        </div>

        {/* Slider Navigation Arrows */}
        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={prevSlide}
              aria-label="Previous slide"
              className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 z-20 p-2 sm:p-2.5 rounded-full bg-black/35 hover:bg-black/60 text-white backdrop-blur-md transition-all focus:outline-none focus:ring-2 focus:ring-[#62D4DB]/60"
            >
              <ChevronLeft size={18} className="sm:w-5 sm:h-5" />
            </button>
            <button
              type="button"
              onClick={nextSlide}
              aria-label="Next slide"
              className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 z-20 p-2 sm:p-2.5 rounded-full bg-black/35 hover:bg-black/60 text-white backdrop-blur-md transition-all focus:outline-none focus:ring-2 focus:ring-[#62D4DB]/60"
            >
              <ChevronRight size={18} className="sm:w-5 sm:h-5" />
            </button>

            {/* Slider Dots Indicator */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 bg-black/30 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10">
              {images.map((_, dotIdx) => (
                <button
                  key={dotIdx}
                  type="button"
                  onClick={() => setCurrentIndex(dotIdx)}
                  aria-label={`Go to slide ${dotIdx + 1}`}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    dotIdx === currentIndex
                      ? "w-6 bg-[#62D4DB]"
                      : "w-1.5 bg-white/50 hover:bg-white/80"
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* ========================================================
          2. BOTTOM PART: REDESIGNED CONTENT & CTA
         ======================================================== */}
      <div className="p-6 sm:p-8 lg:p-10 bg-white">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
          {/* Main Titles */}
          <div className="lg:col-span-7 space-y-2">
            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-[28px] xl:text-[32px] font-extrabold uppercase leading-[1.2] tracking-tight text-[#0B2D45]">
              {hero.title_line1}
              <br />
              <span className="text-[#135C70]">{hero.title_highlight}</span>
              {hero.title_line2 && (
                <>
                  <br />
                  <span>{hero.title_line2}</span>
                </>
              )}
              {hero.title_line3 && (
                <>
                  {" "}
                  <span>{hero.title_line3}</span>
                </>
              )}
            </h1>

            <p className="text-xs sm:text-sm text-[#476375] font-normal leading-relaxed max-w-2xl pt-1">
              {hero.description}
            </p>

            {hero.citation && (
              <p className="text-[10px] sm:text-[11px] leading-relaxed text-[#718898] italic pt-1 border-t border-[#EEF4F6] mt-2">
                {hero.citation}
              </p>
            )}
          </div>

          {/* Action CTAs */}
          <div className="lg:col-span-5 flex flex-col sm:flex-row lg:flex-col xl:flex-row items-stretch sm:items-center lg:items-end xl:items-center justify-end gap-3 pt-2 lg:pt-0">
            <Link
              href={hero.primary_btn_link || "/contact"}
              className="focus-ring inline-flex items-center justify-center gap-2 rounded-lg bg-[#135C70] hover:bg-[#0B3B48] px-5 py-3 text-xs sm:text-sm font-bold uppercase tracking-wider text-white shadow-md hover:shadow-lg transition-all duration-200 active:scale-[0.98] group text-center shrink-0"
            >
              <span>{hero.primary_btn_text || "SCHEDULE A CONSULTATION"}</span>
              <ArrowRight
                size={15}
                className="transition-transform group-hover:translate-x-1"
              />
            </Link>

            {/* <Link
              href={hero.secondary_btn_link || "/services"}
              className="focus-ring inline-flex items-center justify-center rounded-lg bg-[#EAF7F8] hover:bg-[#D5EEF2] border border-[#BCE1E4] px-4 py-3 text-xs sm:text-sm font-semibold text-[#135C70] transition-all text-center shrink-0"
            >
              {hero.secondary_btn_text || "Explore Key Services"}
            </Link> */}
          </div>
        </div>
      </div>
    </section>
  );
}
