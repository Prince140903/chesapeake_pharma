"use client";

import { usePathname } from "next/navigation";
import { MarketingFooter } from "@/components/marketing-footer";
import { MarketingHeader } from "@/components/marketing-header";

export function MarketingShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#F5F8FA] flex flex-col antialiased selection:bg-[#42B7B9]/20 selection:text-[#0B2D45]">
      <MarketingHeader />
      <main className="flex-1">{children}</main>
      <MarketingFooter />
    </div>
  );
}


