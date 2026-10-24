import { MarketingFooter } from "@/components/marketing-footer";
import { MarketingHeader } from "@/components/marketing-header";

export function MarketingShell({ children }: { children: React.ReactNode }) { return <div className="min-h-screen bg-canvas"><MarketingHeader /><main>{children}</main><MarketingFooter /></div>; }
