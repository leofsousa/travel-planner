// components/details/flight-leg-card.tsx
"use client";

import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface FlightLeg {
  id: string;
  origin: string;
  destination: string;
  departureDate: string;
  departureTime: string;
  arrivalDate: string;
  arrivalTime: string;
  airline: string;
  flightNumber: string;
  observations: string;
}

interface FlightLegCardProps {
  leg: FlightLeg;
  onEdit: () => void;
  onRemove: () => void;
}

export default function FlightLegCard({ leg, onEdit, onRemove }: FlightLegCardProps) {
  const formatDate = (date: string) => {
    if (!date) return "Data não definida";
    const parts = date.split("-");
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return date;
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
      <div className="flex justify-between items-start">
        <div>
          <h4 className="font-medium text-gray-900">
            {leg.origin} → {leg.destination}
          </h4>
          {leg.airline && (
            <p className="text-sm text-gray-600">
              {leg.airline} {leg.flightNumber && `- ${leg.flightNumber}`}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <button onClick={onEdit} className="text-blue-600 hover:text-blue-800 text-sm">
            Editar
          </button>
          <button onClick={onRemove} className="text-red-600 hover:text-red-800 text-sm">
            Remover
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 mt-2 text-sm text-gray-600">
        <div>
          <span className="font-medium">Saída:</span> {formatDate(leg.departureDate)}
          {leg.departureTime && ` às ${leg.departureTime}`}
        </div>
        <div>
          <span className="font-medium">Chegada:</span> {formatDate(leg.arrivalDate)}
          {leg.arrivalTime && ` às ${leg.arrivalTime}`}
        </div>
      </div>

      {leg.observations && (
        <p className="text-sm text-gray-500 mt-2 border-t border-gray-100 pt-2">
          📝 {leg.observations}
        </p>
      )}
    </div>
  );
}