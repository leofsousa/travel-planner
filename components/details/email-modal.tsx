// components/details/email-modal.tsx
"use client";

import { useState } from "react";
import EmailGenerator from "./email-generator";

interface EmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: {
    eventName: string;
    location: string;
    hotel: {
      name: string;
      address?: string;
      checkIn: string;
      checkOut: string;
      rooms: any[];
      nights: number;
      totalCost: number;
    };
    car: {
      hasRental: boolean;
      rentals: any[];
      totalCost: number;
    };
    flight: {
      hasFlight: boolean;
      departureDate: string;
      returnDate: string;
      observations: string;
    };
  };
  guestEmails?: string[];
  defaultRecipients?: string[];
}

export default function EmailModal({
  isOpen,
  onClose,
  data,
  guestEmails = [],
  defaultRecipients = [],
}: EmailModalProps) {
  const [activeTab, setActiveTab] = useState<"financeiro" | "colaborador">("financeiro");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[100]">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-xl">
        {/* Cabeçalho */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">📧 Emails da Reserva</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            ✕
          </button>
        </div>

        {/* Abas */}
        <div className="flex border-b border-gray-200 mb-4">
          <button
            onClick={() => setActiveTab("financeiro")}
            className={`px-4 py-2 text-sm font-medium transition-colors ${activeTab === "financeiro"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-500 hover:text-gray-700"
              }`}
          >
            💳 Financeiro
          </button>
          <button
            onClick={() => setActiveTab("colaborador")}
            className={`px-4 py-2 text-sm font-medium transition-colors ${activeTab === "colaborador"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-500 hover:text-gray-700"
              }`}
          >
            👤 Colaborador
          </button>
        </div>

        {/* Conteúdo das abas */}
        <div>
          {activeTab === "financeiro" && (
            <EmailGenerator
              type="financeiro"
              eventName={data.eventName}
              location={data.location}
              hotelName={data.hotel.name || "Hotel não informado"}
              hotelAddress={data.hotel.address}
              checkIn={data.hotel.checkIn}
              checkOut={data.hotel.checkOut}
              rooms={data.hotel.rooms || []}
              nights={data.hotel.nights || 0}
              totalCost={data.hotel.totalCost || 0}
              carData={data.car} // ← PASSA OS DADOS DO CARRO
              defaultRecipients={defaultRecipients}
            />
          )}

          {activeTab === "colaborador" && (
            <EmailGenerator
              type="colaborador"
              eventName={data.eventName}
              location={data.location}
              hotelName={data.hotel.name || "Hotel não informado"}
              hotelAddress={data.hotel.address}
              checkIn={data.hotel.checkIn}
              checkOut={data.hotel.checkOut}
              rooms={data.hotel.rooms || []}
              nights={data.hotel.nights || 0}
              totalCost={data.hotel.totalCost || 0}
              guestEmails={guestEmails}
            />
          )}
        </div>
      </div>
    </div>
  );
}