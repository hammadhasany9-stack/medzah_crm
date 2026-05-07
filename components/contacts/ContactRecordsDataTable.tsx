"use client";

import type { ReactNode } from "react";
import { TenantLink } from "@/components/providers/TenantLink";
import { Building2, Mail, Phone } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  formatPhoneMobile,
  type ContactRecord,
} from "@/lib/mock-data/contacts";

export type ContactRecordsDataTableDensity = "comfortable" | "compact";

export interface ContactRecordsDataTableProps {
  contacts: ContactRecord[];
  accountIdMap: Record<string, string>;
  density?: ContactRecordsDataTableDensity;
  /** When false, omits the Account column (e.g. account list row expansion). Default true. */
  showAccountColumn?: boolean;
  /** Full `<tr>` for `<thead>`; if omitted, a default header row is used (8 or 9 data columns). */
  headerRow?: ReactNode;
  /** Rendered before the standard data cells in each body row (e.g. checkbox). */
  rowPrefix?: (contact: ContactRecord) => ReactNode;
  /** Rendered after the standard data cells (e.g. actions). */
  rowSuffix?: (contact: ContactRecord) => ReactNode;
  emptyMessage?: string;
  /** Rich empty state (overrides `emptyMessage` when set). */
  emptySlot?: ReactNode;
  /** `colSpan` for the empty state row (include prefix/suffix columns if any). */
  emptyColSpan?: number;
  /** Per-row className on `<tr>` (e.g. selection highlight). */
  rowClassName?: (contact: ContactRecord) => string | undefined;
  className?: string;
  /** Wrap table in overflow-x-auto when true (default true). */
  scrollable?: boolean;
}

export function ContactRecordsDataTable({
  contacts,
  accountIdMap,
  density = "comfortable",
  showAccountColumn = true,
  headerRow,
  rowPrefix,
  rowSuffix,
  emptyMessage = "No contacts linked to this account.",
  emptySlot,
  emptyColSpan: emptyColSpanProp,
  className,
  scrollable = true,
  rowClassName,
}: ContactRecordsDataTableProps) {
  const compact = density === "compact";
  const dataColCount = showAccountColumn ? 9 : 8;
  const emptyColSpan =
    emptyColSpanProp ??
    dataColCount + (rowPrefix ? 1 : 0) + (rowSuffix ? 1 : 0);
  const thCls = cn(
    "text-left text-xs font-bold uppercase tracking-wider text-slate-500",
    compact ? "px-2 py-2" : "px-4 py-3",
    !headerRow && "cursor-default select-none"
  );
  const tdCls = cn(
    "align-middle",
    compact ? "px-2 py-2 text-xs text-slate-700" : "px-4 py-3.5 text-sm text-slate-700"
  );

  const table = (
    <table className={cn("w-full border-collapse", className)}>
      <thead>
        {headerRow ?? (
          <tr className="bg-slate-50 border-b border-slate-100">
            <th className={thCls}>Contact ID</th>
            <th className={thCls}>First Name</th>
            <th className={thCls}>Last Name</th>
            <th className={thCls}>Email</th>
            <th className={thCls}>Phone/Mobile</th>
            <th className={thCls}>Other Phone</th>
            <th className={thCls}>Department</th>
            <th className={thCls}>Title</th>
            {showAccountColumn ? <th className={thCls}>Account</th> : null}
          </tr>
        )}
      </thead>
      <tbody className="divide-y divide-slate-50">
        {contacts.length === 0 ? (
          <tr>
            <td colSpan={emptyColSpan} className="py-10 text-center text-sm text-slate-500">
              {emptySlot ?? emptyMessage}
            </td>
          </tr>
        ) : (
          contacts.map((contact) => (
            <tr
              key={contact.id}
              className={cn(
                "group transition-colors hover:bg-slate-50/70",
                rowClassName?.(contact)
              )}
            >
              {rowPrefix?.(contact)}
              <td className={tdCls}>
                <TenantLink
                  href={`/contact/${contact.id}`}
                  className="inline-flex text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md font-mono hover:text-[#002f93] hover:bg-[#EFF3FF] transition-colors"
                >
                  {contact.id}
                </TenantLink>
              </td>
              <td className={cn(tdCls, "font-medium text-slate-800")}>
                <TenantLink
                  href={`/contact/${contact.id}`}
                  className="hover:text-[#002f93] hover:underline"
                >
                  {contact.firstName}
                </TenantLink>
              </td>
              <td className={cn(tdCls, "font-medium text-slate-800")}>
                <TenantLink
                  href={`/contact/${contact.id}`}
                  className="hover:text-[#002f93] hover:underline"
                >
                  {contact.lastName}
                </TenantLink>
              </td>
              <td className={tdCls}>
                {contact.email ? (
                  <div className="flex items-center gap-1.5 min-w-0">
                    <Mail
                      size={compact ? 11 : 12}
                      className="text-slate-400 flex-shrink-0"
                    />
                    <a
                      href={`mailto:${contact.email}`}
                      className="text-[#002f93] hover:underline truncate"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {contact.email}
                    </a>
                  </div>
                ) : (
                  <span className="text-slate-400">—</span>
                )}
              </td>
              <td className={tdCls}>
                {(() => {
                  const pm = formatPhoneMobile(contact);
                  return pm ? (
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <Phone
                        size={compact ? 11 : 12}
                        className="text-slate-400 flex-shrink-0"
                      />
                      <span>{pm}</span>
                    </div>
                  ) : (
                    <span className="text-slate-400">—</span>
                  );
                })()}
              </td>
              <td className={tdCls}>
                {contact.otherPhone ? (
                  <span className="text-slate-600">{contact.otherPhone}</span>
                ) : (
                  <span className="text-slate-400">—</span>
                )}
              </td>
              <td className={tdCls}>
                {contact.department || (
                  <span className="text-slate-400">—</span>
                )}
              </td>
              <td className={tdCls}>
                {contact.title || <span className="text-slate-400">—</span>}
              </td>
              {showAccountColumn ? (
                <td className={tdCls}>
                  {contact.accountName ? (
                    accountIdMap[contact.accountName] ? (
                      <TenantLink
                        href={`/account/${accountIdMap[contact.accountName]}`}
                        className="flex items-center gap-1.5 text-[#002f93] hover:underline min-w-0"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Building2
                          size={compact ? 11 : 12}
                          className="text-slate-400 flex-shrink-0"
                        />
                        <span className="truncate">{contact.accountName}</span>
                      </TenantLink>
                    ) : (
                      <div className="flex items-center gap-1.5 text-slate-600 min-w-0">
                        <Building2
                          size={compact ? 11 : 12}
                          className="text-slate-400 flex-shrink-0"
                        />
                        <span className="truncate">{contact.accountName}</span>
                      </div>
                    )
                  ) : (
                    <span className="text-slate-400">—</span>
                  )}
                </td>
              ) : null}
              {rowSuffix?.(contact)}
            </tr>
          ))
        )}
      </tbody>
    </table>
  );

  if (scrollable) {
    return <div className="overflow-x-auto">{table}</div>;
  }
  return table;
}
