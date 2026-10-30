"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { AdminUser } from "@/lib/admin-mock-data";

export interface UserActionResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Fetch all users from Supabase
 */
export async function fetchUsersAction(): Promise<UserActionResponse<AdminUser[]>> {
  try {
    const supabase = createClient();
    if (!supabase) {
      return {
        success: false,
        error: "Supabase not configured"
      };
    }

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      return {
        success: false,
        error: error.message
      };
    }

    // Map database records to AdminUser format
    const users = (data || []).map((user: any) => ({
      id: user.id,
      full_name: user.full_name || "",
      email: user.email || "",
      company_name: user.company_name || "",
      role: user.role || "subscriber",
      approval_status: user.approval_status || "pending",
      requested_packs: user.requested_packs || "DB1",
      created_at: user.created_at,
      last_sign_in: user.last_sign_in,
      notes: user.notes
    }));

    return {
      success: true,
      data: users
    };
  } catch (error) {
    console.error("Error fetching users:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error fetching users"
    };
  }
}

/**
 * Fetch a single user by ID
 */
export async function fetchUserByIdAction(id: string): Promise<UserActionResponse<AdminUser | null>> {
  try {
    const supabase = createClient();
    if (!supabase) {
      return {
        success: false,
        error: "Supabase not configured"
      };
    }

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      return {
        success: false,
        error: error.message
      };
    }

    const user = data ? {
      id: data.id,
      full_name: data.full_name || "",
      email: data.email || "",
      company_name: data.company_name || "",
      role: data.role || "subscriber",
      approval_status: data.approval_status || "pending",
      requested_packs: data.requested_packs || "DB1",
      created_at: data.created_at,
      last_sign_in: data.last_sign_in,
      notes: data.notes
    } : null;

    return {
      success: true,
      data: user
    };
  } catch (error) {
    console.error("Error fetching user:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
}

/**
 * Update user approval status to approved
 */
export async function approveUserAction(userId: string, notes?: string): Promise<UserActionResponse<AdminUser>> {
  try {
    const supabase = createClient();
    if (!supabase) {
      return {
        success: false,
        error: "Supabase not configured"
      };
    }

    const updateData: Record<string, any> = {
      approval_status: "approved",
      updated_at: new Date().toISOString()
    };

    if (notes) {
      updateData.notes = notes;
    }

    const { data, error } = await supabase
      .from("profiles")
      .update(updateData)
      .eq("id", userId)
      .select()
      .single();

    if (error) {
      return {
        success: false,
        error: error.message
      };
    }

    revalidatePath("/admin/users");
    return {
      success: true,
      data: {
        id: data.id,
        full_name: data.full_name || "",
        email: data.email || "",
        company_name: data.company_name || "",
        role: data.role || "subscriber",
        approval_status: data.approval_status,
        requested_packs: data.requested_packs || "DB1",
        created_at: data.created_at,
        last_sign_in: data.last_sign_in,
        notes: data.notes
      }
    };
  } catch (error) {
    console.error("Error approving user:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error approving user"
    };
  }
}

/**
 * Update user approval status to rejected
 */
export async function rejectUserAction(userId: string, reason: string): Promise<UserActionResponse<AdminUser>> {
  try {
    const supabase = createClient();
    if (!supabase) {
      return {
        success: false,
        error: "Supabase not configured"
      };
    }

    const updateData = {
      approval_status: "rejected",
      notes: reason || "Declined during commercial verification",
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from("profiles")
      .update(updateData)
      .eq("id", userId)
      .select()
      .single();

    if (error) {
      return {
        success: false,
        error: error.message
      };
    }

    revalidatePath("/admin/users");
    return {
      success: true,
      data: {
        id: data.id,
        full_name: data.full_name || "",
        email: data.email || "",
        company_name: data.company_name || "",
        role: data.role || "subscriber",
        approval_status: data.approval_status,
        requested_packs: data.requested_packs || "DB1",
        created_at: data.created_at,
        last_sign_in: data.last_sign_in,
        notes: data.notes
      }
    };
  } catch (error) {
    console.error("Error rejecting user:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error rejecting user"
    };
  }
}
