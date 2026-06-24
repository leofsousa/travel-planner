// app/components/dashboard/request-card.tsx
"use client";

import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import Link from "next/link";

interface RequestCardProps {
  request: {
    id: string;
    event_name: string;
    location: string;
    start_date: string;
    end_date: string;
    status: "pending" | "in_progress" | "completed";
    request_hotels: any;
    request_flights: any;
    request_cars: any;
  };
}

// 🔥 CORREÇÃO: Função de formatação robusta
function formatDate(dateString: string | null | undefined) {
  if (!dateString) return "Data não informada";
  if (dateString === "invalid") return "Data inválida";
  
  // Se já estiver no formato DD/MM/YYYY, retorna
  if (dateString.includes("/")) return dateString;
  
  // Tenta converter do formato ISO (YYYY-MM-DD)
  const parts = dateString.split("-");
  if (parts.length === 3) {
    const year = parts[0];
    const month = parts[1];
    const day = parts[2];
    
    // Verifica se são números válidos
    if (!isNaN(Number(year)) && !isNaN(Number(month)) && !isNaN(Number(day))) {
      return `${day}/${month}/${year}`;
    }
  }
  
  return dateString; // Retorna a string original se não conseguir formatar
}

function ServiceBadge({ enabled, label }: { enabled: boolean; label: string }) {
  if (!enabled) return null;
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
      {label}
    </span>
  );
}

export default function RequestCard({ request }: RequestCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: request.id,
    data: {
      status: request.status,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    opacity: isDragging ? 0.4 : 1,
  };

  const hasHotel = request.request_hotels?.enabled || false;
  const hasFlight = request.request_flights?.enabled || false;
  const hasCar = request.request_cars?.enabled || false;

  // 🔥 CORREÇÃO: Formata as datas antes de exibir
  const startDate = formatDate(request.start_date);
  const endDate = formatDate(request.end_date);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow ${
        isDragging ? "shadow-2xl" : ""
      }`}
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-lg font-semibold text-gray-900 truncate">
          {request.event_name}
        </h3>
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-100 transition-colors"
          title="Arraste para mover"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="9" cy="12" r="1" />
            <circle cx="9" cy="5" r="1" />
            <circle cx="9" cy="19" r="1" />
            <circle cx="15" cy="12" r="1" />
            <circle cx="15" cy="5" r="1" />
            <circle cx="15" cy="19" r="1" />
          </svg>
        </div>
      </div>

      <p className="text-sm text-gray-600 mb-1">📍 {request.location}</p>
      <p className="text-sm text-gray-500">
        📅 {startDate} - {endDate}
      </p>

      <div className="flex flex-wrap gap-1 mt-3">
        <ServiceBadge enabled={hasHotel} label="🏨 Hotel" />
        <ServiceBadge enabled={hasFlight} label="✈️ Passagem" />
        <ServiceBadge enabled={hasCar} label="🚗 Carro" />
      </div>

      <div className="mt-3 pt-3 border-t border-gray-100">
        <Link
          href={`/requests/${request.id}`}
          className="text-sm text-blue-600 hover:text-blue-800 font-medium"
        >
          Ver detalhes →
        </Link>
      </div>
    </div>
  );
}