"use server";

import { randomBytes } from "crypto";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminServiceClient } from "@/lib/supabase/service-role";
import { verifyAdminSession } from "@/lib/supabase/admin-auth";

export interface PasswordActionResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * Generate a cryptographically secure temporary password
 * Uses randomBytes instead of Math.random() for cryptographic strength
 */
function generateTemporaryPassword(): string {
  // Generate 32 random bytes for a 43-character base64 string (or ~32 chars after filtering)
  const randomBuffer = randomBytes(32);
  const base64 = randomBuffer.toString("base64");
  
  // Replace non-alphanumeric characters to ensure compatibility
  // This maintains ~256-bit entropy
  const filtered = base64
    .replace(/\+/g, "0")
    .replace(/\//g, "1")
    .replace(/=/g, "");
  
  return filtered;
}

/**
 * Generate a temporary password for a user (admin action)
 * Returns the temporary password which the admin can copy and share
 */
export async function generateResetPasswordAction(
  userId: string
): Promise<PasswordActionResponse<{ tempPassword: string }>> {
  try {
    // Verify admin session
    const adminSession = await verifyAdminSession();
    if (!adminSession.isAdmin) {
      return {
        success: false,
        error: adminSession.error || "Unauthorized: Admin access required"
      };
    }

    const tempPassword = generateTemporaryPassword();

    // Use service role to reset password
    const adminClient = createAdminServiceClient();
    if (!adminClient) {
      return {
        success: false,
        error: "Admin client not configured"
      };
    }

    // Update user password using service role
    const { error: updateError } = await adminClient.auth.admin.updateUserById(userId, {
      password: tempPassword
    });

    if (updateError) {
      return {
        success: false,
        error: `Failed to reset password: ${updateError.message}`
      };
    }

    // Mark password as not changed (user needs to set it on next login)
    const supabase = createClient();
    if (supabase) {
      await supabase
        .from("profiles")
        .update({ password_changed: false })
        .eq("id", userId);
    }

    revalidatePath("/admin/users");

    return {
      success: true,
      message: "Password reset. Copy the temporary password below and share it with the user.",
      data: {
        tempPassword
      }
    };
  } catch (error) {
    console.error("Error generating reset password:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
}

/**
 * Called by client: Update user's password when they set it for the first time
 * Uses the current authenticated session
 */
export async function setUserPasswordAction(
  newPassword: string
): Promise<PasswordActionResponse> {
  try {
    if (!newPassword || newPassword.length < 6) {
      return {
        success: false,
        error: "Password must be at least 6 characters"
      };
    }

    const supabase = createClient();
    if (!supabase) {
      return {
        success: false,
        error: "Database connection failed"
      };
    }

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return {
        success: false,
        error: "You must be logged in to set a password"
      };
    }

    // Update password in Supabase Auth
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (updateError) {
      return {
        success: false,
        error: `Failed to update password: ${updateError.message}`
      };
    }

    // Mark password as changed in profiles table
    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        password_changed: true,
        updated_at: new Date().toISOString()
      })
      .eq("id", user.id);

    if (profileError) {
      console.error("Error updating profile flag:", profileError);
      // Don't fail the entire operation, password was already changed
    }

    revalidatePath("/portal");

    return {
      success: true,
      message: "Password updated successfully. You can now access the portal."
    };
  } catch (error) {
    console.error("Error setting password:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
}
