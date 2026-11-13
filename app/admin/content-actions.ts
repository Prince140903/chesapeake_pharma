"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminServiceClient } from "@/lib/supabase/service-role";
import {
  HomePageContent,
  AboutPageContent,
  ContactPageContent,
  PublicationsPageContent,
  PublicationItem,
  defaultHomePageContent,
  defaultAboutPageContent,
  defaultContactPageContent,
  defaultPublicationsPageContent
} from "@/lib/content-schema";

export interface ContentActionResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Fetch a content section by key ('home' | 'about' | 'contact' | 'publications')
 */
export async function getSiteContentAction<T = any>(
  key: "home" | "about" | "contact" | "publications"
): Promise<ContentActionResponse<T>> {
  try {
    const supabase = createClient();
    if (!supabase) {
      return {
        success: true,
        data: getDefaultContentByKey(key) as unknown as T
      };
    }

    const { data, error } = await supabase
      .from("site_content")
      .select("data")
      .eq("key", key)
      .single();

    if (error || !data?.data) {
      return {
        success: true,
        data: getDefaultContentByKey(key) as unknown as T
      };
    }

    // Merge deep with default to ensure any missing fields are safely populated
    const merged = { ...getDefaultContentByKey(key), ...data.data };
    return {
      success: true,
      data: merged as T
    };
  } catch (err: any) {
    console.warn(`Error fetching site_content for ${key}:`, err?.message);
    return {
      success: true,
      data: getDefaultContentByKey(key) as unknown as T
    };
  }
}

/**
 * Save/update a content section in the site_content table
 */
export async function updateSiteContentAction(
  key: "home" | "about" | "contact" | "publications",
  contentData: any
): Promise<ContentActionResponse> {
  try {
    // Prefer admin service client to bypass RLS, fallback to server client
    const supabase = createAdminServiceClient() || createClient();
    if (!supabase) {
      return {
        success: false,
        error: "Supabase client not available."
      };
    }

    const { error } = await supabase
      .from("site_content")
      .upsert(
        {
          key,
          data: contentData,
          updated_at: new Date().toISOString()
        },
        { onConflict: "key" }
      );

    if (error) {
      return {
        success: false,
        error: error.message
      };
    }

    // Revalidate marketing routes
    revalidatePath("/");
    revalidatePath("/about");
    revalidatePath("/contact");
    revalidatePath("/publications");
    revalidatePath("/admin/content");

    return {
      success: true,
      data: contentData
    };
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || "Failed to save site content"
    };
  }
}

/**
 * Helper to get default content safely
 */
function getDefaultContentByKey(key: "home" | "about" | "contact" | "publications") {
  switch (key) {
    case "home":
      return defaultHomePageContent;
    case "about":
      return defaultAboutPageContent;
    case "contact":
      return defaultContactPageContent;
    case "publications":
      return defaultPublicationsPageContent;
  }
}

/**
 * CRUD Helper for Publications specifically
 */
export async function addPublicationAction(item: Omit<PublicationItem, "id">): Promise<ContentActionResponse> {
  try {
    const existing = await getSiteContentAction<PublicationsPageContent>("publications");
    const current = existing.data || defaultPublicationsPageContent;
    const newItem: PublicationItem = {
      ...item,
      id: "pub-" + Date.now()
    };
    const updated = {
      ...current,
      items: [newItem, ...current.items]
    };
    return await updateSiteContentAction("publications", updated);
  } catch (e: any) {
    return { success: false, error: e?.message };
  }
}

export async function updatePublicationAction(item: PublicationItem): Promise<ContentActionResponse> {
  try {
    const existing = await getSiteContentAction<PublicationsPageContent>("publications");
    const current = existing.data || defaultPublicationsPageContent;
    const updated = {
      ...current,
      items: current.items.map((p) => (p.id === item.id ? item : p))
    };
    return await updateSiteContentAction("publications", updated);
  } catch (e: any) {
    return { success: false, error: e?.message };
  }
}

export async function deletePublicationAction(id: string): Promise<ContentActionResponse> {
  try {
    const existing = await getSiteContentAction<PublicationsPageContent>("publications");
    const current = existing.data || defaultPublicationsPageContent;
    const updated = {
      ...current,
      items: current.items.filter((p) => p.id !== id)
    };
    return await updateSiteContentAction("publications", updated);
  } catch (e: any) {
    return { success: false, error: e?.message };
  }
}

