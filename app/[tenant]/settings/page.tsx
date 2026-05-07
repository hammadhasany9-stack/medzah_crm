import { Settings } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";

export default function SettingsPage() {
  return (
    <div className="p-6 flex flex-col h-full">
      <EmptyState
        icon={Settings}
        title="Settings"
        description="User and organisation settings form will appear here in Phase 2."
      />
    </div>
  );
}
