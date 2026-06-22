// components/requests/request-form.tsx
"use client";

import { useState } from "react";
import Input from "@/components/ui/input";
import HotelSection from "./sections/hotel-section";

interface Request {
  eventName: string;
  local: string;
  startDate: string;
  endDate: string;
  hotel: {
    enabled: boolean;
    guests: {
      id: string;
      name: string;
      document: string;
    }[];
    observations: string;
  };
  flight: { enabled: boolean };
  car: { enabled: boolean };
}

export default function RequestForm() {
  const [request, setRequest] = useState<Request>({
    eventName: "",
    local: "",
    startDate: "",
    endDate: "",
    hotel: {
      enabled: false,
      guests: [],
      observations: "",
    },
    flight: { enabled: false },
    car: { enabled: false },
  });

  const toggleHotel = (checked: boolean) => {
    setRequest((prev) => ({
      ...prev,
      hotel: { ...prev.hotel, enabled: checked },
    }));
  };

  const toggleFlight = (checked: boolean) => {
    setRequest((prev) => ({
      ...prev,
      flight: { enabled: checked },
    }));
  };

  const toggleCar = (checked: boolean) => {
    setRequest((prev) => ({
      ...prev,
      car: { enabled: checked },
    }));
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <form className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-6 space-y-6">
        <h2 className="text-2xl font-bold text-gray-900">
          Nova Solicitação de Viagem
        </h2>

        {/* DADOS BÁSICOS */}
        <div className="space-y-4">
          <Input
            label="Nome do Evento"
            value={request.eventName}
            onChange={(e) =>
              setRequest((prev) => ({ ...prev, eventName: e.target.value }))
            }
            placeholder="Ex: Conferência de Tecnologia 2026"
            className="text-gray-900"
          />

          <Input
            label="Local"
            value={request.local}
            onChange={(e) =>
              setRequest((prev) => ({ ...prev, local: e.target.value }))
            }
            placeholder="Ex: São Paulo - SP"
            className="text-gray-900"
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Data Início"
              type="date"
              value={request.startDate}
              onChange={(e) =>
                setRequest((prev) => ({ ...prev, startDate: e.target.value }))
              }
              className="text-gray-900"
            />
            <Input
              label="Data Fim"
              type="date"
              value={request.endDate}
              onChange={(e) =>
                setRequest((prev) => ({ ...prev, endDate: e.target.value }))
              }
              className="text-gray-900"
            />
          </div>
        </div>

        {/* SERVIÇOS */}
        <div className="space-y-4">
          <h3 className="font-medium text-gray-900">Serviços</h3>

          {/* HOTEL TOGGLE */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="hotel"
              checked={request.hotel.enabled}
              onChange={(e) => toggleHotel(e.target.checked)}
              className="w-4 h-4 text-blue-600"
            />
            <label htmlFor="hotel" className="text-sm font-medium text-gray-900">
              Hotel
            </label>
          </div>

          {/* HOTEL SECTION - só aparece se habilitado */}
          {request.hotel.enabled && (
            <HotelSection
              guests={request.hotel.guests}
              observations={request.hotel.observations}
              onGuestsChange={(guests) =>
                setRequest((prev) => ({
                  ...prev,
                  hotel: { ...prev.hotel, guests },
                }))
              }
              onObservationsChange={(observations) =>
                setRequest((prev) => ({
                  ...prev,
                  hotel: { ...prev.hotel, observations },
                }))
              }
            />
          )}

          {/* FLIGHT */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="flight"
              checked={request.flight.enabled}
              onChange={(e) => toggleFlight(e.target.checked)}
              className="w-4 h-4 text-blue-600"
            />
            <label htmlFor="flight" className="text-sm font-medium text-gray-900">
              Passagem (Aérea/Ônibus)
            </label>
          </div>

          {/* CAR */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="car"
              checked={request.car.enabled}
              onChange={(e) => toggleCar(e.target.checked)}
              className="w-4 h-4 text-blue-600"
            />
            <label htmlFor="car" className="text-sm font-medium text-gray-900">
              Carro
            </label>
          </div>
        </div>

        {/* BOTÃO SUBMIT */}
        <button
          type="button"
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          onClick={() => console.log("Request:", request)}
        >
          Salvar Solicitação
        </button>
      </form>
    </div>
  );
}