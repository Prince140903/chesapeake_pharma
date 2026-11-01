"use client";

import Link from "next/link";
import {
  ArrowLeft,
  Database,
  LockKeyhole,
  Search,
  UserRound,
} from "lucide-react";
import { BrandMark } from "@/components/marketing-header";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface UserProfile {
  email: string;
  user_metadata?: {
    full_name?: string;
  };
}

export function PortalShell({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const supabase = createClient();
        if (!supabase) {
          setLoading(false);
          return;
        }

        const {
          data: { user: authUser },
        } = await supabase.auth.getUser();

        if (authUser) {
          setUser({
            email: authUser.email || "",
            user_metadata: authUser.user_metadata,
          });
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const displayName =
    user?.user_metadata?.full_name || user?.email || "Guest";

  return (
    <div className="min-h-screen bg-canvas">
      <header className="border-b border-line bg-white">
        <div className="container-shell flex min-h-[72px] items-center justify-between gap-4">
          <BrandMark compact />
          <div className="hidden items-center gap-2 border-l border-line pl-5 sm:flex">
            <Database size={18} className="text-teal" />
            <div>
              <p className="text-sm font-bold text-navy">
                Drug Intelligence Database
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {!loading && (
              <span className="hidden text-right sm:block">
                <span className="block text-xs font-semibold text-navy">
                  {displayName}
                </span>
                <span className="block text-[11px] text-muted">
                  Access granted
                </span>
              </span>
            )}
            <Link
              href="/login"
              className="focus-ring grid h-9 w-9 place-items-center rounded-full bg-aqua text-navy"
              aria-label="Sign in"
            >
              <UserRound size={16} />
            </Link>
          </div>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}

export function DatasetBadge({
  dataset,
  active = false,
}: {
  dataset: "DB1" | "DB2";
  active?: boolean;
}) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold ${active ? "border-teal/40 bg-aqua text-[#07546A]" : "border-line bg-white text-muted"}`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${active ? "bg-teal" : "bg-muted/40"}`}
      />
      {dataset} · {dataset === "DB1" ? "Subcutaneous" : "Injectable"}
    </span>
  );
}
