"use client";

import { Mail, Phone, MapPin, Briefcase, Calendar, User } from "lucide-react";
import { AllocationRecord } from "@/lib/types";

interface CustomerInfoCardProps {
  record: AllocationRecord;
}

function InfoField({ icon: Icon, label, value }: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-2.5">
      <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0 mt-0.5">
        <Icon size={13} className="text-slate-500" />
      </div>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</p>
        <p className="text-sm font-semibold text-slate-800 mt-0.5">{value || "—"}</p>
      </div>
    </div>
  );
}

export function CustomerInfoCard({ record }: CustomerInfoCardProps) {
  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm px-6 py-5">
      <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4">Customer Information</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <InfoField icon={Mail}      label="Email"         value={record.email} />
        <InfoField icon={Phone}     label="Phone"         value={record.phone} />
        <InfoField icon={MapPin}    label="Location"      value={record.location} />
        <InfoField icon={Briefcase} label="Business Type" value={record.businessType} />
        <InfoField icon={Calendar}  label="Created Date"  value={record.createdDate} />
        <InfoField icon={User}      label="Owner"         value={record.ownerName} />
      </div>
    </div>
  );
}
