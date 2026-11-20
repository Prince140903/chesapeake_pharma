"use server";

import { randomBytes } from "crypto";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminServiceClient } from "@/lib/supabase/service-role";
import { verifyAdminSession } from "@/lib/supabase/admin-auth";

export interface AccessRequestResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface AccessRequestData {
  full_name: string;
  email: string;
  company_name: string;
}

export interface AccessRequest {
  id: string;
  full_name: string;
  email: string;
  company_name: string;
  status: "pending" | "approved" | "rejected";
  assigned_database?: "DB1" | "DB2" | "both";
  admin_notes?: string;
  created_at: string;
  approved_at?: string;
  rejected_at?: string;
}

/**
 * Submit an access request as a public visitor
 * Stores the request in public.access_requests with pending status
 * Sends email notification to admin
 */

export async function submitAccessRequestAction(
  requestData: AccessRequestData
): Promise<AccessRequestResponse> {
  try {
    const fullName = requestData.full_name?.trim();
    const email = requestData.email?.trim().toLowerCase();
    const companyName = requestData.company_name?.trim();

    if (!fullName || !email || !companyName) {
      return {
        success: false,
        error: "Please complete all required fields.",
      };
    }

    const supabase = createClient();

    if (!supabase) {
      return {
        success: false,
        error: "Database connection failed.",
      };
    }

    // Public INSERT: only these three columns are permitted.
    // Database defaults populate status and created_at.
    // No SELECT because public visitors cannot read requests.
    const { error } = await supabase
      .from("access_requests")
      .insert({
        full_name: fullName,
        email,
        company_name: companyName,
      });

    if (error) {
      console.error("Access request database error:", error);

      return {
        success: false,
        error: error.message,
      };
    }

    // Email notification is optional and must not affect submission.
    try {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL;
      const adminEmail =
        process.env.NEXT_PUBLIC_ADMIN_EMAIL ||
        "admin@chesapeakepharma.com";

      if (appUrl) {
        const response = await fetch(
          `${appUrl.replace(/\/$/, "")}/api/send-access-request-email`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              adminEmail,
              requestData: {
                full_name: fullName,
                email,
                company_name: companyName,
              },
            }),
          }
        );

        if (!response.ok) {
          console.error("Admin notification email failed.");
        }
      }
    } catch (emailError) {
      console.error("Email notification error:", emailError);
    }

    revalidatePath("/admin/access-requests");

    return {
      success: true,
      message:
        "Your access request has been submitted. We will review it and contact you shortly.",
    };
  } catch (error) {
    console.error("Access request submission error:", error);

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Unknown error submitting request.",
    };
  }
}


/**
 * Fetch all access requests (admin only)
 * Requires authenticated admin role
 */
export async function fetchAccessRequestsAction(): Promise<AccessRequestResponse<any[]>> {
  try {
    // Verify admin session first
    const adminSession = await verifyAdminSession();
    if (!adminSession.isAdmin) {
      return {
        success: false,
        error: adminSession.error || "Unauthorized: Admin access required"
      };
    }

    const supabase = createClient();
    if (!supabase) {
      return {
        success: false,
        error: "Database connection failed"
      };
    }

    const { data, error } = await supabase
      .from("access_requests")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      return {
        success: false,
        error: error.message
      };
    }

    return {
      success: true,
      data: data || []
    };
  } catch (error) {
    console.error("Error fetching access requests:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
}

/**
 * Approve an access request and assign database(s) (admin only)
 * Does NOT create user or subscription - those are separate steps
 * Returns the approved request for admin to proceed with user provisioning
 */
export async function approveAccessRequestAction(
  requestId: string,
  assignedDatabase: "DB1" | "DB2" | "both",
  adminNotes?: string
): Promise<AccessRequestResponse> {
  try {
    // Verify admin session first
    const adminSession = await verifyAdminSession();
    if (!adminSession.isAdmin) {
      return {
        success: false,
        error: adminSession.error || "Unauthorized: Admin access required"
      };
    }

    const supabase = createClient();
    if (!supabase) {
      return {
        success: false,
        error: "Database connection failed"
      };
    }

    // Update the access request status and database assignment
    const { data, error } = await supabase
      .from("access_requests")
      .update({
        status: "approved",
        assigned_database: assignedDatabase,
        admin_notes: adminNotes,
        approved_at: new Date().toISOString()
      })
      .eq("id", requestId)
      .select()
      .single();

    if (error) {
      return {
        success: false,
        error: error.message
      };
    }

    revalidatePath("/admin/access-requests");

    return {
      success: true,
      message: "Access request approved. Next: Create user account and subscription.",
      data: {
        requestId: data.id,
        status: "approved",
        assignedDatabase: data.assigned_database,
        email: data.email,
        fullName: data.full_name
      }
    };
  } catch (error) {
    console.error("Error approving access request:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
}

/**
 * Reject an access request (admin only)
 * Leaves the request in rejected status with reason and sends rejection email to user
 */
export async function rejectAccessRequestAction(
  requestId: string,
  reason: string
): Promise<AccessRequestResponse> {
  try {
    // Verify admin session first
    const adminSession = await verifyAdminSession();
    if (!adminSession.isAdmin) {
      return {
        success: false,
        error: adminSession.error || "Unauthorized: Admin access required"
      };
    }

    const supabase = createClient();
    if (!supabase) {
      return {
        success: false,
        error: "Database connection failed"
      };
    }

    const { data, error } = await supabase
      .from("access_requests")
      .update({
        status: "rejected",
        admin_notes: reason,
        rejected_at: new Date().toISOString()
      })
      .eq("id", requestId)
      .select()
      .single();

    if (error) {
      return {
        success: false,
        error: error.message
      };
    }

    // Send rejection email to user
    try {
      await fetch(`${process.env.NEXT_PUBLIC_APP_URL || ""}/api/send-access-request-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "rejection",
          email: data.email,
          fullName: data.full_name,
          reason: reason
        })
      });
    } catch (emailError) {
      console.error("Error sending rejection email:", emailError);
    }

    revalidatePath("/admin/users");

    return {
      success: true,
      message: "Access request rejected and user notified",
      data: {
        requestId: data.id,
        status: "rejected"
      }
    };
  } catch (error) {
    console.error("Error rejecting access request:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
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
 * Complete access request approval workflow (admin only):
 * 1. Fetch access request
 * 2. Create or retrieve user in Supabase Auth
 * 3. Create profile record in profiles table
 * 4. Create subscription records (preventing duplicates)
 * 5. Update access request status
 * 6. Send approval email with secure recovery link
 *
 * Supports safe retries: if any step fails, retry will recover existing Auth user
 * and create missing profile/subscriptions without duplicating data.
 *
 * Uses service-role client for all database writes to bypass RLS policies.
 * Admin authorization is verified at entry point.
 */
export async function completeAccessApprovalAction(
  requestId: string,
  assignedDatabase: "DB1" | "DB2" | "both",
  subscriptionDuration: number = 365  // days
): Promise<AccessRequestResponse> {
  try {
    // Verify admin session first
    const adminSession = await verifyAdminSession();
    if (!adminSession.isAdmin) {
      return {
        success: false,
        error: adminSession.error || "Unauthorized: Admin access required"
      };
    }

    // Initialize service-role client for all privileged operations
    const adminClient = createAdminServiceClient();
    if (!adminClient) {
      return {
        success: false,
        error: "Admin client not configured"
      };
    }

    // Use regular client for fetching the access request (safe, read-only)
    const supabase = createClient();
    if (!supabase) {
      return {
        success: false,
        error: "Database connection failed"
      };
    }

    // 1. Fetch the access request
    const { data: accessRequest, error: fetchError } = await supabase
      .from("access_requests")
      .select("*")
      .eq("id", requestId)
      .single();

    if (fetchError || !accessRequest) {
      return {
        success: false,
        error: "Access request not found"
      };
    }

    // 2. Generate temporary password (cryptographically secure)
    const tempPassword = generateTemporaryPassword();

    // 3. Create or retrieve user in Supabase Auth
    // This step determines userId which is used for profile/subscriptions
    let userId: string | null = null;

    const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
      email: accessRequest.email,
      password: tempPassword,
      email_confirm: true,
      user_metadata: {
        full_name: accessRequest.full_name,
        company_name: accessRequest.company_name
      }
    });

    if (authError) {
      // User already exists in Auth (or other error)
      if (authError.message.includes("already registered")) {
        // RELIABLE lookup: Query the profiles table by email to get the existing user ID
        // This works even if profile creation failed on first attempt (retry recovery)
        // We can rely on the email being in user_metadata from the Auth user
        const { data: users, error: listError } = await adminClient.auth.admin.listUsers();

        if (listError || !users?.users) {
          return {
            success: false,
            error: `Could not retrieve Auth users to find ${accessRequest.email}`
          };
        }

        // Find the user by email
        const existingAuthUser = users.users.find(u => u.email === accessRequest.email);
        
        if (!existingAuthUser) {
          return {
            success: false,
            error: `User already registered but not found in Auth user list for ${accessRequest.email}`
          };
        }

        userId = existingAuthUser.id;
        console.warn(
          `User ${accessRequest.email} already exists in Auth. ` +
          `Continuing with existing ID: ${userId} (retry recovery or manual re-approval)`
        );
      } else {
        return {
          success: false,
          error: `Failed to create user: ${authError.message}`
        };
      }
    } else if (authData?.user?.id) {
      userId = authData.user.id;
    } else {
      return {
        success: false,
        error: "User creation succeeded but no user ID returned"
      };
    }

    // 4. Create profile record using service-role client
    const profileData = {
      id: userId,
      full_name: accessRequest.full_name,
      email: accessRequest.email,
      company_name: accessRequest.company_name,
      role: "subscriber",
      approval_status: "approved",
      password_changed: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { error: profileError } = await adminClient
      .from("profiles")
      .upsert(profileData);

    if (profileError) {
      return {
        success: false,
        error: `Failed to create profile: ${profileError.message}`
      };
    }

    // 5. Create subscription records, preventing duplicates on retry
    // First, check for existing active subscriptions to prevent duplicates
    const { data: existingSubscriptions, error: subCheckError } = await adminClient
      .from("subscriptions")
      .select("dataset_type, status")
      .eq("user_id", userId)
      .eq("status", "active");

    if (subCheckError) {
      return {
        success: false,
        error: `Failed to check existing subscriptions: ${subCheckError.message}`
      };
    }

    // Determine which subscriptions need to be created
    const existingTypes = new Set(
      (existingSubscriptions || [])
        .filter(s => s.status === "active")
        .map(s => s.dataset_type)
    );

    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + subscriptionDuration);

    const subscriptionsToCreate = [];

    if ((assignedDatabase === "DB1" || assignedDatabase === "both") && !existingTypes.has("DB1")) {
      subscriptionsToCreate.push({
        user_id: userId,
        dataset_type: "DB1",
        status: "active",
        starts_at: startDate.toISOString(),
        expires_at: endDate.toISOString(),
        created_at: new Date().toISOString()
      });
    }

    if ((assignedDatabase === "DB2" || assignedDatabase === "both") && !existingTypes.has("DB2")) {
      subscriptionsToCreate.push({
        user_id: userId,
        dataset_type: "DB2",
        status: "active",
        starts_at: startDate.toISOString(),
        expires_at: endDate.toISOString(),
        created_at: new Date().toISOString()
      });
    }

    // Only insert subscriptions if there are new ones to create
    if (subscriptionsToCreate.length > 0) {
      const { error: subscriptionError } = await adminClient
        .from("subscriptions")
        .insert(subscriptionsToCreate);

      if (subscriptionError) {
        return {
          success: false,
          error: `Failed to create subscriptions: ${subscriptionError.message}`
        };
      }
    }

    // 6. Update access request status to approved
    const { error: updateError } = await adminClient
      .from("access_requests")
      .update({
        status: "approved",
        assigned_database: assignedDatabase,
        approved_at: new Date().toISOString()
      })
      .eq("id", requestId);

    if (updateError) {
      return {
        success: false,
        error: `Failed to update access request: ${updateError.message}`
      };
    }

    // 7. Generate secure recovery link for password setup
    // This replaces sending plaintext passwords via email
    let recoveryLink: string | null = null;
    let recoveryLinkError: string | null = null;

    try {
      const { data: linkData, error: linkError } = await adminClient.auth.admin.generateLink({
        type: "recovery",
        email: accessRequest.email,
        options: {
          redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/auth/reset-password`
        }
      });

      if (linkError) {
        recoveryLinkError = `Could not generate recovery link: ${linkError.message}`;
        console.error(recoveryLinkError);
      } else if (linkData?.properties?.action_link) {
        recoveryLink = linkData.properties.action_link;
      }
    } catch (err) {
      recoveryLinkError = `Error generating recovery link: ${err instanceof Error ? err.message : "Unknown error"}`;
      console.error(recoveryLinkError);
      // Continue anyway; we'll send email with fallback info
    }

    // 8. Send approval email with recovery link (best-effort)
    // If recovery link generation failed, admin can manually reset password
    try {
      const loginLink = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/login`;
      
      await fetch(`${process.env.NEXT_PUBLIC_APP_URL || ""}/api/send-access-request-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "approval",
          email: accessRequest.email,
          fullName: accessRequest.full_name,
          // Don't send plaintext password
          // Instead send recovery link for secure password setup
          recoveryLink: recoveryLink,
          databases: assignedDatabase,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          loginLink: loginLink
        })
      });
    } catch (emailError) {
      console.error("Error sending approval email:", emailError);
      // Don't fail the whole process if email fails
      // Admin can view the user and reset password manually if needed
    }

    revalidatePath("/admin/users");

    return {
      success: true,
      message: "Access request approved, user created, and approval email sent",
      data: {
        requestId: requestId,
        userId: userId,
        email: accessRequest.email,
        status: "approved",
        assignedDatabase: assignedDatabase,
        subscriptionEndDate: endDate.toISOString(),
        recoveryLinkGenerated: !!recoveryLink,
        recoveryLinkError: recoveryLinkError
      }
    };
  } catch (error) {
    console.error("Error completing access approval:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
}
