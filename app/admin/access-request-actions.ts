"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
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

/**
 * Submit an access request as a public visitor
 * Stores the request in public.access_requests with pending status
 * Sends email notification to admin
 */
export async function submitAccessRequestAction(
  requestData: AccessRequestData
): Promise<AccessRequestResponse> {
  try {
    const supabase = createClient();
    if (!supabase) {
      return {
        success: false,
        error: "Database connection failed"
      };
    }

    // Insert the access request into the database (RLS allows public insert)
    const { data, error } = await supabase
      .from("access_requests")
      .insert([
        {
          full_name: requestData.full_name,
          email: requestData.email,
          company_name: requestData.company_name,
          status: "pending",
          created_at: new Date().toISOString()
        }
      ])
      .select()
      .single();

    if (error) {
      return {
        success: false,
        error: error.message
      };
    }

    // Send email notification to admin
    try {
      const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL || "admin@chesapeakepharma.com";
      
      const emailResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || ""}/api/send-access-request-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          adminEmail,
          requestData,
          requestId: data.id
        })
      });

      if (!emailResponse.ok) {
        console.error("Email sending failed, but request was created");
      }
    } catch (emailError) {
      console.error("Error sending email:", emailError);
      // Don't fail the request if email fails - the record is already created
    }

    return {
      success: true,
      message: "Your access request has been submitted. We will review it and contact you shortly.",
      data: {
        id: data.id,
        status: "pending",
        created_at: data.created_at
      }
    };
  } catch (error) {
    console.error("Error submitting access request:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error submitting request"
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
 * Leaves the request in rejected status with reason
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

    revalidatePath("/admin/access-requests");

    return {
      success: true,
      message: "Access request rejected",
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
