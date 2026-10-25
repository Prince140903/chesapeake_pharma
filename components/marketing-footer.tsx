import Link from "next/link";
import { Mail, MapPin, ArrowUpRight } from "lucide-react";
import { TealWedge } from "@/components/ui";

export function MarketingFooter() {
  return (
    <footer className="bg-[#082236] text-white border-t border-[#133A58]">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 lg:gap-12 items-start">
          
          {/* GET IN TOUCH / Office Details */}
          <div className="md:col-span-5 lg:col-span-5">
            <div className="flex items-center gap-2.5">
              <span className="text-sm font-extrabold uppercase tracking-widest text-white">
                GET IN TOUCH
              </span>
              <TealWedge className="w-9 h-3" />
            </div>

            <div className="mt-5 space-y-2 text-sm text-slate-300">
              <p className="font-bold text-base text-white tracking-tight">Philip Green, Ph.D.</p>
              <p className="text-slate-300 font-medium">President, Chesapeake Pharma LLC</p>
              <p className="flex items-center gap-2 text-slate-400 text-xs">
                <MapPin size={14} className="text-[#42B7B9] shrink-0" />
                Weehawken, NJ, USA
              </p>
              <div className="pt-2">
                <a
                  href="mailto:Philgreen2236@hotmail.com"
                  className="inline-flex items-center gap-2 text-sm text-[#42B7B9] hover:text-[#6ee7b7] font-semibold transition group"
                >
                  <Mail size={15} className="shrink-0 transition-transform group-hover:scale-110" />
                  <span>Philgreen2236@hotmail.com</span>
                </a>
              </div>
            </div>

            <p className="mt-6 text-xs leading-relaxed text-slate-400 max-w-sm">
              Specialized commercial strategy and technical advisory for drug delivery technologies,
              device integration, and IV-to-subcutaneous formulation transitions.
            </p>
          </div>

          {/* Navigation Links */}
          <div className="md:col-span-3 lg:col-span-3">
            <p className="text-xs font-bold uppercase tracking-widest text-[#42B7B9]">
              Navigation
            </p>
            <nav className="mt-4 grid grid-cols-1 gap-2.5 text-sm text-slate-300" aria-label="Footer primary navigation">
              <Link href="/" className="hover:text-white transition">Home</Link>
              <Link href="/about" className="hover:text-white transition">About Us</Link>
              <Link href="/leadership" className="hover:text-white transition">Leadership</Link>
              <Link href="/services" className="hover:text-white transition">Services</Link>
              <Link href="/drug-insights" className="hover:text-white transition">Drug Insights</Link>
              <Link href="/clients" className="hover:text-white transition">Clients</Link>
              <Link href="/contact" className="hover:text-white transition">Contact</Link>
            </nav>
          </div>

          {/* Database & Portal Links */}
          <div className="md:col-span-4 lg:col-span-4">
            <p className="text-xs font-bold uppercase tracking-widest text-[#42B7B9]">
              Intelligence Database
            </p>
            <div className="mt-4 grid grid-cols-1 gap-2.5 text-sm text-slate-300">
              <Link href="/portal/db1" className="hover:text-white transition flex items-center justify-between group">
                <span>DB1: Subcutaneous Database</span>
                <ArrowUpRight size={14} className="text-slate-500 group-hover:text-white transition" />
              </Link>
              <Link href="/portal/db2" className="hover:text-white transition flex items-center justify-between group">
                <span>DB2: Injectable Database</span>
                <ArrowUpRight size={14} className="text-slate-500 group-hover:text-white transition" />
              </Link>
              <Link href="/login" className="hover:text-white transition flex items-center justify-between group">
                <span>Subscriber Portal Login</span>
                <ArrowUpRight size={14} className="text-slate-500 group-hover:text-white transition" />
              </Link>
              <Link href="/register" className="hover:text-white transition flex items-center justify-between group">
                <span>Request Database Access</span>
                <ArrowUpRight size={14} className="text-slate-500 group-hover:text-white transition" />
              </Link>
            </div>

            <div className="mt-6 rounded-lg bg-[#0e314d] p-3.5 border border-[#1b4b72]/60">
              <p className="text-xs text-slate-300 leading-relaxed">
                Confidential advisory for life-science executive teams. Schedule a private consultation to discuss drug delivery opportunities.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <span>© 2022 Chesapeake Pharma LLC. All rights reserved.</span>
          <div className="flex items-center gap-5 text-xs text-slate-400">
            <Link href="/contact" className="hover:text-slate-200 transition">Contact Solution</Link>
            <span>·</span>
            <Link href="/about" className="hover:text-slate-200 transition">Sitemap</Link>
            <span>·</span>
            <Link href="/about" className="hover:text-slate-200 transition">Privacy & Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}


