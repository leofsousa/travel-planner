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
  hotelAddress?: string;
  checkIn: string;
  checkOut: string;
  rooms: Room[];
  nights: number;
  totalCost: number;
  defaultRecipients?: string[];
  guestEmails?: string[];
  type?: "financeiro" | "colaborador";
}

export default function EmailGenerator({
  eventName,
  location,
  hotelName,
  hotelAddress,
  checkIn,
  checkOut,
  rooms,
  nights,
  totalCost,
  defaultRecipients = [],
  guestEmails = [],
  type = "financeiro",
}: EmailGeneratorProps) {
  const [copied, setCopied] = useState(false);
  const [recipients, setRecipients] = useState(
    type === "colaborador"
      ? guestEmails.join(", ")
      : "contasapagar@remateweb.com, franciele.elias@remateweb.com, matheus.marques@remateweb.com"
  );
  const [pagamento50, setPagamento50] = useState(false);
  const [pagamentoPersonalizado, setPagamentoPersonalizado] = useState(false);
  const [valorPersonalizado, setValorPersonalizado] = useState<number>(0);

  const formatDate = (dateString: string) => {
    if (!dateString) return "Data não informada";
    const parts = dateString.split("-");
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateString;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const getValorAntecipado = () => {
    if (pagamento50) return totalCost / 2;
    if (pagamentoPersonalizado) return valorPersonalizado;
    return 0;
  };

  const getValorRestante = () => {
    const antecipado = getValorAntecipado();
    return Math.max(totalCost - antecipado, 0);
  };

  const groupRooms = (rooms: Room[]) => {
    if (!rooms || !Array.isArray(rooms) || rooms.length === 0) {
      return [];
    }

    const groups: Record<
      string,
      {
        type: string;
        periods: RatePeriod[];
        guests: { name: string }[];
        count: number;
        total: number;
      }
    > = {};

    rooms.forEach((room) => {
      const periodsKey = room.periods
        .map((p) => `${p.startDate}-${p.endDate}-${p.dailyRate}`)
        .join("|");
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

  const roomTypes: Record<string, string> = {
    individual: "Individual",
    duplo: "Duplo",
    triplo: "Triplo",
    quadruplo: "Quadruplo",
  };

  const generateEmailBody = () => {
    const valorAntecipado = getValorAntecipado();
    const valorRestante = getValorRestante();
    const temPagamento = valorAntecipado > 0;

    const roomsSection = groupedRooms
      .map((group) => {
        const typeLabel = roomTypes[group.type] || group.type;
        const guestsList = group.guests.map((g) => `    - ${g.name}`).join("\n");
        const periodsList = group.periods
          .map((p) => {
            const start = formatDate(p.startDate);
            const end = formatDate(p.endDate);
            const startDate = new Date(p.startDate);
            const endDate = new Date(p.endDate);
            const days = Math.ceil(
              (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
            );
            return `    ${start} a ${end} - ${formatCurrency(p.dailyRate)}/diária (${days} dias)`;
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

    let pagamentoSection = "";
    if (temPagamento) {
      const percentual = pagamento50 ? "50%" : "personalizado";
      pagamentoSection = `
⚠️ Pagamento Antecipado:
Já foi pago ${formatCurrency(valorAntecipado)} (${percentual} do valor total).
Restam ${formatCurrency(valorRestante)} a serem pagos no check-in.`;
    }

    const recipientText = recipients ? ` (para: ${recipients})` : "";

    return `Olá${recipientText},

Segue as informações da reserva de hotel para o evento "${eventName}":

Hotel: ${hotelName}
${hotelAddress ? `Endereço: ${hotelAddress}\n` : ""}Check-in: ${formatDate(checkIn)}
Check-out: ${formatDate(checkOut)}
Total de diárias: ${nights}

${roomsSection}

Valor total da reserva: ${formatCurrency(totalCost)}
${pagamentoSection}

Atenciosamente,`;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generateEmailBody());
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleOpenEmail = () => {
    const subject = `Reserva de Hotel - ${eventName}`;
    const body = encodeURIComponent(generateEmailBody());
    const to = recipients || "";
    window.location.href = `mailto:${to}?subject=${subject}&body=${body}`;
  };

  const filteredGuests = guestEmails.filter(
    (email) =>
      email &&
      !recipients.split(",").some((r) => r.trim() === email.trim())
  );

  const handleAddGuestEmail = (email: string) => {
    if (recipients) {
      setRecipients(`${recipients}, ${email}`);
    } else {
      setRecipients(email);
    }
  };

  return (
    <div className="space-y-4 text-black">
      {/* 📧 DESTINATÁRIOS */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          📧 Destinatários (separados por vírgula)
        </label>
        <div className="relative">
          <input
            type="text"
            value={recipients}
            onChange={(e) => setRecipients(e.target.value)}
            placeholder="email1@empresa.com, email2@empresa.com"
            className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
          {type === "colaborador" && guestEmails.length > 0 && (
            <datalist id="emails-list">
              {filteredGuests.map((email) => (
                <option key={email} value={email} />
              ))}
            </datalist>
          )}
        </div>
        {type === "colaborador" && guestEmails.length > 0 && (
          <div className="mt-1 flex flex-wrap gap-1">
            <span className="text-xs text-gray-500">💡 Sugestões:</span>
            {guestEmails.map((email) => (
              <button
                key={email}
                onClick={() => handleAddGuestEmail(email)}
                className="text-xs text-blue-600 hover:text-blue-800 hover:underline"
              >
                {email}
              </button>
            ))}
          </div>
        )}
        {type === "financeiro" && defaultRecipients.length > 0 && (
          <p className="text-xs text-gray-400 mt-1">
            💡 Destinatários fixos: {defaultRecipients.join(", ")}
          </p>
        )}
      </div>

      {/* ─── Pagamento Antecipado (apenas para colaborador) ─── */}
      {type === "colaborador" && (
        <div className="border-t border-gray-200 pt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">
            💰 Pagamento Antecipado
          </h4>

          <div className="flex items-center gap-2 mb-2">
            <input
              type="checkbox"
              id="pagamento50"
              checked={pagamento50}
              className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
              onChange={(e) => {
                setPagamento50(e.target.checked);
                if (e.target.checked) setPagamentoPersonalizado(false);
              }}
            />
            <label htmlFor="pagamento50" className="text-sm text-gray-700">
              50% do valor total ({formatCurrency(totalCost / 2)})
            </label>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="pagamentoPersonalizado"
              checked={pagamentoPersonalizado}
              className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
              onChange={(e) => {
                setPagamentoPersonalizado(e.target.checked);
                if (e.target.checked) setPagamento50(false);
              }}
            />
            <label htmlFor="pagamentoPersonalizado" className="text-sm text-gray-700">
              Valor personalizado:
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={valorPersonalizado || ""}
              onChange={(e) => setValorPersonalizado(parseFloat(e.target.value) || 0)}
              placeholder="R$ 0,00"
              className="w-32 rounded border border-gray-300 px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              disabled={!pagamentoPersonalizado}
            />
          </div>

          {getValorAntecipado() > 0 && (
            <div className="mt-2 p-2 bg-blue-50 rounded border border-blue-200 text-sm">
              <p>
                <span className="font-medium">Antecipado:</span>{" "}
                {formatCurrency(getValorAntecipado())}
              </p>
              <p>
                <span className="font-medium">Restante:</span>{" "}
                {formatCurrency(getValorRestante())}
              </p>
            </div>
          )}
        </div>
      )}

      {/* 🔥 Preview do Email */}
      <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Preview do Email:</h4>
        <pre className="text-sm text-gray-600 whitespace-pre-wrap font-sans">
          {generateEmailBody()}
        </pre>
      </div>

      {/* Botões */}
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
    </div>
  );
}