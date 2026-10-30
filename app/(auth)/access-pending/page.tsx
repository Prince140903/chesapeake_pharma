import Link from "next/link";
import { Clock3, ArrowRight } from "lucide-react";

export default function AccessPendingPage() {
  return (
    <div className="mx-auto w-full max-w-[620px] rounded-[28px] border border-line bg-white p-8 text-center shadow-soft sm:p-12">
      <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-aqua text-teal">
        <Clock3 size={28} />
      </div>
      <p className="eyebrow mt-8">Review in progress</p>
      <h1 className="mt-4 text-4xl font-bold text-navy">
        Your request is pending.
      </h1>
      <p className="mx-auto mt-5 max-w-lg text-base leading-7 text-muted">
        Database access is restricted to approved customers. Your access request is being reviewed by our team. You will be notified via email once a decision has been made.
      </p>
      <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
        <Link href="/" className="button-secondary">
          Return to website
        </Link>
        <Link href="/contact" className="button-primary gap-2">
          Contact Chesapeake Pharma <ArrowRight size={15} />
        </Link>
      </div>
    </div>
  );
}
