import { LayoutDashboard } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";

export default function DashboardPage() {
  return (
    <div className="p-6 flex flex-col h-full">
      <EmptyState
        icon={LayoutDashboard}
        title="Dashboard"
        description="KPI cards, pipeline charts, and recent activity feed will appear here in Phase 2."
      />
    </div>
  );
}
