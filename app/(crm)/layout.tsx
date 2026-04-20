import { Sidebar } from "@/components/shell/Sidebar";
import { CRMClientShell } from "@/components/shell/CRMClientShell";

// Map pathname segments to human-readable titles
function getTitle(segment: string): string {
  const map: Record<string, string> = {
    leads: "Leads",
    opportunity: "Opportunity",
    quotes: "Quotes",
    "sales-orders": "Sales Orders",
    allocation: "Allocation",
    account: "Account",
    contact: "Contact",
    "customer-intake": "Customer Intake",
    documents: "Documents",
    contracts: "Contracts",
    campaign: "Campaign",
    dashboard: "Dashboard",
    settings: "Settings",
    inbox: "Sales Inbox",
  };
  return map[segment] ?? segment.charAt(0).toUpperCase() + segment.slice(1);
}

export default function CRMLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden">
      <Sidebar />
      <div className="flex-1 ml-64 flex flex-col overflow-hidden print:ml-0">
        <CRMClientShell>{children}</CRMClientShell>
      </div>
    </div>
  );
}
