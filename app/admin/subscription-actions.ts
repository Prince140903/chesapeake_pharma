"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { AdminSubscription } from "@/lib/admin-mock-data";

export interface SubscriptionActionResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Fetch all subscriptions from Supabase
 */
export async function fetchSubscriptionsAction(): Promise<SubscriptionActionResponse<AdminSubscription[]>> {
  try {
    const supabase = createClient();
    if (!supabase) {
      return {
        success: false,
        error: "Supabase not configured"
      };
    }

    // Fetch subscriptions with user profile data
    const { data, error } = await supabase
      .from("subscriptions")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      return {
        success: false,
        error: error.message
      };
    }

    // Fetch user data for all subscriptions
    const uniqueUserIds: string[] = [];
    const seenIds = new Set<string>();
    (data || []).forEach((sub: any) => {
      if (!seenIds.has(sub.user_id)) {
        uniqueUserIds.push(sub.user_id);
        seenIds.add(sub.user_id);
      }
    });

    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("id, full_name, email, company_name")
      .in("id", uniqueUserIds);

    // Create a map of profiles for quick lookup
    const profileMap = new Map();
    (profiles || []).forEach((profile: any) => {
      profileMap.set(profile.id, profile);
    });

    // Map database records to AdminSubscription format
    const subscriptions = (data || []).map((sub: any) => {
      const profile = profileMap.get(sub.user_id);
      return {
        id: sub.id,
        user_id: sub.user_id,
        user_name: profile?.full_name || "",
        user_email: profile?.email || "",
        company_name: profile?.company_name || "",
        dataset_type: sub.dataset_type || "DB1",
        status: sub.status || "active",
        starts_at: sub.starts_at,
        expires_at: sub.expires_at,
        renewal_date: sub.renewal_date,
        activated_by: sub.activated_by || "System",
        payment_reference: sub.payment_reference || "",
        admin_notes: sub.admin_notes || "",
        created_at: sub.created_at
      };
    });

    return {
      success: true,
      data: subscriptions
    };
  } catch (error) {
    console.error("Error fetching subscriptions:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error fetching subscriptions"
    };
  }
}

/**
 * Create a new subscription
 */
export async function createSubscriptionAction(
  subscription: Omit<AdminSubscription, "id" | "created_at">
): Promise<SubscriptionActionResponse<AdminSubscription>> {
  try {
    const supabase = createClient();
    if (!supabase) {
      return {
        success: false,
        error: "Supabase not configured"
      };
    }

    const newSubscription = {
      user_id: subscription.user_id,
      dataset_type: subscription.dataset_type,
      status: subscription.status,
      starts_at: subscription.starts_at,
      expires_at: subscription.expires_at,
      renewal_date: subscription.renewal_date,
      activated_by: subscription.activated_by,
      payment_reference: subscription.payment_reference,
      admin_notes: subscription.admin_notes,
      created_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from("subscriptions")
      .insert([newSubscription])
      .select()
      .single();

    if (error) {
      return {
        success: false,
        error: error.message
      };
    }

    // Fetch the user profile to complete the subscription object
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, email, company_name")
      .eq("id", data.user_id)
      .single();

    revalidatePath("/admin/subscriptions");
    return {
      success: true,
      data: {
        id: data.id,
        user_id: data.user_id,
        user_name: profile?.full_name || "",
        user_email: profile?.email || "",
        company_name: profile?.company_name || "",
        dataset_type: data.dataset_type,
        status: data.status,
        starts_at: data.starts_at,
        expires_at: data.expires_at,
        renewal_date: data.renewal_date,
        activated_by: data.activated_by,
        payment_reference: data.payment_reference,
        admin_notes: data.admin_notes,
        created_at: data.created_at
      }
    };
  } catch (error) {
    console.error("Error creating subscription:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error creating subscription"
    };
  }
}

/**
 * Update subscription status
 */
export async function updateSubscriptionStatusAction(
  subscriptionId: string,
  newStatus: "active" | "expired" | "pending" | "deactivated"
): Promise<SubscriptionActionResponse<AdminSubscription>> {
  try {
    const supabase = createClient();
    if (!supabase) {
      return {
        success: false,
        error: "Supabase not configured"
      };
    }

    const { data, error } = await supabase
      .from("subscriptions")
      .update({ status: newStatus })
      .eq("id", subscriptionId)
      .select()
      .single();

    if (error) {
      return {
        success: false,
        error: error.message
      };
    }

    // Fetch the user profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, email, company_name")
      .eq("id", data.user_id)
      .single();

    revalidatePath("/admin/subscriptions");
    return {
      success: true,
      data: {
        id: data.id,
        user_id: data.user_id,
        user_name: profile?.full_name || "",
        user_email: profile?.email || "",
        company_name: profile?.company_name || "",
        dataset_type: data.dataset_type,
        status: data.status,
        starts_at: data.starts_at,
        expires_at: data.expires_at,
        renewal_date: data.renewal_date,
        activated_by: data.activated_by,
        payment_reference: data.payment_reference,
        admin_notes: data.admin_notes,
        created_at: data.created_at
      }
    };
  } catch (error) {
    console.error("Error updating subscription:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error updating subscription"
    };
  }
}

/**
 * Delete a subscription
 */
export async function deleteSubscriptionAction(subscriptionId: string): Promise<SubscriptionActionResponse<{ id: string }>> {
  try {
    const supabase = createClient();
    if (!supabase) {
      return {
        success: false,
        error: "Supabase not configured"
      };
    }

    const { error } = await supabase
      .from("subscriptions")
      .delete()
      .eq("id", subscriptionId);

    if (error) {
      return {
        success: false,
        error: error.message
      };
    }

    revalidatePath("/admin/subscriptions");
    return {
      success: true,
      data: { id: subscriptionId }
    };
  } catch (error) {
    console.error("Error deleting subscription:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error deleting subscription"
    };
  }
}
