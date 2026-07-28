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
    hotelName: string;
    checkIn: string;
    checkOut: string;
    rooms: any[];
    nights: number;
    totalCost: number;
  };
}

export default function EmailModal({ isOpen, onClose, data }: EmailModalProps) {
  const [activeTab, setActiveTab] = useState<"financeiro" | "colaborador">("financeiro");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[100]">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">📧 Emails da Reserva</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        {/* Abas */}
        <div className="flex border-b border-gray-200 mb-4">
          <button
            onClick={() => setActiveTab("financeiro")}
            className={`
              px-4 py-2 text-sm font-medium transition-colors
              ${
                activeTab === "financeiro"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }
            `}
          >
            💳 Financeiro
          </button>
          <button
            onClick={() => setActiveTab("colaborador")}
            className={`
              px-4 py-2 text-sm font-medium transition-colors
              ${
                activeTab === "colaborador"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }
            `}
          >
            👤 Colaborador
          </button>
        </div>

        {/* Conteúdo das abas */}
        <div>
          {activeTab === "financeiro" && (
            <EmailGenerator {...data} />
          )}

          {activeTab === "colaborador" && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                📧 Enviar para o colaborador responsável pela reserva.
              </p>
              <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <p className="text-sm text-gray-500">
                  🔜 Em breve: integração com API de envio de emails.
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  O email incluirá as mesmas informações da reserva, com um trecho adicional sobre pagamento.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}