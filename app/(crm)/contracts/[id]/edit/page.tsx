"use client";

import { ContractForm } from "@/components/contracts/ContractForm";

export default function ContractEditPage({ params }: { params: { id: string } }) {
  return <ContractForm contractId={params.id} />;
}
