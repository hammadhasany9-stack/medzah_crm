"use client";

import Link from "next/link";
import { Bell, HelpCircle, Plus, Search, RotateCcw } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { useCRMShell } from "./CRMShellContext";
import { resetDemoAndReload } from "@/lib/reset-demo-data";

interface TopNavBarProps {
  title: string;
  myTabLabel?: string;
  teamTabLabel?: string;
  createLabel?: string;
  createHref?: string;
  searchPlaceholder?: string;
  showTabs?: boolean;
  showSearch?: boolean;
  showCreate?: boolean;
  onCreateClick?: () => void;
}

export function TopNavBar({
  title,
  myTabLabel = "My Leads",
  teamTabLabel = "Team View",
  createLabel = "Create Lead",
  createHref = "/leads/create",
  searchPlaceholder = "Search leads, companies, or tasks...",
  showTabs = true,
  showSearch = true,
  showCreate = true,
  onCreateClick,
}: TopNavBarProps) {
  const { ownerTab, setOwnerTab } = useCRMShell();

  function handleResetDemo() {
    if (
      window.confirm(
        "Reset all demo data to the original mock state? Leads, opportunities, allocations, contracts, accounts, contacts, customer intake, and products will be restored. The page will reload."
      )
    ) {
      resetDemoAndReload();
    }
  }

  return (
    <header className="sticky top-0 z-20 bg-white border-b border-slate-200 shadow-[0_1px_3px_rgba(0,0,0,0.04)] print:hidden">
      <div className="flex items-center gap-4 px-6 h-[60px]">
        {/* Title + toggle */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <h2 className="text-xl font-bold tracking-tight text-slate-900">{title}</h2>
          {showTabs && (
            <div className="flex rounded-lg border border-slate-200 overflow-hidden text-xs font-semibold">
              <button
                onClick={() => setOwnerTab("my-leads")}
                className={
                  ownerTab === "my-leads"
                    ? "px-3 py-1.5 bg-[#002f93] text-white transition-colors"
                    : "px-3 py-1.5 bg-white text-slate-500 hover:bg-slate-50 transition-colors"
                }
              >
                {myTabLabel}
              </button>
              <button
                onClick={() => setOwnerTab("team")}
                className={
                  ownerTab === "team"
                    ? "px-3 py-1.5 bg-[#002f93] text-white transition-colors"
                    : "px-3 py-1.5 bg-white text-slate-500 hover:bg-slate-50 transition-colors"
                }
              >
                {teamTabLabel}
              </button>
            </div>
          )}
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        <button
          type="button"
          title="Reset demo — restore all mock CRM data and reload"
          onClick={handleResetDemo}
          className="flex-shrink-0 inline-flex items-center gap-1.5 px-2 sm:px-2.5 py-1.5 text-[11px] sm:text-xs font-semibold text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
        >
          <RotateCcw size={14} className="text-slate-500 flex-shrink-0" />
          <span className="hidden sm:inline">Reset demo</span>
        </button>

        {/* Search */}
        {showSearch && (
          <div className="w-72">
            <Input
              icon={<Search size={14} />}
              placeholder={searchPlaceholder}
            />
          </div>
        )}

        {/* Action icons */}
        <div className="flex items-center gap-1">
          <button className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-100 transition-colors relative">
            <Bell size={18} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
          </button>
          <button className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-100 transition-colors">
            <HelpCircle size={18} />
          </button>
        </div>

        {showCreate && (
          onCreateClick ? (
            <button
              onClick={onCreateClick}
              className="flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-2 text-sm font-semibold bg-slate-900 text-white rounded-lg hover:bg-black transition-colors"
            >
              <Plus size={14} />
              {createLabel}
            </button>
          ) : (
            <Link
              href={createHref}
              className="flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-2 text-sm font-semibold bg-slate-900 text-white rounded-lg hover:bg-black transition-colors"
            >
              <Plus size={14} />
              {createLabel}
            </Link>
          )
        )}
      </div>
    </header>
  );
}
