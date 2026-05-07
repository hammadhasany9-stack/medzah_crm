import { Megaphone } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";

export default function CampaignPage() {
  return (
    <div className="p-6 flex flex-col h-full">
      <EmptyState
        icon={Megaphone}
        title="Campaign"
        description="Campaign cards with performance metrics will appear here in Phase 2."
      />
    </div>
  );
}
