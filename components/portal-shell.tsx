import Link from "next/link";
import { ArrowLeft, Database, LockKeyhole, Search, UserRound } from "lucide-react";
import { BrandMark } from "@/components/marketing-header";

export function PortalShell({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-canvas"><header className="border-b border-line bg-white"><div className="container-shell flex min-h-[72px] items-center justify-between gap-4"><BrandMark compact /><div className="hidden items-center gap-2 border-l border-line pl-5 sm:flex"><Database size={18} className="text-teal" /><div><p className="text-sm font-bold text-navy">Drug Intelligence Database</p><p className="text-xs text-muted">Demo mode · no private records connected</p></div></div><div className="flex items-center gap-3"><span className="hidden text-right sm:block"><span className="block text-xs font-semibold text-navy">Guest preview</span><span className="block text-[11px] text-muted">Access not activated</span></span><Link href="/login" className="focus-ring grid h-9 w-9 place-items-center rounded-full bg-aqua text-navy" aria-label="Sign in"><UserRound size={16} /></Link></div></div></header><main>{children}</main></div>;
}

export function DatasetBadge({ dataset, active = false }: { dataset: "DB1" | "DB2"; active?: boolean }) {
  return <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold ${active ? "border-teal/40 bg-aqua text-[#07546A]" : "border-line bg-white text-muted"}`}><span className={`h-1.5 w-1.5 rounded-full ${active ? "bg-teal" : "bg-muted/40"}`} />{dataset} · {dataset === "DB1" ? "Subcutaneous" : "Injectable"}</span>;
}

export function DemoNotice() { return <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"><LockKeyhole size={17} className="mt-0.5 shrink-0" /><p><strong>Demo preview.</strong> Search results are illustrative only. Supabase authentication, entitlements, and private records are not connected.</p></div>; }
