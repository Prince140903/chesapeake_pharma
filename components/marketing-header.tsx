"use client";

import Link from "next/link";
import Image from "next/image";
import { Menu, X, ArrowUpRight } from "lucide-react";
import { useState } from "react";
import { navItems } from "@/lib/data";

export function BrandMark({ compact = false }: { compact?: boolean }) {
  return <Link href="/" className="focus-ring inline-flex items-center gap-3" aria-label="Chesapeake Pharma home">
    <Image src="/assets/chesapeake-wordmark-reference.png" alt="Chesapeake Pharma LLC — Drug Delivery Consulting" width={162} height={43} priority className={`h-auto shrink-0 object-contain ${compact ? "w-[136px]" : "w-[162px]"}`} />
  </Link>;
}

export function MarketingHeader() {
  const [open, setOpen] = useState(false);
  return <header className="border-b border-line bg-white/90 backdrop-blur">
    <div className="container-shell flex h-[76px] items-center justify-between">
      <BrandMark />
      <nav className="hidden items-center gap-7 lg:flex" aria-label="Primary navigation">
        {navItems.map((item) => <Link key={item.href} href={item.href} className="focus-ring text-sm font-medium text-muted transition hover:text-navy">{item.label}</Link>)}
      </nav>
      <div className="hidden items-center gap-3 lg:flex">
        <Link href="/login" className="focus-ring px-3 py-2 text-sm font-semibold text-navy transition hover:text-teal">Client login</Link>
        <Link href="/register" className="button-primary gap-2">Request access <ArrowUpRight size={15} /></Link>
      </div>
      <button className="focus-ring rounded-lg p-2 text-navy lg:hidden" onClick={() => setOpen((value) => !value)} aria-expanded={open} aria-label={open ? "Close navigation" : "Open navigation"}>{open ? <X /> : <Menu />}</button>
    </div>
    {open && <div className="border-t border-line bg-white px-5 py-5 lg:hidden"><nav className="container-shell flex flex-col gap-1" aria-label="Mobile navigation">{navItems.map((item) => <Link onClick={() => setOpen(false)} key={item.href} href={item.href} className="rounded-lg px-3 py-3 text-sm font-semibold text-navy hover:bg-aqua">{item.label}</Link>)}<div className="mt-3 flex gap-3 border-t border-line pt-4"><Link href="/login" className="button-secondary flex-1">Client login</Link><Link href="/register" className="button-primary flex-1">Request access</Link></div></nav></div>}
  </header>;
}
