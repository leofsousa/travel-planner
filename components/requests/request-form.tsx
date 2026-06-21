"use client";

import { useState } from "react";
import Input from "@/components/ui/input";
import HotelSection from "@/components/requests/sections/hotel-section";

export default function RequestForm() {
  function removeGuest(id: string) {
    setRequest((prev) => ({
      ...prev,
      hotel: {
        ...prev.hotel,
        guests: prev.hotel.guests.filter(
          (g) => g.id !== id
        ),
      },
    }));
  }

  function addGuest() {
    if (!guestName.trim()) return;

    const newGuest = {
      id: crypto.randomUUID(),
      name: guestName,
      document: guestDocument,
    };

    setRequest((prev) => ({
      ...prev,
      hotel: {
        ...prev.hotel,
        guests: [...prev.hotel.guests, newGuest],
      },
    }));

    setGuestName("");
    setGuestDocument("");
  }

  const [guestName, setGuestName] = useState("");
  const [guestDocument, setGuestDocument] = useState('');
  const [request, setRequest] = useState({
    eventName: "",
    local: "",
    startDate: "",
    endDate: "",

    hotel: {
      enabled: false,
      guests: [] as { id: string; name: string; document: string }[],
      observations: "",
    },

    flight: {
      enabled: false,
    },

    car: {
      enabled: false,
    },
  });

  function toggleService(service: "hotel" | "car" | "flight") {
    setRequest((prev) => ({
      ...prev,
      [service]: {
        ...prev[service],
        enabled: !prev[service].enabled,
      },
    }));
  }

  return (
    <div className="max-w-3xl mx-auto bg-white p-6 rounded-xl shadow flex flex-col gap-6">

      <h1 className="text-2xl font-bold">
        Nova Solicitação
      </h1>

      {/* DADOS GERAIS */}
      <Input
        label="Nome do Evento"
        value={request.eventName}
        onChange={(e) =>
          setRequest({ ...request, eventName: e.target.value })
        }
      />

      <Input
        label="Local"
        value={request.local}
        onChange={(e) =>
          setRequest({ ...request, local: e.target.value })
        }
      />

      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Data Início"
          type="date"
          value={request.startDate}
          onChange={(e) =>
            setRequest({ ...request, startDate: e.target.value })
          }
        />

        <Input
          label="Data Retorno"
          type="date"
          value={request.endDate}
          onChange={(e) =>
            setRequest({ ...request, endDate: e.target.value })
          }
        />
      </div>

      {/* SERVIÇOS */}
      <div className="border rounded-lg p-4 space-y-3">
        <h2 className="font-semibold">
          Serviços solicitados
        </h2>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={request.hotel.enabled}
            onChange={() => toggleService("hotel")}
          />
          Hotel
        </label>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={request.car.enabled}
            onChange={() => toggleService("car")}
          />
          Locação de Carro
        </label>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={request.flight.enabled}
            onChange={() => toggleService("flight")}
          />
          Passagem
        </label>
      </div>

      {/* HOTEL SECTION */}
      {request.hotel.enabled && (
        <HotelSection
          guests={request.hotel.guests}
          observations={request.hotel.observations}
          guestName={guestName}
          guestDocument={guestDocument}
          setGuestName={setGuestName}
          setGuestDocument={setGuestDocument}
          onAddGuest={addGuest}
          onRemoveGuest={removeGuest}
        />
      )}
    </div>
  );
}