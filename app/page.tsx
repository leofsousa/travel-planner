// app/page.tsx
"use client";

import { useState, useEffect } from "react";
import { DndContext, DragEndEvent, closestCorners } from "@dnd-kit/core";
import Link from "next/link";
import { getRequests, updateRequestStatus } from "@/lib/services/request-service";
import Column from "@/components/dashboard/column";

interface Request {
  id: string;
  event_name: string;
  location: string;
  start_date: string;
  end_date: string;
  status: "pending" | "in_progress" | "completed";
  request_hotels: any;
  request_flights: any;
  request_cars: any;
}

function formatDate(dateString: string | null | undefined) {
  if (!dateString) {
    return "Data não definida";
  }

  if (dateString.includes("/")) {
    return dateString;
  }

  const parts = dateString.split("-");
  if (parts.length !== 3) {
    console.warn("Formato de data inválido:", dateString);
    return "Data inválida";
  }

  const year = parts[0];
  const month = parts[1];
  const day = parts[2];

  if (isNaN(Number(year)) || isNaN(Number(month)) || isNaN(Number(day))) {
    return "Data inválida";
  }

  return `${day}/${month}/${year}`;
}

export default function DashboardPage() {
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);

  const loadRequests = async () => {
    try {
      const data = await getRequests();
      console.log("🔍 Dados brutos:", data);
  
      // 🔥 LOG DETALHADO: Mostra apenas as datas de cada solicitação
      data.forEach((r: any, index: number) => {
        console.log(`📅 Solicitação ${index + 1}:`, {
          id: r.id,
          event_name: r.event_name,
          start_date: r.start_date,
          end_date: r.end_date,
          tipo_start: typeof r.start_date,
          tipo_end: typeof r.end_date,
        });
      });
  
      setRequests(data);
    } catch (error) {
      console.error("Erro ao carregar solicitações:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) return;

    const requestId = active.id as string;
    const newStatus = over.id as "pending" | "in_progress" | "completed";

    const request = requests.find((r) => r.id === requestId);
    if (!request || request.status === newStatus) return;

    try {
      await updateRequestStatus(requestId, newStatus);

      setRequests((prev) =>
        prev.map((r) =>
          r.id === requestId ? { ...r, status: newStatus } : r
        )
      );
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
      alert("Erro ao mover solicitação");
    }
  };

  const pending = requests
  .filter((r) => r.status === "pending")
  .map((r) => ({
    ...r,
    start_date: formatDate(r.start_date), // ← Formata corretamente
    end_date: formatDate(r.end_date),     // ← Formata corretamente
  }));

  const inProgress = requests
    .filter((r) => r.status === "in_progress")
    .map((r) => ({
      ...r,
      start_date: formatDate(r.start_date),
      end_date: formatDate(r.end_date),
    }));

  const completed = requests
    .filter((r) => r.status === "completed")
    .map((r) => ({
      ...r,
      start_date: formatDate(r.start_date),
      end_date: formatDate(r.end_date),
    }));

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-4 flex items-center justify-center">
        <p className="text-gray-500">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            📊 Dashboard de Viagens
          </h1>
          <Link
            href="/requests/new"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            + Nova Solicitação
          </Link>
        </div>

        <DndContext collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
          <div className="flex flex-col md:flex-row gap-6">
            <Column
              id="pending-column"
              title="📋 A Fazer"
              status="pending"
              requests={pending}
              count={pending.length}
            />
            <Column
              id="in-progress-column"
              title="⏳ Em Andamento"
              status="in_progress"
              requests={inProgress}
              count={inProgress.length}
            />
            <Column
              id="completed-column"
              title="✅ Concluídas"
              status="completed"
              requests={completed}
              count={completed.length}
            />
          </div>
        </DndContext>
      </div>
    </div>
  );
}