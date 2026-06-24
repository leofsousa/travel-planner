// components/delete-button.tsx
"use client";

import { useRouter } from "next/navigation";
import { deleteRequest } from "@/lib/services/request-service";

interface DeleteButtonProps {
  requestId: string;
  requestName: string;
}

export default function DeleteButton({ requestId, requestName }: DeleteButtonProps) {
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm(`Tem certeza que deseja excluir a solicitação "${requestName}"?\n\nEsta ação não pode ser desfeita.`)) {
      return;
    }

    try {
      await deleteRequest(requestId);
      router.push("/");
      router.refresh();
    } catch (error) {
      alert(error instanceof Error ? error.message : "Erro ao excluir solicitação");
    }
  };

  return (
    <button
      onClick={handleDelete}
      className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
    >
      🗑️ Excluir Solicitação
    </button>
  );
}