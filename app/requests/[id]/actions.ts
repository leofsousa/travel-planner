// app/requests/[id]/actions.ts
"use server";

import { updateRequestStatus } from "@/lib/services/request-service";
import { redirect } from "next/navigation";

export async function updateStatus(formData: FormData, requestId: string) {
  const status = formData.get("status") as "pending" | "in_progress" | "completed";
  await updateRequestStatus(requestId, status);
  redirect(`/requests/${requestId}`);
}