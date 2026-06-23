// app/page.tsx
import { getRequests } from "@/lib/services/request-service";
import Link from "next/link";

interface ServiceBadgeProps {
  enabled: boolean;
  label: string;
}

function ServiceBadge({ enabled, label }: ServiceBadgeProps) {
  if (!enabled) return null;
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
      {label}
    </span>
  );
}

interface RequestCardProps {
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

function RequestCard({ request }: { request: RequestCardProps }) {
  const hasHotel = request.request_hotels?.enabled || false;
  const hasFlight = request.request_flights?.enabled || false;
  const hasCar = request.request_cars?.enabled || false;

  const statusColors = {
    pending: "bg-yellow-100 text-yellow-800",
    in_progress: "bg-blue-100 text-blue-800",
    completed: "bg-green-100 text-green-800",
  };

  const statusLabels = {
    pending: "📋 A Fazer",
    in_progress: "⏳ Em Andamento",
    completed: "✅ Concluída",
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("pt-BR");
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-lg font-semibold text-gray-900 truncate">
          {request.event_name}
        </h3>
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            statusColors[request.status]
          }`}
        >
          {statusLabels[request.status]}
        </span>
      </div>

      <p className="text-sm text-gray-600 mb-1">📍 {request.location}</p>
      <p className="text-sm text-gray-500">
        📅 {formatDate(request.start_date)} - {formatDate(request.end_date)}
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

interface ColumnProps {
  title: string;
  status: "pending" | "in_progress" | "completed";
  requests: RequestCardProps[];
  count: number;
}

function Column({ title, status, requests, count }: ColumnProps) {
  return (
    <div className="flex-1 min-w-[280px]">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold text-gray-700">{title}</h2>
        <span className="bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full text-sm">
          {count}
        </span>
      </div>
      <div className="space-y-3">
        {requests.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-8">
            Nenhuma solicitação
          </p>
        ) : (
          requests.map((request) => (
            <RequestCard key={request.id} request={request} />
          ))
        )}
      </div>
    </div>
  );
}

export default async function DashboardPage() {
  const requests = await getRequests();

  const pending = requests.filter((r) => r.status === "pending");
  const inProgress = requests.filter((r) => r.status === "in_progress");
  const completed = requests.filter((r) => r.status === "completed");

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

        <div className="flex flex-col md:flex-row gap-6">
          <Column
            title="📋 A Fazer"
            status="pending"
            requests={pending}
            count={pending.length}
          />
          <Column
            title="⏳ Em Andamento"
            status="in_progress"
            requests={inProgress}
            count={inProgress.length}
          />
          <Column
            title="✅ Concluídas"
            status="completed"
            requests={completed}
            count={completed.length}
          />
        </div>
      </div>
    </div>
  );
}