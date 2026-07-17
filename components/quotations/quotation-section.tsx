"use client";

import { useState, useEffect, useCallback } from "react";
import QuotationCard from "./quotation-card";
import QuotationModal from "./quotation-modal";
import { getQuotations } from "@/lib/services/request-service";

interface Quotation {
  id: string;
  service_type: "hotel" | "flight" | "car";
  supplier: string;
  description: string;
  total_amount: number;
  currency: string;
  quotation_date: string;
  is_selected: boolean;
  created_at: string;
}

interface QuotationSectionProps {
  requestId: string;
  serviceType: "hotel" | "flight" | "car";
  title: string;
  icon: string;
}

export default function QuotationSection({
  requestId,
  serviceType,
  title,
  icon,
}: QuotationSectionProps) {
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const loadQuotations = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getQuotations(requestId);
      const filtered = data.filter((q) => q.service_type === serviceType);
      setQuotations(filtered);
    } catch (error) {
      console.error("Erro ao carregar cotações:", error);
    } finally {
      setLoading(false);
    }
  }, [requestId, serviceType]);

  useEffect(() => {
    loadQuotations();
  }, [loadQuotations]);

  const selectedQuotation = quotations.find((q) => q.is_selected);

  const formatCurrency = (value: number, currency: string) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: currency || "BRL",
    }).format(value);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-4">
        <p className="text-gray-500 text-sm">Carregando cotações...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="text-xl">{icon}</span>
          <h3 className="font-semibold text-gray-900">{title}</h3>
          {selectedQuotation && (
            <span className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full">
              ✅ Selecionada: {formatCurrency(selectedQuotation.total_amount, selectedQuotation.currency)}
            </span>
          )}
          <span className="text-sm text-gray-500">
            ({quotations.length})
          </span>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition-colors text-sm"
        >
          + Adicionar
        </button>
      </div>

      {quotations.length === 0 ? (
        <p className="text-gray-400 text-sm text-center py-4">
          Nenhuma cotação adicionada para {title.toLowerCase()}.
        </p>
      ) : (
        <div className="space-y-2">
          {quotations.map((quotation) => (
            <QuotationCard
              key={quotation.id}
              quotation={quotation}
              onRefresh={loadQuotations}
            />
          ))}
        </div>
      )}

      <QuotationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={loadQuotations}
        requestId={requestId}
        serviceType={serviceType}
      />
    </div>
  );
}