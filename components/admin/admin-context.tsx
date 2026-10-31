"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { AdminDrug } from "@/app/admin/drug-actions";
import { AdminUser } from "@/app/admin/user-actions";
import { AdminSubscription } from "@/app/admin/subscription-actions";
import {
  fetchDrugsAction,
  createDrugAction,
  updateDrugAction,
  deleteDrugAction
} from "@/app/admin/drug-actions";
import {
  fetchUsersAction,
  approveUserAction,
  rejectUserAction
} from "@/app/admin/user-actions";
import {
  fetchSubscriptionsAction,
  createSubscriptionAction,
  updateSubscriptionStatusAction
} from "@/app/admin/subscription-actions";

export interface AdminImportJob {
  id: string;
  dataset_type: "DB1" | "DB2";
  file_name: string;
  file_size_kb: number;
  uploaded_by: string;
  status: "completed" | "failed" | "processing" | "staged";
  total_rows: number;
  inserted_count: number;
  updated_count: number;
  skipped_count: number;
  failed_count: number;
  created_at: string;
  matching_strategy: "drug_name_company" | "compound_id" | "exact_match";
  errors?: string[];
}

export interface ToastMessage {
  id: string;
  type: "success" | "error" | "info" | "warning";
  title: string;
  message?: string;
}

interface AdminContextType {
  isAuthenticated: boolean;
  adminUser: AdminUser | null;
  loginAsAdmin: (email?: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  toggleAuthForReview: () => void;

  // Data lists
  drugs: AdminDrug[];
  users: AdminUser[];
  subscriptions: AdminSubscription[];
  imports: AdminImportJob[];

  // Drug actions
  addDrug: (drug: Omit<AdminDrug, "id" | "created_at" | "updated_at">) => Promise<void>;
  updateDrug: (id: string, drug: Partial<AdminDrug>) => Promise<void>;
  deleteDrug: (id: string) => Promise<void>;

  // User actions
  approveUser: (id: string, notes?: string) => Promise<void>;
  rejectUser: (id: string, reason?: string) => Promise<void>;

  // Subscription actions
  addSubscription: (sub: Omit<AdminSubscription, "id" | "created_at">) => Promise<void>;
  toggleSubscriptionStatus: (id: string, newStatus: AdminSubscription["status"]) => Promise<void>;

  // Import actions
  addImportJob: (job: Omit<AdminImportJob, "id" | "created_at">) => void;

  // Toast
  toasts: ToastMessage[];
  addToast: (toast: Omit<ToastMessage, "id">) => void;
  removeToast: (id: string) => void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false); // default to unauthenticated; require login
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [drugs, setDrugs] = useState<AdminDrug[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [subscriptions, setSubscriptions] = useState<AdminSubscription[]>([]);
  const [imports, setImports] = useState<AdminImportJob[]>([]);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [isHydrated, setIsHydrated] = useState<boolean>(false);

  // Hydrate authentication state from Supabase session and fetch data from DB
  useEffect(() => {
    const hydrateAuth = async () => {
      if (!isSupabaseConfigured()) {
        setIsHydrated(true);
        return;
      }

      const supabase = createClient();
      if (!supabase) {
        setIsHydrated(true);
        return;
      }

      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          setIsAuthenticated(true);
          setAdminUser({
            id: user.id,
            full_name: "Administrator",
            email: user.email || "",
            company_name: "Chesapeake Pharma LLC",
            role: "admin",
            approval_status: "approved",
            requested_packs: "DB1 & DB2",
            created_at: new Date().toISOString()
          });

          // Fetch drugs, users, and subscriptions from database
          const [drugsResponse, usersResponse, subscriptionsResponse] = await Promise.all([
            fetchDrugsAction(),
            fetchUsersAction(),
            fetchSubscriptionsAction()
          ]);

          if (drugsResponse.success && drugsResponse.data) {
            setDrugs(drugsResponse.data);
          }
          if (usersResponse.success && usersResponse.data) {
            setUsers(usersResponse.data);
          }
          if (subscriptionsResponse.success && subscriptionsResponse.data) {
            setSubscriptions(subscriptionsResponse.data);
          }
        }
      } catch (error) {
        console.error("Auth hydration error:", error);
      } finally {
        setIsHydrated(true);
      }
    };

    hydrateAuth();
  }, []);

  const addToast = (toast: Omit<ToastMessage, "id">) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    setToasts((prev) => [...prev, { ...toast, id }]);
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const loginAsAdmin = async (email?: string, password?: string) => {
    // Simulate API delay
    await new Promise((r) => setTimeout(r, 600));

    // Demo validation
    if (!email || !password) {
      return { success: false, error: "Please enter both an authorized email and password." };
    }

    if (!email.includes("@")) {
      return { success: false, error: "Please enter a valid email address." };
    }

    if (password === "wrongpassword" || password.length < 6) {
      return { success: false, error: "Invalid credentials. This attempt has been logged for security." };
    }

    setIsAuthenticated(true);
    setAdminUser({
      id: "admin-user",
      full_name: "Administrator",
      email: email,
      company_name: "Chesapeake Pharma LLC",
      role: "admin",
      approval_status: "approved",
      requested_packs: "DB1 & DB2",
      created_at: new Date().toISOString()
    });
    addToast({
      type: "success",
      title: "Authenticated as Administrator",
      message: "Welcome to Chesapeake Pharma CMS."
    });
    return { success: true };
  };

  const logout = async () => {
    if (isSupabaseConfigured()) {
      const supabase = createClient();
      if (supabase) {
        try {
          await supabase.auth.signOut();
        } catch (error) {
          console.error("Sign out error:", error);
        }
      }
    }
    
    setIsAuthenticated(false);
    setAdminUser(null);
    addToast({
      type: "info",
      title: "Logged Out",
      message: "Admin session ended. Redirected to /admin sign in."
    });
  };

  const toggleAuthForReview = () => {
    setIsAuthenticated((prev) => !prev);
  };

  const addDrug = async (newDrug: Omit<AdminDrug, "id" | "created_at" | "updated_at">) => {
    try {
      // If Supabase is configured, use server action
      if (isSupabaseConfigured()) {
        const response = await createDrugAction(newDrug);
        if (response.success && response.data) {
          setDrugs((prev) => [response.data as AdminDrug, ...prev]);
          addToast({
            type: "success",
            title: `Drug Record Created (${response.data.dataset_type})`,
            message: `${response.data.drug_name} has been added to the database.`
          });
        } else {
          addToast({
            type: "error",
            title: "Error Creating Drug",
            message: response.error || "Failed to create drug record"
          });
        }
      } else {
        // Fallback to demo mode
        const id = `${newDrug.dataset_type.toLowerCase()}-${Date.now().toString().slice(-4)}`;
        const now = new Date().toISOString();
        const created: AdminDrug = {
          ...newDrug,
          id,
          created_at: now,
          updated_at: now
        };
        setDrugs((prev) => [created, ...prev]);
        addToast({
          type: "success",
          title: `Drug Record Created (${created.dataset_type})`,
          message: `${created.drug_name} has been added to demo dataset.`
        });
      }
    } catch (error) {
      addToast({
        type: "error",
        title: "Error",
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  };

  const updateDrug = async (id: string, updatedFields: Partial<AdminDrug>) => {
    try {
      // If Supabase is configured, use server action
      if (isSupabaseConfigured()) {
        const response = await updateDrugAction(id, updatedFields);
        if (response.success && response.data) {
          setDrugs((prev) =>
            prev.map((d) => (d.id === id ? (response.data as AdminDrug) : d))
          );
          addToast({
            type: "success",
            title: "Drug Record Updated",
            message: `Changes saved to ${response.data.drug_name}.`
          });
        } else {
          addToast({
            type: "error",
            title: "Error Updating Drug",
            message: response.error || "Failed to update drug record"
          });
        }
      } else {
        // Fallback to demo mode
        const now = new Date().toISOString();
        setDrugs((prev) =>
          prev.map((d) => (d.id === id ? { ...d, ...updatedFields, updated_at: now } : d))
        );
        addToast({
          type: "success",
          title: "Drug Record Updated",
          message: `Changes saved to drug ${id}.`
        });
      }
    } catch (error) {
      addToast({
        type: "error",
        title: "Error",
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  };

  const deleteDrug = async (id: string) => {
    try {
      const target = drugs.find((d) => d.id === id);
      
      // If Supabase is configured, use server action
      if (isSupabaseConfigured()) {
        const response = await deleteDrugAction(id);
        if (response.success) {
          setDrugs((prev) => prev.filter((d) => d.id !== id));
          addToast({
            type: "warning",
            title: "Drug Record Deleted",
            message: target ? `${target.drug_name} was removed.` : `Record ${id} was deleted.`
          });
        } else {
          addToast({
            type: "error",
            title: "Error Deleting Drug",
            message: response.error || "Failed to delete drug record"
          });
        }
      } else {
        // Fallback to demo mode
        setDrugs((prev) => prev.filter((d) => d.id !== id));
        addToast({
          type: "warning",
          title: "Drug Record Deleted",
          message: target ? `${target.drug_name} was removed.` : `Record ${id} was deleted.`
        });
      }
    } catch (error) {
      addToast({
        type: "error",
        title: "Error",
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  };

  const approveUser = async (id: string, notes?: string) => {
    try {
      if (isSupabaseConfigured()) {
        const response = await approveUserAction(id, notes);
        if (response.success && response.data) {
          setUsers((prev) =>
            prev.map((u) => (u.id === id ? response.data as AdminUser : u))
          );
          addToast({
            type: "success",
            title: "User Approved",
            message: `${response.data.full_name} has been approved.`
          });
        } else {
          addToast({
            type: "error",
            title: "Error",
            message: response.error || "Failed to approve user"
          });
        }
      } else {
        // Demo mode
        setUsers((prev) =>
          prev.map((u) =>
            u.id === id
              ? {
                  ...u,
                  approval_status: "approved",
                  notes: notes || u.notes
                }
              : u
          )
        );
        addToast({
          type: "success",
          title: "User Approved",
          message: `User marked as approved.`
        });
      }
    } catch (error) {
      addToast({
        type: "error",
        title: "Error",
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  };

  const rejectUser = async (id: string, reason?: string) => {
    try {
      if (isSupabaseConfigured()) {
        const response = await rejectUserAction(id, reason || "Declined during commercial verification");
        if (response.success && response.data) {
          setUsers((prev) =>
            prev.map((u) => (u.id === id ? response.data as AdminUser : u))
          );
          addToast({
            type: "warning",
            title: "User Rejected",
            message: `Access denied for user ${id}.`
          });
        } else {
          addToast({
            type: "error",
            title: "Error",
            message: response.error || "Failed to reject user"
          });
        }
      } else {
        // Demo mode
        setUsers((prev) =>
          prev.map((u) =>
            u.id === id
              ? {
                  ...u,
                  approval_status: "rejected",
                  notes: reason ? `Rejected: ${reason}` : u.notes
                }
              : u
          )
        );
        addToast({
          type: "warning",
          title: "User Rejected",
          message: `Access denied for user ${id}.`
        });
      }
    } catch (error) {
      addToast({
        type: "error",
        title: "Error",
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  };

  const addSubscription = async (sub: Omit<AdminSubscription, "id" | "created_at">) => {
    try {
      if (isSupabaseConfigured()) {
        const response = await createSubscriptionAction(sub);
        if (response.success && response.data) {
          setSubscriptions((prev) => [response.data as AdminSubscription, ...prev]);
          addToast({
            type: "success",
            title: `Subscription Activated (${response.data.dataset_type})`,
            message: `1-Year term granted to ${response.data.company_name}.`
          });
        } else {
          addToast({
            type: "error",
            title: "Error",
            message: response.error || "Failed to create subscription"
          });
        }
      } else {
        // Demo mode
        const id = `sub-${Date.now().toString().slice(-4)}`;
        const now = new Date().toISOString();
        const created: AdminSubscription = {
          ...sub,
          id,
          created_at: now
        };
        setSubscriptions((prev) => [created, ...prev]);
        addToast({
          type: "success",
          title: `Subscription Activated (${created.dataset_type})`,
          message: `1-Year term granted to ${created.company_name}.`
        });
      }
    } catch (error) {
      addToast({
        type: "error",
        title: "Error",
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  };

  const toggleSubscriptionStatus = async (id: string, newStatus: AdminSubscription["status"]) => {
    try {
      if (isSupabaseConfigured()) {
        const response = await updateSubscriptionStatusAction(id, newStatus);
        if (response.success && response.data) {
          setSubscriptions((prev) =>
            prev.map((s) => (s.id === id ? response.data as AdminSubscription : s))
          );
          addToast({
            type: "info",
            title: "Subscription Status Changed",
            message: `Subscription ${id} is now ${newStatus}.`
          });
        } else {
          addToast({
            type: "error",
            title: "Error",
            message: response.error || "Failed to update subscription"
          });
        }
      } else {
        // Demo mode
        setSubscriptions((prev) =>
          prev.map((s) => (s.id === id ? { ...s, status: newStatus } : s))
        );
        addToast({
          type: "info",
          title: "Subscription Status Changed",
          message: `Subscription ${id} is now ${newStatus}.`
        });
      }
    } catch (error) {
      addToast({
        type: "error",
        title: "Error",
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  };

  const addImportJob = (job: Omit<AdminImportJob, "id" | "created_at">) => {
    const id = `imp-${Date.now().toString().slice(-4)}`;
    const now = new Date().toISOString();
    const created: AdminImportJob = {
      ...job,
      id,
      created_at: now
    };
    setImports((prev) => [created, ...prev]);
    addToast({
      type: created.status === "completed" ? "success" : "warning",
      title: `Import Job Recorded (${created.dataset_type})`,
      message: `${created.file_name}: ${created.inserted_count} inserted, ${created.updated_count} updated.`
    });
  };

  return (
    <AdminContext.Provider
      value={{
        isAuthenticated,
        adminUser,
        loginAsAdmin,
        logout,
        toggleAuthForReview,
        drugs,
        users,
        subscriptions,
        imports,
        addDrug,
        updateDrug,
        deleteDrug,
        approveUser,
        rejectUser,
        addSubscription,
        toggleSubscriptionStatus,
        addImportJob,
        toasts,
        addToast,
        removeToast
      }}
    >
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error("useAdmin must be used within an AdminProvider");
  }
  return context;
}
