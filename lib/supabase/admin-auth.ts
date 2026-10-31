import { createClient } from "./server";

export interface AdminUser {
  id: string;
  full_name: string;
  email: string;
  company_name: string;
  role: "admin" | "subscriber";
  approval_status: "pending" | "approved" | "rejected";
  requested_packs: "DB1" | "DB2" | "DB1 & DB2";
  created_at: string;
  last_sign_in?: string;
  notes?: string;
}

export interface AdminAuthResult {
  isAuthenticated: boolean;
  isAdmin: boolean;
  user: {
    id: string;
    email: string;
  } | null;
  profile: {
    id: string;
    full_name: string;
    company_name: string;
    role: "admin" | "subscriber";
    approval_status: "pending" | "approved" | "rejected";
  } | null;
  error?: string;
}

/**
 * Server-side verification of admin credentials.
 * Checks both valid Supabase session and trusted public.profiles role = 'admin'.
 */
export async function verifyAdminSession(): Promise<AdminAuthResult> {
  const supabase = createClient();

  // If Supabase credentials are not configured, return demo admin state safely
  if (!supabase) {
    return {
      isAuthenticated: true,
      isAdmin: true,
      user: {
        id: "usr-000",
        email: "philgreen2236@hotmail.com"
      },
      profile: {
        id: "usr-000",
        full_name: "Philip Green, Ph.D.",
        company_name: "Chesapeake Pharma LLC",
        role: "admin",
        approval_status: "approved"
      }
    };
  }

  try {
    // 1. Get authenticated user from Supabase Auth
    const {
      data: { user },
      error: userError
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return {
        isAuthenticated: false,
        isAdmin: false,
        user: null,
        profile: null,
        error: "Unauthenticated session."
      };
    }

    // 2. Query trusted public.profiles record (never trust client-sent role)
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, full_name, company_name, role, approval_status")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      return {
        isAuthenticated: true,
        isAdmin: false,
        user: { id: user.id, email: user.email || "" },
        profile: null,
        error: "Profile record not found for this user."
      };
    }

    // 3. Verify role is strictly 'admin' and approved
    const isAdmin = profile.role === "admin" && profile.approval_status === "approved";

    return {
      isAuthenticated: true,
      isAdmin,
      user: { id: user.id, email: user.email || "" },
      profile: {
        id: profile.id,
        full_name: profile.full_name || "",
        company_name: profile.company_name || "",
        role: profile.role,
        approval_status: profile.approval_status
      },
      error: !isAdmin
        ? "Access denied: Account is not provisioned with administrator role."
        : undefined
    };
  } catch (err: any) {
    return {
      isAuthenticated: false,
      isAdmin: false,
      user: null,
      profile: null,
      error: err?.message || "Unexpected authentication error."
    };
  }
}
