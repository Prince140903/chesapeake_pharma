"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import {
  AdminDrug,
  AdminUser,
  AdminSubscription,
  AdminImportJob,
  INITIAL_MOCK_DRUGS,
  INITIAL_MOCK_USERS,
  INITIAL_MOCK_SUBSCRIPTIONS,
  INITIAL_MOCK_IMPORTS
} from "@/lib/admin-mock-data";

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
  addDrug: (drug: Omit<AdminDrug, "id" | "created_at" | "updated_at">) => void;
  updateDrug: (id: string, drug: Partial<AdminDrug>) => void;
  deleteDrug: (id: string) => void;

  // User actions
  approveUser: (id: string, notes?: string) => void;
  rejectUser: (id: string, reason?: string) => void;

  // Subscription actions
  addSubscription: (sub: Omit<AdminSubscription, "id" | "created_at">) => void;
  toggleSubscriptionStatus: (id: string, newStatus: AdminSubscription["status"]) => void;

  // Import actions
  addImportJob: (job: Omit<AdminImportJob, "id" | "created_at">) => void;

  // Toast
  toasts: ToastMessage[];
  addToast: (toast: Omit<ToastMessage, "id">) => void;
  removeToast: (id: string) => void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true); // default to authenticated for review convenience
  const [adminUser, setAdminUser] = useState<AdminUser | null>(INITIAL_MOCK_USERS[5]); // Dr. Philip Green
  const [drugs, setDrugs] = useState<AdminDrug[]>(INITIAL_MOCK_DRUGS);
  const [users, setUsers] = useState<AdminUser[]>(INITIAL_MOCK_USERS);
  const [subscriptions, setSubscriptions] = useState<AdminSubscription[]>(INITIAL_MOCK_SUBSCRIPTIONS);
  const [imports, setImports] = useState<AdminImportJob[]>(INITIAL_MOCK_IMPORTS);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

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
    setAdminUser(INITIAL_MOCK_USERS[5]);
    addToast({
      type: "success",
      title: "Authenticated as Administrator",
      message: "Welcome to Chesapeake Pharma CMS. Operating in UI prototype mode."
    });
    return { success: true };
  };

  const logout = () => {
    setIsAuthenticated(false);
    addToast({
      type: "info",
      title: "Logged Out",
      message: "Admin session ended. Redirected to /admin sign in."
    });
  };

  const toggleAuthForReview = () => {
    setIsAuthenticated((prev) => !prev);
  };

  const addDrug = (newDrug: Omit<AdminDrug, "id" | "created_at" | "updated_at">) => {
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
      message: `${created.drug_name} has been added to mock dataset.`
    });
  };

  const updateDrug = (id: string, updatedFields: Partial<AdminDrug>) => {
    const now = new Date().toISOString();
    setDrugs((prev) =>
      prev.map((d) => (d.id === id ? { ...d, ...updatedFields, updated_at: now } : d))
    );
    addToast({
      type: "success",
      title: "Drug Record Updated",
      message: `Changes saved to drug ${id}.`
    });
  };

  const deleteDrug = (id: string) => {
    const target = drugs.find((d) => d.id === id);
    setDrugs((prev) => prev.filter((d) => d.id !== id));
    addToast({
      type: "warning",
      title: "Drug Record Deleted",
      message: target ? `${target.drug_name} was removed.` : `Record ${id} was deleted.`
    });
  };

  const approveUser = (id: string, notes?: string) => {
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
    const user = users.find((u) => u.id === id);
    addToast({
      type: "success",
      title: "User Approved",
      message: `${user?.full_name || "User"} marked as approved. Remember to activate subscription packs separately.`
    });
  };

  const rejectUser = (id: string, reason?: string) => {
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
      title: "User Request Rejected",
      message: `Access denied for user ${id}.`
    });
  };

  const addSubscription = (sub: Omit<AdminSubscription, "id" | "created_at">) => {
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
      message: `1-Year term granted to ${created.company_name} ending on ${created.expires_at}.`
    });
  };

  const toggleSubscriptionStatus = (id: string, newStatus: AdminSubscription["status"]) => {
    setSubscriptions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: newStatus } : s))
    );
    addToast({
      type: "info",
      title: "Subscription Status Changed",
      message: `Subscription ${id} is now ${newStatus}.`
    });
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
