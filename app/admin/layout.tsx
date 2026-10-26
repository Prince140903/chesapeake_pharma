import type { Metadata } from "next";
import { AdminProvider } from "@/components/admin/admin-context";
import { AdminLayoutShell } from "@/components/admin/admin-layout-shell";

export const metadata: Metadata = {
  title: "Chesapeake Pharma | Administrator CMS",
  description: "Internal administrator management console for drug intelligence datasets, customer approvals, and subscriptions."
};

export default function AdminRootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminProvider>
      <AdminLayoutShell>{children}</AdminLayoutShell>
    </AdminProvider>
  );
}
