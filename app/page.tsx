"use client";

import { useState, useEffect, useMemo } from "react";
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
  if (!dateString) return "Data não definida";
  if (dateString.includes("/")) return dateString;
  const parts = dateString.split("-");
  if (parts.length !== 3) return "Data inválida";
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
  
  // 🔍 Estados dos filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedService, setSelectedService] = useState("all");

  const loadRequests = async () => {
    try {
      const data = await getRequests();
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

  // 🔍 Aplicação dos filtros
  const filteredRequests = useMemo(() => {
    return requests.filter((request) => {
      // Filtro por texto (nome ou local)
      const matchesSearch = 
        request.event_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.location.toLowerCase().includes(searchTerm.toLowerCase());

      // Filtro por mês (data de início)
      let matchesMonth = true;
      if (selectedMonth) {
        const requestMonth = request.start_date?.substring(0, 7); // YYYY-MM
        matchesMonth = requestMonth === selectedMonth;
      }

      // Filtro por serviço
      let matchesService = true;
      if (selectedService !== "all") {
        const hasHotel = request.request_hotels?.enabled || false;
        const hasFlight = request.request_flights?.enabled || false;
        const hasCar = request.request_cars?.enabled || false;
        
        if (selectedService === "hotel") matchesService = hasHotel;
        else if (selectedService === "flight") matchesService = hasFlight;
        else if (selectedService === "car") matchesService = hasCar;
      }

      return matchesSearch && matchesMonth && matchesService;
    });
  }, [requests, searchTerm, selectedMonth, selectedService]);

  // Gera lista de meses disponíveis para o filtro
  const availableMonths = useMemo(() => {
    const months = new Set<string>();
    requests.forEach((r) => {
      if (r.start_date) {
        months.add(r.start_date.substring(0, 7));
      }
    });
    return Array.from(months).sort();
  }, [requests]);

  // Agrupa por status (já com os filtros aplicados)
  const pending = filteredRequests
    .filter((r) => r.status === "pending")
    .map((r) => ({
      ...r,
      start_date: formatDate(r.start_date),
      end_date: formatDate(r.end_date),
    }));

  const inProgress = filteredRequests
    .filter((r) => r.status === "in_progress")
    .map((r) => ({
      ...r,
      start_date: formatDate(r.start_date),
      end_date: formatDate(r.end_date),
    }));

  const completed = filteredRequests
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
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            📊 Dashboard de Viagens
          </h1>
          <Link
            href="/requests/new"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium whitespace-nowrap"
          >
            + Nova Solicitação
          </Link>
        </div>

        {/* 🔍 Barra de Filtros */}
        <div className="bg-white rounded-lg shadow-lg p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Busca por texto */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                🔍 Buscar
              </label>
              <input
                type="text"
                placeholder="Nome do evento ou local..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>

            {/* Filtro por mês */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                📅 Mês
              </label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              >
                <option value="">Todos os meses</option>
                {availableMonths.map((month) => (
                  <option key={month} value={month}>
                    {new Date(month + "-01").toLocaleDateString("pt-BR", {
                      month: "long",
                      year: "numeric",
                    })}
                  </option>
                ))}
              </select>
            </div>

            {/* Filtro por serviço */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                🏷️ Serviço
              </label>
              <select
                value={selectedService}
                onChange={(e) => setSelectedService(e.target.value)}
                className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              >
                <option value="all">Todos</option>
                <option value="hotel">🏨 Hotel</option>
                <option value="flight">✈️ Passagem</option>
                <option value="car">🚗 Carro</option>
              </select>
            </div>
          </div>

          {/* Contadores e botão de limpar */}
          <div className="flex flex-wrap justify-between items-center mt-4 pt-4 border-t border-gray-100">
            <div className="flex flex-wrap gap-4 text-sm">
              <span className="text-gray-600">
                📋 Total: <strong>{filteredRequests.length}</strong>
              </span>
              <span className="text-yellow-600">
                📋 A Fazer: <strong>{pending.length}</strong>
              </span>
              <span className="text-blue-600">
                ⏳ Em Andamento: <strong>{inProgress.length}</strong>
              </span>
              <span className="text-green-600">
                ✅ Concluídas: <strong>{completed.length}</strong>
              </span>
            </div>
            <button
              onClick={() => {
                setSearchTerm("");
                setSelectedMonth("");
                setSelectedService("all");
              }}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Limpar filtros
            </button>
          </div>
        </div>

        {/* Colunas do Dashboard */}
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