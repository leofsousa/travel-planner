// components/details/flight-leg-modal.tsx
"use client";

import { useState, useEffect } from "react";

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

interface FlightLegModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (legData: Omit<FlightLeg, "id">) => void;
  editingLeg: FlightLeg | null;
  startDate: string;
  endDate: string;
}

export default function FlightLegModal({
  isOpen,
  onClose,
  onSave,
  editingLeg,
  startDate,
  endDate,
}: FlightLegModalProps) {
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [departureDate, setDepartureDate] = useState(startDate || "");
  const [departureTime, setDepartureTime] = useState("");
  const [arrivalDate, setArrivalDate] = useState(endDate || "");
  const [arrivalTime, setArrivalTime] = useState("");
  const [airline, setAirline] = useState("");
  const [flightNumber, setFlightNumber] = useState("");
  const [observations, setObservations] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (editingLeg) {
      setOrigin(editingLeg.origin);
      setDestination(editingLeg.destination);
      setDepartureDate(editingLeg.departureDate);
      setDepartureTime(editingLeg.departureTime || "");
      setArrivalDate(editingLeg.arrivalDate);
      setArrivalTime(editingLeg.arrivalTime || "");
      setAirline(editingLeg.airline || "");
      setFlightNumber(editingLeg.flightNumber || "");
      setObservations(editingLeg.observations || "");
    } else {
      setOrigin("");
      setDestination("");
      setDepartureDate(startDate || "");
      setDepartureTime("");
      setArrivalDate(endDate || "");
      setArrivalTime("");
      setAirline("");
      setFlightNumber("");
      setObservations("");
    }
    setError("");
  }, [editingLeg, startDate, endDate]);

  const handleSubmit = () => {
    if (!origin.trim() || !destination.trim()) {
      setError("Preencha origem e destino");
      return;
    }

    if (!departureDate || !arrivalDate) {
      setError("Preencha as datas de saída e chegada");
      return;
    }

    onSave({
      origin: origin.trim(),
      destination: destination.trim(),
      departureDate,
      departureTime,
      arrivalDate,
      arrivalTime,
      airline: airline.trim(),
      flightNumber: flightNumber.trim(),
      observations: observations.trim(),
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full p-6 shadow-xl">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          {editingLeg ? "✏️ Editar Trecho" : "➕ Adicionar Trecho"}
        </h2>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Origem *</label>
            <input
              type="text"
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
              placeholder="Ex: São Paulo (GRU)"
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Destino *</label>
            <input
              type="text"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="Ex: Rio de Janeiro (GIG)"
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Data de Saída *</label>
            <input
              type="date"
              value={departureDate}
              onChange={(e) => setDepartureDate(e.target.value)}
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Hora de Saída</label>
            <input
              type="time"
              value={departureTime}
              onChange={(e) => setDepartureTime(e.target.value)}
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Data de Chegada *</label>
            <input
              type="date"
              value={arrivalDate}
              onChange={(e) => setArrivalDate(e.target.value)}
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Hora de Chegada</label>
            <input
              type="time"
              value={arrivalTime}
              onChange={(e) => setArrivalTime(e.target.value)}
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cia. Aérea</label>
            <input
              type="text"
              value={airline}
              onChange={(e) => setAirline(e.target.value)}
              placeholder="Ex: LATAM"
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Número do Voo</label>
            <input
              type="text"
              value={flightNumber}
              onChange={(e) => setFlightNumber(e.target.value)}
              placeholder="Ex: LA 3352"
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Observações</label>
          <textarea
            value={observations}
            onChange={(e) => setObservations(e.target.value)}
            placeholder="Ex: Prefiro corredor, refeição especial..."
            className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none"
            rows={2}
          />
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 p-2 rounded border border-red-200 mt-4">
            ⚠️ {error}
          </p>
        )}

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            {editingLeg ? "Atualizar" : "Adicionar"}
          </button>
        </div>
      </div>
    </div>
  );
}