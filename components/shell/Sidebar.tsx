"use client";

import {
  useTenant,
  useTenantPath,
} from "@/components/providers/TenantProvider";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Target,
  FileText,
  ShoppingCart,
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

const leadLinks = [
  { href: "/leads", label: "Leads", icon: Target },
  { href: "/opportunity", label: "Opportunity", icon: TrendingUp },
];

const sharedSalesLinks = [
  { href: "/quotes", label: "Quotes", icon: FileText },
  { href: "/sales-orders", label: "Sales Orders", icon: ShoppingCart },
];

const customerLinks = [
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
          ? "bg-[rgba(0,47,147,0.08)] text-[#002f93] border-l-2 border-[#002f93] pl-[10px]"
          : "text-slate-500 hover:bg-slate-100 hover:text-slate-900 border-l-2 border-transparent pl-[10px]"
      )}
    >
      <Icon size={16} className="flex-shrink-0" />
      <span className="truncate">{label}</span>
    </Link>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const { tenant } = useTenant();
  const t = useTenantPath();

  const dash = t("/dashboard");
  const settingsHref = t("/settings");
  const inboxHref = t("/inbox");

  const salesLinks =
    tenant === "kevin" ? [...leadLinks, ...sharedSalesLinks] : sharedSalesLinks;

  const profile =
    tenant === "kevin"
      ? { initials: "KC", name: "Kevin Calamari", title: "Sales Director" }
      : { initials: "A", name: "Amanda", title: "Operations" };

  const customerNavLinks =
    tenant === "amanda"
      ? customerLinks.map((link) =>
          link.href === "/customer-intake"
            ? { ...link, href: "/customer-intake/approval" }
            : link.href === "/contracts"
              ? { ...link, href: "/contracts/approval" }
              : link
        )
      : customerLinks;

  function segmentActive(href: string) {
    const full = t(href);
    return pathname === full || pathname.startsWith(full + "/");
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  }

  return (
    <aside className="fixed inset-y-0 left-0 w-64 bg-white flex flex-col z-30 print:hidden border-r border-slate-200">
      <div className="px-5 py-5 border-b border-slate-200">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#002f93] flex items-center justify-center">
            <LayoutDashboard size={16} className="text-white" />
          </div>
          <div>
            <span className="text-slate-900 font-bold text-base tracking-tight">Medzah</span>
            <span className="ml-1.5 text-xs font-semibold text-slate-400 uppercase tracking-widest">
              CRM
            </span>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-5">
        <div>
          <NavItem
            href={dash}
            label="Dashboard"
            icon={LayoutDashboard}
            active={segmentActive("/dashboard")}
          />
        </div>

        <div>
          <p className="px-3 mb-1.5 text-xs font-semibold uppercase tracking-widest text-slate-400">
            Sales
          </p>
          <div className="space-y-0.5">
            {salesLinks.map((link) => (
              <NavItem
                key={link.href}
                href={t(link.href)}
                label={link.label}
                icon={link.icon}
                active={segmentActive(link.href)}
              />
            ))}
          </div>
        </div>

        <div>
          <p className="px-3 mb-1.5 text-xs font-semibold uppercase tracking-widest text-slate-400">
            Customer
          </p>
          <div className="space-y-0.5">
            {customerNavLinks.map((link) => (
              <NavItem
                key={link.href}
                href={t(link.href)}
                label={link.label}
                icon={link.icon}
                active={segmentActive(link.href)}
              />
            ))}
          </div>
        </div>
      </nav>

      <div className="border-t border-slate-200">
        <div className="mx-3 my-3 bg-slate-100 rounded-xl p-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#002f93] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {profile.initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-slate-900 truncate">{profile.name}</p>
              <p className="text-xs text-slate-500 truncate">{profile.title}</p>
            </div>
          </div>
        </div>

        <div className="px-3 pb-3 space-y-0.5">
          <NavItem
            href={settingsHref}
            label="Settings"
            icon={Settings}
            active={segmentActive("/settings")}
          />
          {tenant === "kevin" ? (
            <NavItem
              href={inboxHref}
              label="Sales Inbox"
              icon={Inbox}
              active={segmentActive("/inbox")}
            />
          ) : null}
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-500 hover:bg-slate-100 hover:text-red-500 rounded-lg transition-all duration-150 border-l-2 border-transparent pl-[10px]"
          >
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
