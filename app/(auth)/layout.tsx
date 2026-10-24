import Link from "next/link";
import { BrandMark } from "@/components/marketing-header";
export default function AuthLayout({ children }: { children: React.ReactNode }) { return <div className="min-h-screen bg-canvas"><header className="container-shell flex h-24 items-center justify-between"><BrandMark compact /><Link href="/" className="text-sm font-semibold text-muted hover:text-navy">Back to public website</Link></header><main className="container-shell flex justify-center pb-20 pt-8">{children}</main></div>; }
