import { CheckCircle2, CircleAlert, ArrowUpRight } from "lucide-react";

export function SectionIntro({ eyebrow, title, text, align = "left" }: { eyebrow: string; title: string; text?: string; align?: "left" | "center" }) {
  return <div className={align === "center" ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}><p className="eyebrow">{eyebrow}</p><h2 className="mt-3 text-3xl font-bold leading-tight text-navy sm:text-4xl">{title}</h2>{text && <p className="mt-4 text-base leading-7 text-muted">{text}</p>}</div>;
}

export function MiniArrowLink({ href, children }: { href: string; children: React.ReactNode }) { return <a href={href} className="focus-ring inline-flex items-center gap-2 text-sm font-bold text-navy transition hover:text-teal">{children}<ArrowUpRight size={15} /></a>; }
export function StatusLine({ type, children }: { type: "success" | "warning" | "error"; children: React.ReactNode }) { const Icon = type === "success" ? CheckCircle2 : CircleAlert; return <div className={`flex items-start gap-2 rounded-xl border px-3 py-2.5 text-sm ${type === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-800" : type === "warning" ? "border-amber-200 bg-amber-50 text-amber-900" : "border-rose-200 bg-rose-50 text-rose-900"}`}><Icon size={16} className="mt-0.5 shrink-0" />{children}</div>; }
