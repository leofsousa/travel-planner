// app/components/dashboard/column.tsx
"use client";

import { useDroppable } from "@dnd-kit/core";
import RequestCard from "./request-card";

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

interface ColumnProps {
  id: string;
  title: string;
  requests: Request[];
  status: string;
  count: number;
}

export default function Column({ id, title, requests, status, count }: ColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: status,
  });

  return (
    <div
      ref={setNodeRef}
      className={`flex-1 min-w-[280px] transition-colors ${
        isOver ? "bg-gray-200 rounded-lg" : ""
      }`}
    >
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