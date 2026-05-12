"use client";

import { useMemo } from "react";
import { TenantLink } from "@/components/providers/TenantLink";
import { CustomerIntakeOnboardingWizard } from "@/components/customer-intake/CustomerIntakeOnboardingWizard";
import { ClipboardList } from "lucide-react";
import { getCustomerIntakeById } from "@/lib/mock-data/customer-intake";

export function CrmOnboardingClient({ id }: { id: string }) {
  const record = useMemo(() => (id ? getCustomerIntakeById(id) : null), [id]);

  if (!record) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-0px)] gap-4 p-6 bg-slate-100">
        <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200 flex items-center justify-center shadow-sm">
          <ClipboardList size={24} className="text-slate-400" />
        </div>
        <p className="text-base font-semibold text-slate-700">Intake not found</p>
        <TenantLink href="/customer-intake" className="text-sm font-semibold text-[#002f93] hover:underline">
          ← Back to Customer Intake
        </TenantLink>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <CustomerIntakeOnboardingWizard key={record.id} initialRecord={record} />
    </div>
  );
}
