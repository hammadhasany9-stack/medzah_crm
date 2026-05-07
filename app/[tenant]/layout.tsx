import { notFound } from "next/navigation";
import { TenantProvider } from "@/components/providers/TenantProvider";
import { Sidebar } from "@/components/shell/Sidebar";
import { CRMClientShell } from "@/components/shell/CRMClientShell";
import type { Tenant } from "@/lib/auth/constants";
import { isTenant } from "@/lib/auth/constants";

export default async function TenantLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ tenant: string }>;
}) {
  const { tenant: raw } = await params;
  if (!isTenant(raw)) {
    notFound();
  }
  const tenant = raw as Tenant;
  return (
    <TenantProvider tenant={tenant}>
      <div className="flex h-screen bg-slate-100 overflow-hidden">
        <Sidebar />
        <div className="flex-1 ml-64 flex flex-col overflow-hidden print:ml-0">
          <CRMClientShell>{children}</CRMClientShell>
        </div>
      </div>
    </TenantProvider>
  );
}
