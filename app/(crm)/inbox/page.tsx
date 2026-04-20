import { Inbox } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";

export default function InboxPage() {
  return (
    <div className="p-6 flex flex-col h-full">
      <EmptyState
        icon={Inbox}
        title="Sales Inbox"
        description="Notification and email inbox panel will appear here in Phase 2."
      />
    </div>
  );
}
