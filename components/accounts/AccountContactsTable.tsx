"use client";

import { Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

export type AccountContactDraftRow = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneMobile: string;
  otherPhone: string;
  department: string;
  title: string;
};

const inputCls =
  "w-full min-w-[6.5rem] px-2 py-1.5 rounded-lg border border-slate-200 text-sm text-slate-800 bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#002f93]/20 focus:border-[#002f93] transition-colors";

const idInputCls =
  "w-full min-w-[5.5rem] px-2 py-1.5 rounded-lg border border-slate-100 text-sm text-slate-500 bg-slate-50 cursor-default";

const thCls =
  "text-left text-xs font-semibold text-slate-500 tracking-wide whitespace-nowrap px-2 py-2 border-b border-slate-100";

interface AccountContactsTableProps {
  rows: AccountContactDraftRow[];
  onChange: (rows: AccountContactDraftRow[]) => void;
  onAddRow: () => void;
  onRemoveRow: (index: number) => void;
}

function updateRow(
  rows: AccountContactDraftRow[],
  index: number,
  patch: Partial<Omit<AccountContactDraftRow, "id">>
): AccountContactDraftRow[] {
  return rows.map((r, i) => (i === index ? { ...r, ...patch } : r));
}

export function AccountContactsTable({
  rows,
  onChange,
  onAddRow,
  onRemoveRow,
}: AccountContactsTableProps) {
  return (
    <div className="mt-10">
      <div className="flex items-center justify-between gap-3 mb-3">
        <h2 className="text-sm font-semibold text-slate-800 tracking-wide">Contacts</h2>
        <button
          type="button"
          onClick={onAddRow}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#002f93] border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
        >
          <Plus size={14} strokeWidth={2.5} />
          Add contact
        </button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-slate-50/80">
              <th className={thCls}>Contact ID</th>
              <th className={thCls}>First name</th>
              <th className={thCls}>Last name</th>
              <th className={thCls}>Email</th>
              <th className={thCls}>Phone / mobile</th>
              <th className={thCls}>Other phone</th>
              <th className={thCls}>Department</th>
              <th className={thCls}>Title</th>
              <th className={cn(thCls, "w-10")} aria-label="Remove row" />
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-4 py-8 text-center text-sm text-slate-500">
                  No contacts yet. Use &quot;Add contact&quot; to add a row.
                </td>
              </tr>
            ) : (
              rows.map((row, index) => (
                <tr key={row.id} className="border-b border-slate-100 last:border-b-0">
                  <td className="px-2 py-2 align-middle">
                    <input
                      type="text"
                      readOnly
                      className={idInputCls}
                      value={row.id}
                      tabIndex={-1}
                    />
                  </td>
                  <td className="px-2 py-2 align-middle">
                    <input
                      type="text"
                      className={inputCls}
                      placeholder="None"
                      value={row.firstName}
                      onChange={(e) => onChange(updateRow(rows, index, { firstName: e.target.value }))}
                    />
                  </td>
                  <td className="px-2 py-2 align-middle">
                    <input
                      type="text"
                      className={inputCls}
                      placeholder="None"
                      value={row.lastName}
                      onChange={(e) => onChange(updateRow(rows, index, { lastName: e.target.value }))}
                    />
                  </td>
                  <td className="px-2 py-2 align-middle">
                    <input
                      type="email"
                      className={inputCls}
                      placeholder="None"
                      value={row.email}
                      onChange={(e) => onChange(updateRow(rows, index, { email: e.target.value }))}
                    />
                  </td>
                  <td className="px-2 py-2 align-middle">
                    <input
                      type="text"
                      className={inputCls}
                      placeholder="None"
                      value={row.phoneMobile}
                      onChange={(e) => onChange(updateRow(rows, index, { phoneMobile: e.target.value }))}
                    />
                  </td>
                  <td className="px-2 py-2 align-middle">
                    <input
                      type="text"
                      className={inputCls}
                      placeholder="None"
                      value={row.otherPhone}
                      onChange={(e) => onChange(updateRow(rows, index, { otherPhone: e.target.value }))}
                    />
                  </td>
                  <td className="px-2 py-2 align-middle">
                    <input
                      type="text"
                      className={inputCls}
                      placeholder="None"
                      value={row.department}
                      onChange={(e) => onChange(updateRow(rows, index, { department: e.target.value }))}
                    />
                  </td>
                  <td className="px-2 py-2 align-middle">
                    <input
                      type="text"
                      className={inputCls}
                      placeholder="None"
                      value={row.title}
                      onChange={(e) => onChange(updateRow(rows, index, { title: e.target.value }))}
                    />
                  </td>
                  <td className="px-1 py-2 align-middle text-center">
                    <button
                      type="button"
                      onClick={() => onRemoveRow(index)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      title="Remove row"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
