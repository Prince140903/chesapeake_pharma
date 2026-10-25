import { FileText, Mail, MapPin, UserRound } from "lucide-react";
import { leadership } from "@/lib/content";

export default function LeadershipPage() {
  return (
    <div className="container-shell py-20 lg:py-28">
      <div className="grid gap-16 lg:grid-cols-[.6fr_1.4fr]">
        <div className="flex flex-col gap-6">
          <p className="eyebrow">Leadership</p>
          <h1 className="mt-2 text-5xl font-bold leading-tight text-navy">{leadership.name}</h1>
          <div className="flex items-center gap-3 text-sm font-semibold text-navy">
            <Mail size={16} className="text-teal" />
            <a href={`mailto:${leadership.email}`} className="transition hover:text-teal">
              {leadership.email}
            </a>
          </div>
          <div className="flex items-center gap-3 text-sm font-semibold text-navy">
            <MapPin size={16} className="text-teal" />
            <span>{leadership.location}</span>
          </div>
        </div>
        <div>
          <div className="grid gap-12">
            <div className="relative overflow-hidden rounded-[32px] border border-line bg-canvas shadow-soft p-5 sm:p-8">
              <div className="absolute -inset-2.5 rounded-[35px] bg-gradient-to-r from-teal via-aqua/60 to-teal/40 blur opacity-60" />
              <div className="relative rounded-[30px] border border-white/60 bg-white p-5 sm:p-8">
                <div className="flex items-center justify-between border-b border-line pb-6 sm:pb-8">
                  <div>
                    <p className="eyebrow">{leadership.eyebrow}</p>
                    <h2 className="mt-2 text-3xl font-bold text-navy sm:text-4xl">{leadership.name}</h2>
                    <p className="mt-2 text-lg font-medium text-ink">{leadership.title}, Chesapeake Pharma</p>
                    <p className="mt-1 text-sm text-muted">{leadership.location}</p>
                  </div>
                  <div className="grid aspect-square place-items-center rounded-2xl bg-aqua text-teal">
                    <UserRound size={56} strokeWidth={1.2} />
                  </div>
                </div>
                <div className="mt-8 space-y-6 text-base leading-8 text-muted">
                  {leadership.biography.map((paragraph, i) => (
                    <p key={i}>{paragraph}</p>
                  ))}
                </div>
                <div className="mt-10 flex items-center gap-3 text-sm font-semibold text-navy">
                  <Mail size={16} className="text-teal" />
                  <a href={`mailto:${leadership.email}`} className="transition hover:text-teal">
                    {leadership.email}
                  </a>
                </div>
              </div>
            </div>
            <div className="rounded-[26px] border border-line bg-white p-7 shadow-card">
              <p className="eyebrow">Curriculum summary</p>
              <h3 className="mt-3 text-xl font-bold text-navy">Professional background</h3>
              <ul className="mt-4 space-y-3 text-sm leading-7 text-muted list-disc pl-5">
                <li>Executive Director of Biologics Device Strategy, Merck US (2009–2018)</li>
                <li>16 years at Becton-Dickinson leading advanced delivery technology initiatives</li>
                <li>Transdermal and topical drug delivery roles at Novartis (Zyma) and L’Oréal/Galderma</li>
                <li>Current consultancy: commercial strategy, business development, competitive intelligence</li>
              </ul>
              <div className="mt-6">
                <button className="button-secondary gap-2"><FileText size={16} /> CV on request</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
