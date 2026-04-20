"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Target,
  FileText,
  ShoppingCart,
  Package,
  Building2,
  Users,
  ClipboardList,
  FolderOpen,
  FileSignature,
  Megaphone,
  Settings,
  Inbox,
  LogOut,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";

const salesLinks = [
  { href: "/leads", label: "Leads", icon: Target },
  { href: "/opportunity", label: "Opportunity", icon: TrendingUp },
  { href: "/quotes", label: "Quotes", icon: FileText },
  { href: "/sales-orders", label: "Sales Orders", icon: ShoppingCart },
];

const customerLinks = [
  { href: "/allocation", label: "Allocation", icon: Package },
  { href: "/account", label: "Account", icon: Building2 },
  { href: "/contact", label: "Contact", icon: Users },
  { href: "/customer-intake", label: "Customer Intake", icon: ClipboardList },
  { href: "/documents", label: "Documents", icon: FolderOpen },
  { href: "/contracts", label: "Contracts", icon: FileSignature },
  { href: "/campaign", label: "Campaign", icon: Megaphone },
];

function NavItem({
  href,
  label,
  icon: Icon,
  active,
}: {
  href: string;
  label: string;
  icon: React.ElementType;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-150",
        active
          ? "bg-[rgba(0,47,147,0.2)] text-white border-l-2 border-[#002f93] pl-[10px]"
          : "text-slate-400 hover:bg-white/5 hover:text-slate-200 border-l-2 border-transparent pl-[10px]"
      )}
    >
      <Icon size={16} className="flex-shrink-0" />
      <span className="truncate">{label}</span>
    </Link>
  );
}

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 w-64 bg-[#0F172A] flex flex-col z-30 print:hidden">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-white/5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#002f93] flex items-center justify-center">
            <LayoutDashboard size={16} className="text-white" />
          </div>
          <div>
            <span className="text-white font-bold text-base tracking-tight">Medzah</span>
            <span className="ml-1.5 text-xs font-semibold text-slate-500 uppercase tracking-widest">
              CRM
            </span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-5">
        {/* Dashboard */}
        <div>
          <NavItem
            href="/dashboard"
            label="Dashboard"
            icon={LayoutDashboard}
            active={pathname === "/dashboard"}
          />
        </div>

        {/* Sales */}
        <div>
          <p className="px-3 mb-1.5 text-xs font-semibold uppercase tracking-widest text-slate-600">
            Sales
          </p>
          <div className="space-y-0.5">
            {salesLinks.map((link) => (
              <NavItem
                key={link.href}
                href={link.href}
                label={link.label}
                icon={link.icon}
                active={pathname === link.href || pathname.startsWith(link.href + "/")}
              />
            ))}
          </div>
        </div>

        {/* Customer */}
        <div>
          <p className="px-3 mb-1.5 text-xs font-semibold uppercase tracking-widest text-slate-600">
            Customer
          </p>
          <div className="space-y-0.5">
            {customerLinks.map((link) => (
              <NavItem
                key={link.href}
                href={link.href}
                label={link.label}
                icon={link.icon}
                active={pathname === link.href || pathname.startsWith(link.href + "/")}
              />
            ))}
          </div>
        </div>
      </nav>

      {/* User Profile */}
      <div className="border-t border-white/5">
        <div className="mx-3 my-3 bg-[#1E293B] rounded-xl p-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#002f93] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              KC
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-white truncate">Kevin Calamari</p>
              <p className="text-xs text-slate-400 truncate">Sales Director</p>
            </div>
          </div>
        </div>

        <div className="px-3 pb-3 space-y-0.5">
          <NavItem href="/settings" label="Settings" icon={Settings} active={pathname === "/settings"} />
          <NavItem href="/inbox" label="Sales Inbox" icon={Inbox} active={pathname === "/inbox"} />
          <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-400 hover:bg-white/5 hover:text-red-400 rounded-lg transition-all duration-150 border-l-2 border-transparent pl-[10px]">
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
