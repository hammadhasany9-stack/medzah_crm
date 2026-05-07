import { AmandaControlBoard } from "@/components/dashboard/AmandaControlBoard";
import { SalesPerformanceDashboard } from "@/components/dashboard/SalesPerformanceDashboard";

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ tenant: string }>;
}) {
  const { tenant } = await params;
  if (tenant === "amanda") {
    return (
      <div className="p-6 flex flex-col min-h-full">
        <AmandaControlBoard />
      </div>
    );
  }
  return (
    <div className="p-6 flex flex-col min-h-full">
      <SalesPerformanceDashboard />
    </div>
  );
}
