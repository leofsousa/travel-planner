// components/details/email-generator.tsx
"use client";

import { useState } from "react";

interface DailyRate {
  date: string;
  value: number;
}

interface Room {
  id: string;
  type: "individual" | "duplo" | "triplo" | "quadruplo";
  guests: { id: string; name: string; document: string }[];
  dailyRates: DailyRate[];
  total: number;
}

interface EmailGeneratorProps {
  eventName: string;
  location: string;
  hotelName: string;
  checkIn: string;
  checkOut: string;
  rooms: Room[];
  nights: number;
  totalCost: number;
}

export default function EmailGenerator({
  eventName,
  location,
  hotelName,
  checkIn,
  checkOut,
  rooms,
  nights,
  totalCost,
}: EmailGeneratorProps) {
  const [copied, setCopied] = useState(false);

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("pt-BR");
  };

  const formatCurrency = (value: number) => {
    return `R$ ${value.toFixed(2)}`;
  };

 // components/details/email-generator.tsx (parte principal)

const generateEmailBody = () => {
  const roomTypes = {
    individual: "Individual",
    duplo: "Duplo",
    triplo: "Triplo",
    quadruplo: "Quadruplo",
  };

  const roomsSection = rooms
    .map((room) => {
      const guestsList = room.guests.map((g) => `    - ${g.name}`).join("\n");
      const periodsList = room.periods
        .map((p) => {
          const start = new Date(p.startDate);
          const end = new Date(p.endDate);
          const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
          return `    ${start.toLocaleDateString("pt-BR")} a ${end.toLocaleDateString("pt-BR")} - ${formatCurrency(p.dailyRate)}/diária (${days} dias)`;
        })
        .join("\n");

      return `Quarto ${roomTypes[room.type]}
  Hóspedes:
${guestsList}
  Períodos:
${periodsList}
  Total: ${formatCurrency(room.total)}`;
    })
    .join("\n\n");
  }
  const handleCopy = () => {
    navigator.clipboard.writeText(generateEmailBody());
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleOpenEmail = () => {
    const subject = `Reserva de Hotel - ${eventName}`;
    const body = encodeURIComponent(generateEmailBody());
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <button
          onClick={handleCopy}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm flex items-center gap-2"
        >
          📋 {copied ? "Copiado!" : "Copiar Email"}
        </button>
        <button
          onClick={handleOpenEmail}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm flex items-center gap-2"
        >
          📧 Abrir no Email
        </button>
      </div>

      <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Preview do Email:</h4>
        <pre className="text-sm text-gray-600 whitespace-pre-wrap font-sans">
          {generateEmailBody()}
        </pre>
      </div>
    </div>
  );
}