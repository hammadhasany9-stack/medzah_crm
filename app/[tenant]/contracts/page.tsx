import { notFound, redirect } from "next/navigation";
import { isTenant } from "@/lib/auth/constants";
import ContractsListPageClient from "./ContractsListPageClient";

export default async function ContractsPage({
  params,
}: {
  params: Promise<{ tenant: string }>;
}) {
  const { tenant } = await params;
  if (!isTenant(tenant)) notFound();
  if (tenant === "amanda") redirect(`/${tenant}/contracts/approval`);
  return <ContractsListPageClient />;
}
