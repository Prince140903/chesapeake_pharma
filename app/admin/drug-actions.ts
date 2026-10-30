"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { AdminDrug } from "@/lib/admin-mock-data";

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
      .select("*")
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
