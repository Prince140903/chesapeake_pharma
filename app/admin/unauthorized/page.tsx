import Link from "next/link";
import Image from "next/image";
import { ShieldAlert, ArrowLeft, LogOut } from "lucide-react";
import { signOutAdminAction } from "@/app/admin/actions";

export default function AdminUnauthorizedPage() {
  return (
    <div className="min-h-screen bg-[#F5F8FA] flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-[480px] rounded-2xl border border-red-200 bg-white p-8 shadow-card text-center">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-red-50 text-red-600 border border-red-200">
          <ShieldAlert size={28} />
        </div>

        <div className="relative mx-auto mt-6 h-8 w-36">
          <Image
            src="/assets/chesapeake-wordmark-reference.png"
            alt="Chesapeake Pharma LLC"
            fill
            className="object-contain"
            priority
          />
        </div>

        <span className="mt-4 inline-block rounded-md bg-red-100 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-red-800">
          403 · Access Denied
        </span>

        <h1 className="mt-3 text-2xl font-bold text-[#0B2D45]">
          Administrator Privileges Required
        </h1>

        <p className="mt-3 text-xs leading-relaxed text-[#637786]">
          Your account is authenticated, but it does not possess the <strong>admin</strong> role in Chesapeake Pharma records. Subscribers cannot view or mutate administrative CMS data.
        </p>

        <div className="mt-6 rounded-lg bg-[#F5F8FA] border border-[#DCE6EB] p-3.5 text-left text-xs text-slate-600 space-y-1">
          <p className="font-bold text-[#0B2D45]">Enforced Security Rules:</p>
          <ul className="list-disc pl-4 text-[11px] space-y-0.5 text-slate-500">
            <li>Direct navigation to <code>/admin/*</code> is blocked by server-side verification.</li>
            <li>Role is verified directly from <code>public.profiles</code> on the server.</li>
            <li>Client-side state manipulation cannot elevate permissions.</li>
          </ul>
        </div>

        <div className="mt-7 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/portal"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg bg-[#135C70] px-4 py-2 text-xs font-bold uppercase tracking-wider text-white hover:bg-[#0B3B48] transition"
          >
            <ArrowLeft size={14} />
            <span>Subscriber Portal</span>
          </Link>

          <form action={signOutAdminAction} className="w-full sm:w-auto">
            <button
              type="submit"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
            >
              <LogOut size={14} />
              <span>Sign Out</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
