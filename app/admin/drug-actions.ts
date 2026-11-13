"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export interface AdminDrug {
  id: string;
  dataset_type: "DB1" | "DB2";
  drug_name: string;
  company: string;
  partner?: string;
  route: string;
  iv_shift_nce?: "IV to SC Shift" | "NCE Subcutaneous" | "Primary Injectable" | "N/A";
  type?: string;
  device_formulation?: string;
  dose?: string;
  iv_dose_mg?: string;
  sc_dose_mg?: string;
  est_sc_volume_ml?: string;
  frequency?: string;
  phase: string;
  pharmacology?: string;
  indication: string;
  field?: string;
  entry_date: string;
  created_at: string;
  updated_at: string;
  references?: Array<{
    id: string;
    source: string;
    title: string;
    year?: string;
    url?: string;
  }>;
}

export interface DrugActionResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Fetch all drugs from Supabase, or return demo data if not configured
 */
export async function fetchDrugsAction(): Promise<DrugActionResponse<AdminDrug[]>> {
  try {
    const supabase = createClient();
    if (!supabase) {
      return {
        success: false,
        error: "Supabase not configured"
      };
    }

    const { data, error } = await supabase
      .from("drugs")
      .select("*, drug_references(*)")
      .order("created_at", { ascending: false });

    if (error) {
      const fallback = await supabase
        .from("drugs")
        .select("*")
        .order("created_at", { ascending: false });

      if (fallback.error) {
        return {
          success: false,
          error: fallback.error.message
        };
      }

      const drugIds = (fallback.data || []).map((d: any) => d.id);
      let refMap: Record<string, any[]> = {};
      if (drugIds.length > 0) {
        const { data: refData } = await supabase
          .from("drug_references")
          .select("*")
          .in("drug_id", drugIds)
          .order("reference_order", { ascending: true });
        if (refData) {
          refData.forEach((ref: any) => {
            if (!refMap[ref.drug_id]) refMap[ref.drug_id] = [];
            refMap[ref.drug_id].push(ref);
          });
        }
      }

      const drugs = (fallback.data || []).map((drug: any) => ({
        ...drug,
        route: drug.route,
        references: (refMap[drug.id] || []).map((ref: any) => ({
          id: ref.id,
          source: ref.source || "reference",
          title: ref.reference_value || ref.title || "",
          year: ref.year || "",
          url: ref.url || ""
        }))
      }));

      return {
        success: true,
        data: drugs
      };
    }

    // Map database records to AdminDrug format (route -> route)
    const drugs = (data || []).map((drug: any) => ({
      ...drug,
      route: drug.route,
      references: (drug.drug_references || []).map((ref: any) => ({
        id: ref.id,
        source: ref.source || "reference",
        title: ref.reference_value || ref.title || "",
        year: ref.year || "",
        url: ref.url || ""
      }))
    }));

    return {
      success: true,
      data: drugs
    };
  } catch (error) {
    console.error("Error fetching drugs:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error fetching drugs"
    };
  }
}

/**
 * Fetch a single drug by ID
 */
export async function fetchDrugByIdAction(id: string): Promise<DrugActionResponse<AdminDrug | null>> {
  try {
    const supabase = createClient();
    if (!supabase) {
      return {
        success: false,
        error: "Supabase not configured"
      };
    }

    const { data, error } = await supabase
      .from("drugs")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      return {
        success: false,
        error: error.message
      };
    }

    const drug = data ? {
      ...data,
      route: data.route,
      references: []
    } : null;

    return {
      success: true,
      data: drug
    };
  } catch (error) {
    console.error("Error fetching drug:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
}

/**
 * Create a new drug record
 */
export async function createDrugAction(
  drug: Omit<AdminDrug, "id" | "created_at" | "updated_at" | "references">
): Promise<DrugActionResponse<AdminDrug>> {
  try {
    const supabase = createClient();
    if (!supabase) {
      return {
        success: false,
        error: "Supabase not configured"
      };
    }

    const now = new Date().toISOString();
    const newDrug = {
      dataset_type: drug.dataset_type,
      drug_name: drug.drug_name,
      company: drug.company,
      partner: drug.partner || null,
      route: drug.route,
      iv_shift_nce: drug.iv_shift_nce || null,
      type: drug.type || null,
      device_formulation: drug.device_formulation || null,
      dose: drug.dose || null,
      iv_dose_mg: drug.iv_dose_mg || null,
      sc_dose_mg: drug.sc_dose_mg || null,
      est_sc_volume_ml: drug.est_sc_volume_ml || null,
      frequency: drug.frequency || null,
      phase: drug.phase,
      pharmacology: drug.pharmacology || null,
      indication: drug.indication,
      field: drug.field || null,
      entry_date: drug.entry_date,
      created_at: now,
      updated_at: now
    };

    const { data, error } = await supabase
      .from("drugs")
      .insert([newDrug])
      .select()
      .single();

    if (error) {
      return {
        success: false,
        error: error.message
      };
    }

    revalidatePath("/admin/drugs");
    return {
      success: true,
      data: {
        ...data,
        references: []
      }
    };
  } catch (error) {
    console.error("Error creating drug:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error creating drug"
    };
  }
}

/**
 * Update an existing drug record
 */
export async function updateDrugAction(
  id: string,
  updates: Partial<AdminDrug>
): Promise<DrugActionResponse<AdminDrug>> {
  try {
    const supabase = createClient();
    if (!supabase) {
      return {
        success: false,
        error: "Supabase not configured"
      };
    }

    const now = new Date().toISOString();
    
    // Clean up undefined values and set nulls for optional fields
    const updateData: Record<string, any> = {
      updated_at: now
    };

    // Only include fields that are in the update (exclude references)
    const allowedFields = [
      "dataset_type", "drug_name", "company", "partner", "route",
      "iv_shift_nce", "type", "device_formulation", "dose",
      "iv_dose_mg", "sc_dose_mg", "est_sc_volume_ml", "frequency",
      "phase", "pharmacology", "indication", "field", "entry_date"
    ];

    for (const field of allowedFields) {
      if (field in updates) {
        // Map 'route' to 'route' if present
        if (field === "route" && "route" in updates) {
          updateData[field] = updates["route" as keyof AdminDrug] ?? null;
        } else if (field !== "route") {
          updateData[field] = updates[field as keyof AdminDrug] ?? null;
        }
      }
    }

    const { data, error } = await supabase
      .from("drugs")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return {
        success: false,
        error: error.message
      };
    }

    revalidatePath("/admin/drugs");
    return {
      success: true,
      data: {
        ...data,
        references: []
      }
    };
  } catch (error) {
    console.error("Error updating drug:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error updating drug"
    };
  }
}

/**
 * Delete a drug record
 */
export async function deleteDrugAction(id: string): Promise<DrugActionResponse<{ id: string }>> {
  try {
    const supabase = createClient();
    if (!supabase) {
      return {
        success: false,
        error: "Supabase not configured"
      };
    }

    const { error } = await supabase
      .from("drugs")
      .delete()
      .eq("id", id);

    if (error) {
      return {
        success: false,
        error: error.message
      };
    }

    revalidatePath("/admin/drugs");
    return {
      success: true,
      data: { id }
    };
  } catch (error) {
    console.error("Error deleting drug:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error deleting drug"
    };
  }
}

/**
 * Fetch drugs filtered by dataset type
 */
export async function fetchDrugsByDatasetAction(
  datasetType: "DB1" | "DB2"
): Promise<DrugActionResponse<AdminDrug[]>> {
  try {
    const supabase = createClient();
    if (!supabase) {
      return {
        success: false,
        error: "Supabase not configured"
      };
    }

    const { data, error } = await supabase
      .from("drugs")
      .select("*")
      .eq("dataset_type", datasetType)
      .order("created_at", { ascending: false });

    if (error) {
      return {
        success: false,
        error: error.message
      };
    }

    // Map database records to AdminDrug format (route -> route)
    const drugs = (data || []).map((drug: any) => ({
      ...drug,
      route: drug.route,
      references: []
    }));

    return {
      success: true,
      data: drugs
    };
  } catch (error) {
    console.error("Error fetching drugs by dataset:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
}

/**
 * Fetch references for a specific drug
 */
export async function fetchDrugReferencesAction(drugId: string): Promise<DrugActionResponse<any[]>> {
  try {
    const supabase = createClient();
    if (!supabase) {
      return {
        success: false,
        error: "Supabase not configured"
      };
    }

    const { data, error } = await supabase
      .from("drug_references")
      .select("*")
      .eq("drug_id", drugId)
      .order("reference_order", { ascending: true });

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
    console.error("Error fetching drug references:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error fetching references"
    };
  }
}

/**
 * Create a reference for a drug
 */
export async function createReferenceAction(
  drugId: string,
  reference: { reference_value: string; reference_order: number }
): Promise<DrugActionResponse<any>> {
  try {
    const supabase = createClient();
    if (!supabase) {
      return {
        success: false,
        error: "Supabase not configured"
      };
    }

    const { data, error } = await supabase
      .from("drug_references")
      .insert([
        {
          drug_id: drugId,
          reference_value: reference.reference_value,
          reference_order: reference.reference_order,
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

    revalidatePath("/admin/drugs");
    return {
      success: true,
      data
    };
  } catch (error) {
    console.error("Error creating reference:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error creating reference"
    };
  }
}

/**
 * Update a reference
 */
export async function updateReferenceAction(
  referenceId: string,
  reference: { reference_value: string; reference_order: number }
): Promise<DrugActionResponse<any>> {
  try {
    const supabase = createClient();
    if (!supabase) {
      return {
        success: false,
        error: "Supabase not configured"
      };
    }

    const { data, error } = await supabase
      .from("drug_references")
      .update({
        reference_value: reference.reference_value,
        reference_order: reference.reference_order
      })
      .eq("id", referenceId)
      .select()
      .single();

    if (error) {
      return {
        success: false,
        error: error.message
      };
    }

    revalidatePath("/admin/drugs");
    return {
      success: true,
      data
    };
  } catch (error) {
    console.error("Error updating reference:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error updating reference"
    };
  }
}

/**
 * Delete a reference
 */
export async function deleteReferenceAction(referenceId: string): Promise<DrugActionResponse<{ id: string }>> {
  try {
    const supabase = createClient();
    if (!supabase) {
      return {
        success: false,
        error: "Supabase not configured"
      };
    }

    const { error } = await supabase
      .from("drug_references")
      .delete()
      .eq("id", referenceId);

    if (error) {
      return {
        success: false,
        error: error.message
      };
    }

    revalidatePath("/admin/drugs");
    return {
      success: true,
      data: { id: referenceId }
    };
  } catch (error) {
    console.error("Error deleting reference:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error deleting reference"
    };
  }
}

/**
 * Fetch drugs for authenticated subscriber portal users.
 * 
 * This action performs server-side authentication and authorization:
 * 1. Verifies the user is authenticated
 * 2. Checks the user has a subscriber profile with approved status
 * 3. Queries the user's active subscriptions to determine dataset access (DB1 and/or DB2)
 * 4. Returns only drugs from datasets the user is subscribed to
 * 
 * Used exclusively by portal pages (/portal, /portal/db1, /portal/db2)
 * Admin panel uses the regular fetchDrugsAction() instead.
 */
export async function fetchPortalDrugsAction(): Promise<DrugActionResponse<AdminDrug[]>> {
  try {
    const supabase = createClient();
    if (!supabase) {
      return {
        success: false,
        error: "Supabase not configured"
      };
    }

    // 1. Get authenticated user from Supabase Auth
    const {
      data: { user },
      error: userError
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return {
        success: false,
        error: "Unauthenticated: Please log in to access the drug database."
      };
    }

    // 2. Verify user has an approved subscriber profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, role, approval_status")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      return {
        success: false,
        error: "Profile not found. Please contact support."
      };
    }

    // 3. Ensure user is a subscriber with approved status
    if (profile.role !== "subscriber") {
      return {
        success: false,
        error: "Unauthorized: Only approved subscribers can access the drug database."
      };
    }

    if (profile.approval_status !== "approved") {
      return {
        success: false,
        error: `Access denied: Your account status is '${profile.approval_status}'. Only approved accounts can view drug records.`
      };
    }

    // 4. Fetch user's active subscriptions to determine dataset access
    const { data: subscriptions, error: subscriptionError } = await supabase
      .from("subscriptions")
      .select("dataset_type, status, expires_at")
      .eq("user_id", user.id);

    if (subscriptionError || !subscriptions) {
      return {
        success: false,
        error: "Unable to retrieve your subscription information."
      };
    }

    // 5. Filter subscriptions to only active ones that haven't expired
    const now = new Date().toISOString();
    const activeSubscriptions = subscriptions.filter(sub => {
      const isActive = sub.status === "active";
      const notExpired = !sub.expires_at || sub.expires_at > now;
      return isActive && notExpired;
    });

    if (activeSubscriptions.length === 0) {
      return {
        success: false,
        error: "No active subscriptions found. Please contact support or renew your subscription."
      };
    }

    // 6. Extract the list of datasets the user has access to (deduplicated)
    const datasetSet = new Set<string>();
    activeSubscriptions.forEach(sub => {
      datasetSet.add(sub.dataset_type);
    });
    const allowedDatasets = Array.from(datasetSet);

    // 7. Fetch drugs belonging only to the user's authorized datasets with references
    const { data, error } = await supabase
      .from("drugs")
      .select("*, drug_references(*)")
      .in("dataset_type", allowedDatasets)
      .order("created_at", { ascending: false });

    if (error) {
      // Fallback if join or relationship has an issue: fetch drugs without join
      const fallback = await supabase
        .from("drugs")
        .select("*")
        .in("dataset_type", allowedDatasets)
        .order("created_at", { ascending: false });

      if (fallback.error) {
        return {
          success: false,
          error: fallback.error.message
        };
      }

      // Try fetching references separately for fallback
      const drugIds = (fallback.data || []).map((d: any) => d.id);
      let refMap: Record<string, any[]> = {};
      if (drugIds.length > 0) {
        const { data: refData } = await supabase
          .from("drug_references")
          .select("*")
          .in("drug_id", drugIds)
          .order("reference_order", { ascending: true });
        if (refData) {
          refData.forEach((ref: any) => {
            if (!refMap[ref.drug_id]) refMap[ref.drug_id] = [];
            refMap[ref.drug_id].push(ref);
          });
        }
      }

      const drugs = (fallback.data || []).map((drug: any) => ({
        ...drug,
        route: drug.route,
        references: (refMap[drug.id] || []).map((ref: any) => ({
          id: ref.id,
          source: ref.source || "reference",
          title: ref.reference_value || ref.title || "",
          year: ref.year || "",
          url: ref.url || ""
        }))
      }));

      return {
        success: true,
        data: drugs
      };
    }

    // 8. Map database records to AdminDrug format
    const drugs = (data || []).map((drug: any) => ({
      ...drug,
      route: drug.route,
      references: (drug.drug_references || []).map((ref: any) => ({
        id: ref.id,
        source: ref.source || "reference",
        title: ref.reference_value || ref.title || "",
        year: ref.year || "",
        url: ref.url || ""
      }))
    }));

    return {
      success: true,
      data: drugs
    };
  } catch (error) {
    console.error("Error fetching portal drugs:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error fetching drugs"
    };
  }
}
