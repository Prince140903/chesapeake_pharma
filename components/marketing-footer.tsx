import Link from "next/link";
import { BrandMark } from "@/components/marketing-header";

export function MarketingFooter() {
  return <footer className="bg-navy text-white">
    <div className="container-shell grid gap-10 py-12 md:grid-cols-[1.3fr_1fr_1fr]">
      <div><BrandMark compact /><p className="mt-5 max-w-sm text-sm leading-6 text-white/65">Independent drug delivery consulting and commercial intelligence for pharmaceutical and biotech teams.</p><p className="mt-5 text-xs text-white/45">Content and contact details shown here require Chesapeake Pharma confirmation.</p></div>
      <div><p className="eyebrow text-teal">Explore</p><div className="mt-4 grid gap-2 text-sm text-white/70">{[...[{ label: "Home", href: "/" }], ...[{ label: "Services", href: "/services" }, { label: "Drug insights", href: "/drug-insights" }, { label: "Contact", href: "/contact" }]].map((item) => <Link key={item.href} href={item.href} className="transition hover:text-white">{item.label}</Link>)}</div></div>
      <div><p className="eyebrow text-teal">Private access</p><div className="mt-4 grid gap-2 text-sm text-white/70"><Link href="/login" className="transition hover:text-white">Client login</Link><Link href="/register" className="transition hover:text-white">Request database access</Link><Link href="/contact" className="transition hover:text-white">Speak with Chesapeake Pharma</Link></div></div>
    </div>
    <div className="border-t border-white/10"><div className="container-shell flex flex-col gap-3 py-5 text-xs text-white/45 sm:flex-row sm:items-center sm:justify-between"><span>© {new Date().getFullYear()} Chesapeake Pharma LLC. Draft experience for review.</span><span>Privacy policy · Terms require final approval</span></div></div>
  </footer>;
}
