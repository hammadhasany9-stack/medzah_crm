"use client";

import { usePathname } from "next/navigation";
import { CRMShellProvider } from "./CRMShellContext";
import { TopNavBar } from "./TopNavBar";

interface PageConfig {
  title: string;
  myTabLabel: string;
  createLabel: string;
  createHref: string;
  searchPlaceholder: string;
  showTabs?: boolean;
  showSearch?: boolean;
  showCreate?: boolean;
}

function getPageConfig(pathname: string): PageConfig {
  if (pathname.startsWith("/allocation")) {
    return {
      title: "Allocation",
      myTabLabel: "My Allocations",
      createLabel: "Create Allocation",
      createHref: "/allocation/create",
      searchPlaceholder: "Search allocations...",
      showTabs: false,
      showSearch: false,
      showCreate: false,
    };
  }
  if (pathname.startsWith("/opportunity")) {
    return {
      title: "Opportunity",
      myTabLabel: "My Opportunities",
      createLabel: "Create Opportunity",
      createHref: "/opportunity/create",
      searchPlaceholder: "Search opportunities, companies, or tasks...",
    };
  }
  if (pathname.startsWith("/quotes")) {
    return {
      title: "Quote",
      myTabLabel: "My Quotes",
      createLabel: "Create Quote",
      createHref: "/quotes/create",
      searchPlaceholder: "Search quotes, companies, or contacts...",
    };
  }
  if (pathname.startsWith("/account")) {
    return {
      title: "Accounts",
      myTabLabel: "My Accounts",
      createLabel: "Create Account",
      createHref: "/account/create",
      searchPlaceholder: "Search accounts...",
      showTabs: false,
      showSearch: false,
    };
  }
  if (pathname.startsWith("/contact")) {
    return {
      title: "Contacts",
      myTabLabel: "My Contacts",
      createLabel: "Create Contact",
      createHref: "/contact/create",
      searchPlaceholder: "Search contacts...",
      showTabs: false,
      showSearch: false,
    };
  }
  if (pathname.startsWith("/customer-intake/approval")) {
    return {
      title: "Customer Intake Approvals",
      myTabLabel: "My Intake",
      createLabel: "Create Form",
      createHref: "/customer-intake/create",
      searchPlaceholder: "Search customer intake...",
      showTabs: false,
      showSearch: false,
    };
  }
  if (pathname.startsWith("/customer-intake")) {
    return {
      title: "Customer Intake",
      myTabLabel: "My Intake",
      createLabel: "Create Form",
      createHref: "/customer-intake/create",
      searchPlaceholder: "Search customer intake...",
      showTabs: false,
      showSearch: false,
    };
  }
  if (pathname.startsWith("/documents")) {
    return {
      title: "Documents",
      myTabLabel: "Documents",
      createLabel: "Upload",
      createHref: "/documents",
      searchPlaceholder: "Search documents...",
      showTabs: false,
      showSearch: false,
      showCreate: false,
    };
  }
  if (pathname === "/contracts") {
    return {
      title: "Contracts",
      myTabLabel: "Contracts",
      createLabel: "New contract",
      createHref: "/contracts/create",
      searchPlaceholder: "Search contracts...",
      showTabs: false,
      showSearch: false,
      showCreate: true,
    };
  }
  if (pathname.startsWith("/contracts/approval")) {
    return {
      title: "Contract approval",
      myTabLabel: "Contracts",
      createLabel: "New contract",
      createHref: "/contracts/create",
      searchPlaceholder: "Search contracts...",
      showTabs: false,
      showSearch: false,
      showCreate: true,
    };
  }
  if (pathname.startsWith("/contracts/create")) {
    return {
      title: "Create contract",
      myTabLabel: "Contracts",
      createLabel: "New contract",
      createHref: "/contracts/create",
      searchPlaceholder: "Search contracts...",
      showTabs: false,
      showSearch: false,
      showCreate: false,
    };
  }
  if (pathname.includes("/edit") && pathname.startsWith("/contracts/")) {
    return {
      title: "Edit contract",
      myTabLabel: "Contracts",
      createLabel: "New contract",
      createHref: "/contracts/create",
      searchPlaceholder: "Search contracts...",
      showTabs: false,
      showSearch: false,
      showCreate: false,
    };
  }
  if (pathname.startsWith("/contracts/")) {
    return {
      title: "Contract",
      myTabLabel: "Contracts",
      createLabel: "New contract",
      createHref: "/contracts/create",
      searchPlaceholder: "Search contracts...",
      showTabs: false,
      showSearch: false,
      showCreate: true,
    };
  }
  return {
    title: "Leads",
    myTabLabel: "My Leads",
    createLabel: "Create Lead",
    createHref: "/leads/create",
    searchPlaceholder: "Search leads, companies, or tasks...",
  };
}

export function CRMClientShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const config = getPageConfig(pathname);

  return (
    <CRMShellProvider>
      <TopNavBar
        title={config.title}
        myTabLabel={config.myTabLabel}
        createLabel={config.createLabel}
        createHref={config.createHref}
        searchPlaceholder={config.searchPlaceholder}
        showTabs={config.showTabs}
        showSearch={config.showSearch}
        showCreate={config.showCreate}
      />
      <main className="flex-1 overflow-y-auto bg-slate-100">{children}</main>
    </CRMShellProvider>
  );
}
