"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { HeroContent } from "@/lib/content-schema";
import { SafeImage } from "@/components/safe-image";

interface HeroBannerSliderProps {
  hero: HeroContent;
}

export function HeroBannerSlider({ hero }: HeroBannerSliderProps) {
  // Support an array of slider images; fallback to banner_image or default placeholder
  const images: string[] =
    Array.isArray(hero.banner_images) && hero.banner_images.length > 0
      ? hero.banner_images
      : [hero.banner_image || "/assets/banner.png"];

  // Default fallback image if any external or Supabase image fails
  const defaultFallback = hero.banner_image || "/assets/banner.png";

  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-advance slides every 6 seconds if multiple slides exist
  useEffect(() => {
    if (images.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 6000);
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
      aria-label="Chesapeake Pharma Overview"
      className="relative rounded-2xl lg:rounded-3xl overflow-hidden border border-[#CDE5E7] shadow-[0_12px_40px_rgba(11,45,69,0.06)] bg-[#0B2D45]"
    >
      <div className="relative w-full min-h-[440px] sm:min-h-[500px] xl:min-h-[560px] overflow-hidden">
        {/* Background Images Slider with Safe Fallback */}
        {images.map((imgSrc, idx) => (
          <div
            key={idx}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              idx === currentIndex ? "opacity-100 z-0" : "opacity-0 pointer-events-none -z-10"
            }`}
          >
            <SafeImage
              src={imgSrc}
              fallbackSrc={defaultFallback}
              alt={hero.banner_image_alt || `Chesapeake Pharma banner slide ${idx + 1}`}
              fill
              priority={idx === 0}
              sizes="100vw"
              className="object-contain object-center"
            />
          </div>
        ))}

        {/* Gradient Overlay - Dark navy on left, fades to transparent on right for readable text */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0B2D45]/90 via-[#0B2D45]/65 to-[#0B2D45]/30 z-10 pointer-events-none" />

        {/* Text Content Overlay */}
        <div className="relative z-20 h-full flex flex-col justify-between p-7 sm:p-10 xl:p-14">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 border border-white/30 text-white text-[11px] font-bold uppercase tracking-widest shadow-xs mb-5 backdrop-blur-sm">
              <span className="w-2 h-2 rounded-full bg-[#62D4DB] animate-pulse" />
              {hero.badge || "Drug Delivery Advisory"}
            </div>

            <h1 className="text-2xl sm:text-3xl xl:text-[38px] font-extrabold uppercase leading-[1.18] tracking-tight text-white">
              {hero.title_line1}
              <br />
              <span className="text-[#62D4DB]">{hero.title_highlight}</span>
              {hero.title_line2 && (
                <>
                  <br />
                  {hero.title_line2}
                </>
              )}
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

            {hero.citation && (
              <p className="mt-3 text-[11px] leading-relaxed text-white/70 max-w-xl italic">
                {hero.citation}
              </p>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-4 pt-6">
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
          </div>
        </div>

        {/* Slider Controls (if multiple slides) */}
        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={prevSlide}
              aria-label="Previous slide"
              className="absolute left-3 top-1/2 -translate-y-1/2 z-30 p-2 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-sm transition-all focus:outline-none focus:ring-2 focus:ring-white/50"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              type="button"
              onClick={nextSlide}
              aria-label="Next slide"
              className="absolute right-3 top-1/2 -translate-y-1/2 z-30 p-2 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-sm transition-all focus:outline-none focus:ring-2 focus:ring-white/50"
            >
              <ChevronRight size={20} />
            </button>

            {/* Slide Indicator Dots */}
            <div className="absolute bottom-4 right-6 z-30 flex items-center gap-2">
              {images.map((_, dotIdx) => (
                <button
                  key={dotIdx}
                  type="button"
                  onClick={() => setCurrentIndex(dotIdx)}
                  aria-label={`Go to slide ${dotIdx + 1}`}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    dotIdx === currentIndex ? "w-6 bg-[#62D4DB]" : "w-2 bg-white/50 hover:bg-white/80"
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
