"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
} from "lucide-react";
import { TealWedge } from "@/components/ui";
import {
  CommercialStrategyIcon,
  DrugDeliveryIcon,
  BusinessDevIcon,
  CompetitiveIntelIcon,
} from "@/components/reference-icons";
import { ServiceItem, ExpertiseSectionContent } from "@/lib/content-schema";
import { SafeImage } from "@/components/safe-image";

interface ServicesExpertiseSectionProps {
  expertise?: ExpertiseSectionContent;
  services: ServiceItem[];
}

export function ServicesExpertiseSection({
  expertise,
  services,
}: ServicesExpertiseSectionProps) {
  // Slider images from expertise / document
  const defaultFallbackImages = [
    "/assets/docx_images/image6.png",
    "/assets/docx_images/image7.jpeg",
    "/assets/docx_images/image8.png",
    "/assets/docx_images/image9.png",
    "/assets/docx_images/image5.png",
  ];

  const sliderImages =
    expertise?.slider_images && expertise.slider_images.length > 0
      ? expertise.slider_images
      : defaultFallbackImages;

  // Responsive items-per-view detection
  const [itemsPerView, setItemsPerView] = useState(1);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setItemsPerView(4);
      } else if (window.innerWidth >= 640) {
        setItemsPerView(2);
      } else {
        setItemsPerView(1);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const totalImages = sliderImages.length;
  const maxIndex = Math.max(0, totalImages - itemsPerView);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Keep index within bounds if itemsPerView changes
  useEffect(() => {
    if (currentIndex > maxIndex) {
      setCurrentIndex(maxIndex);
    }
  }, [itemsPerView, maxIndex, currentIndex]);

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : maxIndex));
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev < maxIndex ? prev + 1 : 0));
  };

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

  return (
    <section
      aria-label="Expertise and Key Services"
      className="rounded-2xl lg:rounded-3xl border border-[#CDE5E7] bg-white p-7 sm:p-10 xl:p-12 shadow-[0_10px_35px_rgba(11,45,69,0.05)] space-y-10"
    >
      {/* 1. Header & Lead Narrative (Merged Expertise) */}
      <div className="space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-[#E6EFF1]">
          <h2 className="text-sm sm:text-base font-extrabold uppercase tracking-widest text-[#0B2D45]">
            {expertise?.title || "EXPERTISE"}
          </h2>
          <TealWedge className="w-10 h-3" />
        </div>

        <p className="text-sm sm:text-base leading-relaxed text-[#3D5668] max-w-5xl font-medium">
          {expertise?.lead_text ||
            "With over four decades of experience across global pharma and medical technology—including executive roles at Merck, Becton-Dickinson, and Novartis (Zyma SA)—Chesapeake Pharma under the leadership of Dr Phil Green provides commercial and strategic advisory services to pharmaceutical innovators and drug delivery developers."}
        </p>
      </div>

      {/* 2. Image Carousel Slider
          Responsive specs: 1/2 images in mobile screen and 3/4 images in big screen on slider */}
      <div className="relative py-2">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-bold uppercase tracking-wider text-[#135C70] flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#289CA0]" />
            COMBINATION DRUG DELIVERY DEVICES
          </span>

          {totalImages > itemsPerView && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={prevSlide}
                aria-label="Previous slide"
                className="p-2 rounded-full border border-[#D5E7EA] bg-white hover:bg-[#EAF7F8] text-[#135C70] transition shadow-xs"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                type="button"
                onClick={nextSlide}
                aria-label="Next slide"
                className="p-2 rounded-full border border-[#D5E7EA] bg-white hover:bg-[#EAF7F8] text-[#135C70] transition shadow-xs"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          )}
        </div>

        {/* Carousel Viewport */}
        <div className="overflow-hidden rounded-xl border border-[#D0E6E8] bg-[#F7FCFD] p-3 sm:p-4">
          <div
            className="flex transition-transform duration-500 ease-out"
            style={{
              transform: `translateX(-${currentIndex * (100 / itemsPerView)}%)`,
            }}
          >
            {sliderImages.map((src, idx) => (
              <div
                key={idx}
                className="shrink-0 px-2"
                style={{
                  width: `${100 / itemsPerView}%`,
                }}
              >
                <div className="relative aspect-[4/3] w-full rounded-lg overflow-hidden border border-[#D5E7EA] bg-white shadow-xs group">
                  <SafeImage
                    src={src}
                    fallbackSrc={
                      defaultFallbackImages[idx % defaultFallbackImages.length]
                    }
                    alt={`Drug delivery technology illustration ${idx + 1}`}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="object-contain p-2 transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Slide Indicator Dots */}
        {maxIndex > 0 && (
          <div className="mt-3 flex justify-center items-center gap-1.5">
            {Array.from({ length: maxIndex + 1 }).map((_, dotIdx) => (
              <button
                key={dotIdx}
                type="button"
                onClick={() => setCurrentIndex(dotIdx)}
                aria-label={`Jump to slide ${dotIdx + 1}`}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  dotIdx === currentIndex
                    ? "w-6 bg-[#289CA0]"
                    : "w-1.5 bg-[#CBDCE0]"
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* 3. Three Key Areas (Unified Key Services) */}
      <div className="pt-4 border-t border-[#E6EFF1] space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h3 className="text-sm sm:text-base font-extrabold uppercase tracking-widest text-[#0B2D45]">
            THREE KEY AREAS
          </h3>
          <span className="text-xs text-[#516C7D] font-medium">
            Core commercial and technical advisory pillars
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {services.map((svc, idx) => (
            <div
              key={idx}
              className="rounded-xl bg-[#F7FCFD] border border-[#D0E6E8] p-6 flex flex-col justify-between hover:border-[#289CA0] hover:bg-white hover:shadow-md transition-all duration-300 group"
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-[#E8F6F8] flex items-center justify-center border border-[#CFE8EA] group-hover:scale-105 transition-transform text-[#135C70]">
                  {renderServiceIcon(svc.icon)}
                </div>

                <h4 className="mt-5 text-base sm:text-lg font-bold text-[#0B2D45] tracking-tight group-hover:text-[#135C70] transition-colors">
                  {svc.title}
                </h4>

                <p className="mt-2 text-xs sm:text-sm leading-relaxed text-[#516C7D]">
                  {svc.description}
                </p>

                {/* Sub-bullets if available from document */}
                {svc.points && svc.points.length > 0 && (
                  <ul className="mt-4 space-y-2 border-t border-[#E6EFF1] pt-3 text-xs text-[#3D5668]">
                    {svc.points.map((pt, pIdx) => (
                      <li key={pIdx} className="flex items-start gap-2">
                        <CheckCircle2
                          size={14}
                          className="text-[#289CA0] shrink-0 mt-0.5"
                        />
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
