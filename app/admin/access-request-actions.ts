"use server";

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
 * Generate a temporary password for new user
 */
function generateTemporaryPassword(): string {
  return Math.random().toString(36).slice(-12) + Math.random().toString(36).slice(-6);
}

/**
 * Complete access request approval workflow (admin only):
 * 1. Create user in profiles table
 * 2. Create subscription record
 * 3. Update access request status
 * 4. Send welcome email with credentials
 * 5. Mark request as approved
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

    const supabase = createClient();
    if (!supabase) {
      return {
        success: false,
        error: "Database connection failed"
      };
    }

    // 1. Get the access request
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

    // 2. Generate temporary password
    const tempPassword = generateTemporaryPassword();
    console.log("password: ", tempPassword);

    // 3. Create user profile in auth + profiles table using service role
    const adminClient = createAdminServiceClient();
    if (!adminClient) {
      return {
        success: false,
        error: "Admin client not configured"
      };
    }

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
      // Check if user already exists
      if (authError.message.includes("already registered")) {
        console.warn(`User ${accessRequest.email} already exists`);
      } else {
        return {
          success: false,
          error: `Failed to create user: ${authError.message}`
        };
      }
    }

    const userId = authData?.user?.id || requestId;

    // 4. Create profile record
    const { error: profileError } = await supabase
      .from("profiles")
      .upsert({
        id: userId,
        full_name: accessRequest.full_name,
        company_name: accessRequest.company_name,
        role: "subscriber",
        approval_status: "approved",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

    if (profileError) {
      console.error("Profile creation error:", profileError);
    }

    // 5. Create subscription record for each assigned database
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + subscriptionDuration);

    const subscriptions = [];
    if (assignedDatabase === "DB1" || assignedDatabase === "both") {
      subscriptions.push({
        user_id: userId,
        dataset_type: "DB1",
        status: "active",
        starts_at: startDate.toISOString(),
        expires_at: endDate.toISOString(),
        created_at: new Date().toISOString()
      });
    }
    if (assignedDatabase === "DB2" || assignedDatabase === "both") {
      subscriptions.push({
        user_id: userId,
        dataset_type: "DB2",
        status: "active",
        starts_at: startDate.toISOString(),
        expires_at: endDate.toISOString(),
        created_at: new Date().toISOString()
      });
    }

    const { error: subscriptionError } = await supabase
      .from("subscriptions")
      .insert(subscriptions);

    if (subscriptionError) {
      console.error("Subscription creation error:", subscriptionError);
    }

    // 6. Update access request status
    const { error: updateError } = await supabase
      .from("access_requests")
      .update({
        status: "approved",
        assigned_database: assignedDatabase,
        approved_at: new Date().toISOString()
      })
      .eq("id", requestId);

    if (updateError) {
      console.error("Update error:", updateError);
    }

    // 7. Send welcome email with credentials
    try {
      const loginLink = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/login`;
      
      await fetch(`${process.env.NEXT_PUBLIC_APP_URL || ""}/api/send-access-request-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "approval",
          email: accessRequest.email,
          fullName: accessRequest.full_name,
          password: tempPassword,
          databases: assignedDatabase,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          loginLink: loginLink
        })
      });
    } catch (emailError) {
      console.error("Error sending welcome email:", emailError);
      // Don't fail the whole process if email fails
    }

    revalidatePath("/admin/users");

    return {
      success: true,
      message: "Access request approved, user created, and credentials sent",
      data: {
        requestId: requestId,
        userId: userId,
        email: accessRequest.email,
        status: "approved",
        assignedDatabase: assignedDatabase,
        subscriptionEndDate: endDate.toISOString()
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
