"use client";

import { useParams } from "next/navigation";
import { ContractForm } from "@/components/contracts/ContractForm";

export default function ContractEditPage() {
  const params = useParams();
  const id = params.id as string;
  return <ContractForm contractId={id} />;
}
