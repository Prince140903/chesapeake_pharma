import Link from "next/link";
import { ArrowLeft, LockKeyhole } from "lucide-react";
import { PortalShell } from "@/components/portal-shell";
export default function DB2DetailPage() {
  return (
    <PortalShell>
      <div className="container-shell py-12">
        <Link
          href="/portal/db2"
          className="inline-flex items-center gap-2 text-sm font-semibold text-muted"
        >
          <ArrowLeft size={15} /> Back to DB2
        </Link>
        <div className="mt-8 max-w-3xl rounded-[26px] border border-line bg-white p-8 shadow-soft">
          <div className="grid h-12 w-12 place-items-center rounded-xl bg-aqua text-teal">
            <LockKeyhole />
          </div>
          <h1 className="mt-7 text-3xl font-bold text-navy">
            Demo record detail
          </h1>
          <p className="mt-3 text-muted">
            This detail view is ready to render all populated DB2 fields and
            references after Supabase access rules are connected.
          </p>
        </div>
      </div>
    </PortalShell>
  );
}
