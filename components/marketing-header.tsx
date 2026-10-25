"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { navItems } from "@/lib/data";

export function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className="focus-ring inline-flex items-center gap-3 shrink-0" aria-label="Chesapeake Pharma home">
      <Image
        src="/assets/chesapeake-wordmark-reference.png"
        alt="Chesapeake Pharma LLC — Drug Delivery Consulting"
        width={162}
        height={43}
        priority
        className={`h-auto shrink-0 object-contain ${compact ? "w-[124px]" : "w-[150px] sm:w-[162px]"}`}
      />
    </Link>
  );
}

export function MarketingHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="border-b border-slate-200/80 bg-white/95 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex h-[62px] items-center justify-between">
        <BrandMark />

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-6 xl:gap-8 lg:flex" aria-label="Primary navigation">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`focus-ring relative py-1.5 text-xs xl:text-sm font-semibold tracking-tight transition ${
                  isActive
                    ? "text-[#289CA0] border-b-2 border-[#289CA0]"
                    : "text-[#163449] hover:text-[#289CA0]"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Discreet Client Login */}
        <div className="hidden items-center gap-3 lg:flex">
          <Link
            href="/login"
            className="focus-ring text-xs font-bold text-[#135C70] hover:text-white bg-[#EBF6F8] hover:bg-[#135C70] transition px-3.5 py-1.5 rounded-md border border-[#BCE1E4]"
          >
            Client Login
          </Link>
        </div>

        {/* Mobile Menu Trigger */}
        <button
          className="focus-ring rounded-lg p-2 text-navy lg:hidden hover:bg-slate-100 transition"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-label={open ? "Close navigation" : "Open navigation"}
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>


      {/* Mobile Menu Drawer */}
      {open && (
        <div className="border-t border-line bg-white px-5 py-4 lg:hidden shadow-lg animate-in fade-in duration-200">
          <nav className="flex flex-col gap-1" aria-label="Mobile navigation">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  onClick={() => setOpen(false)}
                  key={item.href}
                  href={item.href}
                  className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
                    isActive ? "bg-aqua text-[#289CA0]" : "text-navy hover:bg-aqua/60"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
            <div className="mt-2 pt-3 border-t border-line flex flex-col gap-2">
              <Link
                onClick={() => setOpen(false)}
                href="/login"
                className="button-secondary text-xs py-2 text-center"
              >
                Client Login
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}

