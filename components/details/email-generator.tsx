// app/requests/[id]/components/email-generator.tsx
"use client";

import { useState } from "react";

interface Room {
  id: string;
  type: "individual" | "duplo" | "triplo" | "quadruplo";
  guests: { id: string; name: string; document: string }[];
  dailyRate: number;
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

  const generateEmailBody = () => {
    const roomTypes = {
      individual: "Individual",
      duplo: "Duplo",
      triplo: "Triplo",
      quadruplo: "Quadruplo",
    };

    let roomsSection = rooms
      .map((room) => {
        const guestsList = room.guests.map((g) => `    - ${g.name}`).join("\n");
        return `Quarto ${roomTypes[room.type]}
  Hóspedes:
${guestsList}
  Valor da diária: ${formatCurrency(room.dailyRate)}
  Total: ${formatCurrency(room.total)} (${nights} diárias)`;
      })
      .join("\n\n");

    return `Olá, tudo bem?

Segue informações das reservas de hotel realizadas para o evento 
"${eventName}", na cidade ${location}.

Hotel: ${hotelName}
Check-in: ${formatDate(checkIn)}
Check-out: ${formatDate(checkOut)}
Total de diárias: ${nights}

${roomsSection}

Valor total da reserva: ${formatCurrency(totalCost)}

Atenciosamente,
[seu nome]`;
  };

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