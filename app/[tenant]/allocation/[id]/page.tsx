import { redirect } from "next/navigation";

export default async function AllocationDetailPage({
  params,
}: {
  params: Promise<{ tenant: string; id: string }>;
}) {
  const { tenant } = await params;
  redirect(`/${tenant}/dashboard`);
}
