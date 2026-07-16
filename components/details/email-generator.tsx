// components/details/email-generator.tsx
"use client";

import { useState } from "react";

interface RatePeriod {
  startDate: string;
  endDate: string;
  dailyRate: number;
}

interface Room {
  id: string;
  type: "individual" | "duplo" | "triplo" | "quadruplo";
  guests: { id: string; name: string; document: string }[];
  periods: RatePeriod[];
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

  function formatDate(dateString: string) {
    if (!dateString) return "Data não informada";
    const parts = dateString.split("-");
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateString;
  }

  const formatCurrency = (value: number) => {
    if (value === undefined || value === null) return "R$ 0,00";
    return `R$ ${value.toFixed(2)}`;
  };

  const roomTypes: Record<string, string> = {
    individual: "Individual",
    duplo: "Duplo",
    triplo: "Triplo",
    quadruplo: "Quadruplo",
  };

  // 🔥 Agrupa quartos por tipo e valor da diária
  const groupRooms = (rooms: Room[]) => {
    const groups: Record<string, { type: string; periods: RatePeriod[]; guests: { name: string }[]; count: number; total: number }> = {};

    rooms.forEach((room) => {
      // Gera uma chave única para agrupar quartos com o mesmo tipo e mesmos períodos
      const periodsKey = room.periods.map(p => `${p.startDate}-${p.endDate}-${p.dailyRate}`).join("|");
      const key = `${room.type}-${periodsKey}`;
      
      if (!groups[key]) {
        groups[key] = {
          type: room.type,
          periods: room.periods,
          guests: [],
          count: 0,
          total: 0,
        };
      }
      groups[key].guests.push(...room.guests);
      groups[key].count += 1;
      groups[key].total += room.total;
    });

    return Object.values(groups);
  };

  const groupedRooms = groupRooms(rooms);

  const generateEmailBody = () => {
    // Converte YYYY-MM-DD para Date no horário local
    const parseLocalDate = (date: string) => {
      const [year, month, day] = date.split("-").map(Number);
      return new Date(year, month - 1, day);
    };
  
    let roomsSection = groupedRooms
      .map((group) => {
        const typeLabel = roomTypes[group.type] || group.type;
        const guestsList = group.guests
          .map((g) => `    - ${g.name}`)
          .join("\n");
  
        // Gera a lista de períodos
        const periodsList = group.periods
          .map((p) => {
            const start = parseLocalDate(p.startDate);
            const end = parseLocalDate(p.endDate);
  
            const days = Math.ceil(
              (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
            );
  
            return `    ${start.toLocaleDateString("pt-BR")} a ${end.toLocaleDateString("pt-BR")} - ${formatCurrency(p.dailyRate)}/diária (${days} dias)`;
          })
          .join("\n");
  
        return `${group.count > 1 ? `${group.count}x ` : ""}Quarto ${typeLabel}
    Hóspedes:
  ${guestsList}
    Períodos:
  ${periodsList}
    Total do grupo: ${formatCurrency(group.total)}`;
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