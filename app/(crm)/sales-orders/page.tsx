import { ShoppingCart } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";

export default function SalesOrdersPage() {
  return (
    <div className="p-6 flex flex-col h-full">
      <EmptyState
        icon={ShoppingCart}
        title="Sales Orders"
        description="Order list and table view will appear here in Phase 2."
      />
    </div>
  );
}
