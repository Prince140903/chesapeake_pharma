
import Link from "next/link";
import { Mail, MapPin } from "lucide-react";
import { TealWedge } from "@/components/ui";

export function MarketingFooter() {
  return (
    <footer className="bg-[#082236] text-white border-t border-[#133A58]">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10">

        {/* Main Footer */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-8 lg:gap-16 py-12 lg:py-16">

          {/* Contact Information */}
          <div className="md:col-span-7">
            <div className="flex items-center gap-3">
              <span className="text-sm font-extrabold uppercase tracking-[0.18em]">
                Get In Touch
              </span>
              <TealWedge className="w-9 h-3" />
            </div>

            <div className="mt-6 space-y-2">
              <p className="text-lg font-bold tracking-tight text-white">
                Philip Green, Ph.D.
              </p>

              <p className="text-sm font-medium text-slate-300">
                President, Chesapeake Pharma LLC
              </p>

              <p className="flex items-center gap-2 pt-1 text-xs text-slate-400">
                <MapPin
                  size={14}
                  className="text-[#42B7B9] shrink-0"
                />
                Weehawken, NJ, USA
              </p>

              <div className="pt-3">
                <a
                  href="mailto:Philgreen2236@hotmail.com"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-[#42B7B9] hover:text-[#6ee7b7] transition-colors group"
                >
                  <Mail
                    size={15}
                    className="shrink-0 transition-transform group-hover:scale-110"
                  />
                  Philgreen2236@hotmail.com
                </a>
              </div>
            </div>

            <p className="mt-7 max-w-lg text-xs leading-6 text-slate-400">
              Specialized commercial strategy and technical advisory for
              drug delivery technologies, device integration, and
              IV-to-subcutaneous formulation transitions.
            </p>
          </div>

          {/* Navigation */}
          <div className="md:col-span-5">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#42B7B9]">
              Navigation
            </p>

            <nav
              className="mt-6 grid grid-cols-2 gap-x-8 gap-y-4 text-sm text-slate-300"
              aria-label="Footer primary navigation"
            >
              <Link href="/" className="hover:text-white transition-colors">
                Home
              </Link>

              <Link href="/about" className="hover:text-white transition-colors">
                About Us
              </Link>

              <Link href="/publications" className="hover:text-white transition-colors">
                Publications
              </Link>

              <Link href="/contact" className="hover:text-white transition-colors">
                Contact
              </Link>

              <Link href="/login" className="hover:text-white transition-colors">
                Client Login
              </Link>

              <Link href="/register" className="hover:text-white transition-colors">
                Get Access
              </Link>
            </nav>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">

            <p className="text-xs text-slate-400 text-center sm:text-left">
              © 2022 Chesapeake Pharma LLC. All rights reserved.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-slate-400">
              <Link href="/contact" className="hover:text-white transition-colors">
                Contact Solution
              </Link>

              <span className="text-slate-600">·</span>

              <Link href="/about" className="hover:text-white transition-colors">
                Sitemap
              </Link>

              <span className="text-slate-600">·</span>

              <Link href="/about" className="hover:text-white transition-colors">
                Privacy & Terms
              </Link>
            </div>

          </div>
        </div>

      </div>
    </footer>
  );
}
