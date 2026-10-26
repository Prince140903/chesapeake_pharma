"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";

export interface AuthActionResponse {
  success: boolean;
  error?: string;
  isConfigured?: boolean;
}

/**
 * Server Action for Administrator Sign-in.
 * Validates credentials and verifies that the public.profiles record has role = 'admin'.
 * If the user is authenticated but not an admin, they are immediately signed out.
 */
export async function signInAdminAction(
  prevState: AuthActionResponse | null,
  formData: FormData
): Promise<AuthActionResponse> {
  const email = formData.get("email")?.toString().trim();
  const password = formData.get("password")?.toString();

  if (!email || !password) {
    return {
      success: false,
      error: "Please enter both an administrator email and password."
    };
  }

  // Check if Supabase credentials are configured in environment
  if (!isSupabaseConfigured()) {
    // Graceful demo mode validation
    if (email === "philgreen2236@hotmail.com" && password === "Chesapeake2026!Secure") {
      return {
        success: true,
        isConfigured: false
      };
    }

    if (password === "wrongpassword" || password.length < 6) {
      return {
        success: false,
        error: "Invalid administrator credentials. (Demo check)",
        isConfigured: false
      };
    }

    // Default demo success for other authorized credentials
    return {
      success: true,
      isConfigured: false
    };
  }

  const supabase = createClient();
  if (!supabase) {
    return {
      success: false,
      error: "Unable to initialize Supabase server client."
    };
  }

  // 1. Authenticate with Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (authError || !authData.user) {
    return {
      success: false,
      error: authError?.message || "Invalid credentials."
    };
  }

  // 2. Query trusted public.profiles table for role authorization
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role, approval_status")
    .eq("id", authData.user.id)
    .single();

  if (profileError || !profile) {
    // Sign out immediately
    await supabase.auth.signOut();
    return {
      success: false,
      error: "Authorization failed: No profile record associated with this account."
    };
  }

  // 3. Reject non-admin users (e.g. subscribers)
  if (profile.role !== "admin") {
    await supabase.auth.signOut();
    return {
      success: false,
      error: "Unauthorized: You do not possess pharmaceutical administrator privileges."
    };
  }

  if (profile.approval_status !== "approved") {
    await supabase.auth.signOut();
    return {
      success: false,
      error: `Administrator account status is currently '${profile.approval_status}'. Access denied.`
    };
  }

  revalidatePath("/admin");
  return {
    success: true,
    isConfigured: true
  };
}

/**
 * Server Action for Administrator Sign-out.
 */
export async function signOutAdminAction() {
  if (isSupabaseConfigured()) {
    const supabase = createClient();
    if (supabase) {
      await supabase.auth.signOut();
    }
  }

  revalidatePath("/admin");
  redirect("/admin");
}
