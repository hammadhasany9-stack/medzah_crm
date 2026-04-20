import { FolderOpen } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";

export default function DocumentsPage() {
  return (
    <div className="p-6 flex flex-col h-full">
      <EmptyState
        icon={FolderOpen}
        title="Documents"
        description="File list with document preview will appear here in Phase 2."
      />
    </div>
  );
}
