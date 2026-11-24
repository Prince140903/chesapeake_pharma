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
  const defaultDocImages = [
    "/assets/docx_images/banner1.jpeg",
    "/assets/docx_images/banner2.png",
    "/assets/docx_images/banner3.png",
  ];

  const images: string[] =
    Array.isArray(hero.banner_images) &&
    hero.banner_images.length > 0 &&
    !hero.banner_images.includes("/assets/banner1.jpeg")
      ? hero.banner_images
      : defaultDocImages;

  const defaultFallback = defaultDocImages[0];
  const [currentIndex, setCurrentIndex] = useState(0);

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
      className="rounded-2xl lg:rounded-3xl border border-[#CDE5E7] bg-white shadow-[0_12px_40px_rgba(11,45,69,0.06)] overflow-hidden"
    >
      <div className="flex flex-col lg:flex-row items-stretch">
        {/* LEFT SIDE: Text Content with Gradient Background */}
        <div className="relative flex-1 lg:w-7/12 p-6 sm:p-8 lg:p-10 xl:p-12 flex flex-col justify-center min-h-[400px] bg-gradient-to-br from-[#0B2D45] via-[#0E3854] to-[#13496B] overflow-hidden">
          {/* Subtle decorative grid/glow behind text */}
          <div className="absolute inset-0 bg-[radial-gradient(#289CA0_1px,transparent_1px)] [background-size:24px_24px] opacity-20 pointer-events-none" />

          <div className="relative max-w-xl mx-auto lg:mx-0 w-full z-10">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 border border-white/20 text-white text-[10px] sm:text-[11px] font-bold uppercase tracking-widest mb-4 sm:mb-6 backdrop-blur-sm">
              <span className="w-2 h-2 rounded-full bg-[#62D4DB] animate-pulse" />
              {hero.badge || "Drug Delivery Advisory"}
            </div>

            {/* Title */}
            <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-[40px] font-extrabold uppercase leading-[1.15] tracking-tight text-white mb-4 sm:mb-6">
              {hero.title_line1}
              <br />
              <span className="text-[#62D4DB]">{hero.title_highlight}</span>
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

            {/* Description */}
            <p className="text-sm sm:text-base text-white/80 font-normal leading-relaxed mb-4 sm:mb-6 max-w-xl">
              {hero.description}
            </p>

            {/* Citation */}
            {hero.citation && (
              <p className="text-[10px] sm:text-[11px] leading-relaxed text-white/60 italic mb-6 pt-4 border-t border-white/15 max-w-xl">
                {hero.citation}
              </p>
            )}

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Link
                href={hero.primary_btn_link || "/contact"}
                className="focus-ring inline-flex items-center justify-center gap-2 rounded-lg bg-[#62D4DB] hover:bg-[#42B7B9] px-5 py-3 text-xs sm:text-sm font-bold uppercase tracking-wider text-[#0B2D45] shadow-md hover:shadow-lg transition-all duration-200 active:scale-[0.98] group text-center shrink-0"
              >
                <span>
                  {hero.primary_btn_text || "SCHEDULE A CONSULTATION"}
                </span>
                <ArrowRight
                  size={15}
                  className="transition-transform group-hover:translate-x-1"
                />
              </Link>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE: Image Slider - Full Width, No Margins, No Background */}
        <div className="group relative flex-1 lg:w-5/12 min-h-[400px] lg:min-h-[500px] overflow-hidden">
          {/* Slides - Full width, no padding */}
          {images.map((imgSrc, idx) => (
            <div
              key={idx}
              className={`absolute inset-0 transition-opacity duration-700 ease-in-out flex items-center justify-center ${
                idx === currentIndex
                  ? "opacity-100 z-10"
                  : "opacity-0 pointer-events-none z-0"
              }`}
            >
              <div className="relative w-full h-full flex items-center justify-center">
                <SafeImage
                  src={imgSrc}
                  fallbackSrc={
                    defaultDocImages[idx % defaultDocImages.length] ||
                    defaultFallback
                  }
                  alt={
                    hero.banner_image_alt ||
                    `Chesapeake Pharma delivery tech slide ${idx + 1}`
                  }
                  fill
                  priority={idx === 0}
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-fill object-center w-full h-full"
                />
              </div>
            </div>
          ))}

          {/* Slider Navigation Arrows */}
          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={prevSlide}
                aria-label="Previous slide"
                className="sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100 absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 z-20 p-2 sm:p-2.5 rounded-full bg-black/35 hover:bg-black/60 text-white backdrop-blur-md transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#62D4DB]/60"
              >
                <ChevronLeft size={18} className="sm:w-5 sm:h-5" />
              </button>
              <button
                type="button"
                onClick={nextSlide}
                aria-label="Next slide"
                className="sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100 absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 z-20 p-2 sm:p-2.5 rounded-full bg-black/35 hover:bg-black/60 text-white backdrop-blur-md transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#62D4DB]/60"
              >
                <ChevronRight size={18} className="sm:w-5 sm:h-5" />
              </button>

              {/* Slider Dots Indicator */}
              <div className="sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100 absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 bg-black/30 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10 transition-opacity duration-300">
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
      </div>
    </section>
  );
}
