// components/requests/sections/flight-section.tsx
"use client";

import Input from "@/components/ui/input";

interface FlightSectionProps {
  enabled: boolean;
  departureDate: string;
  returnDate: string;
  observations: string;
  onDepartureDateChange: (value: string) => void;
  onReturnDateChange: (value: string) => void;
  onObservationsChange: (value: string) => void;
}

export default function FlightSection({
  enabled,
  departureDate,
  returnDate,
  observations,
  onDepartureDateChange,
  onReturnDateChange,
  onObservationsChange,
}: FlightSectionProps) {
  if (!enabled) return null;

  return (
    <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-4 space-y-4">
      <h2 className="text-lg font-semibold text-gray-900">✈️ Passagem Aérea/Ônibus</h2>

      {/* Datas */}
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Data de saída"
          type="date"
          value={departureDate}
          onChange={(e) => onDepartureDateChange(e.target.value)}
          className="bg-white text-gray-900"
        />
        <Input
          label="Data de retorno"
          type="date"
          value={returnDate}
          onChange={(e) => onReturnDateChange(e.target.value)}
          className="bg-white text-gray-900"
        />
      </div>

      {/* Observações */}
      <div>
        <label htmlFor="flight-observations" className="block text-sm font-medium text-gray-700 mb-1">
          Observações da passagem
        </label>
        <textarea
          id="flight-observations"
          className="resize-none w-full rounded border border-gray-300 bg-white p-2 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          placeholder="Ex: prefiro horário da manhã, aeroporto de sáida, aeroporto para retorno, etc"
          value={observations}
          onChange={(e) => onObservationsChange(e.target.value)}
          rows={3}
        />
      </div>
    </div>
  );
}