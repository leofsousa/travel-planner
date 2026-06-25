// components/quotations/quotation-card.tsx
"use client";

import { useState } from "react";
import { updateQuotationSelection, deleteQuotation } from "@/lib/services/request-service";

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

interface QuotationCardProps {
  quotation: Quotation;
  onRefresh: () => void;
}

export default function QuotationCard({ quotation, onRefresh }: QuotationCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const formatCurrency = (value: number, currency: string) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: currency || "BRL",
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR");
  };

  const handleSelect = async () => {
    try {
      await updateQuotationSelection(quotation.id, !quotation.is_selected);
      onRefresh();
    } catch (error) {
      alert("Erro ao selecionar cotação");
    }
  };

  const handleDelete = async () => {
    if (!confirm("Tem certeza que deseja excluir esta cotação?")) return;

    try {
      setIsDeleting(true);
      await deleteQuotation(quotation.id);
      onRefresh();
    } catch (error) {
      alert("Erro ao excluir cotação");
    } finally {
      setIsDeleting(false);
    }
  };

  const isSelected = quotation.is_selected;

  return (
    <div
      className={`border rounded-lg p-3 transition-colors ${
        isSelected
          ? "border-green-400 bg-green-50"
          : "border-gray-200 hover:border-blue-300"
      }`}
    >
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h4 className="font-medium text-gray-900">{quotation.supplier}</h4>
            {isSelected && (
              <span className="bg-green-500 text-white text-xs px-2 py-0.5 rounded-full">
                ✅ Selecionada
              </span>
            )}
          </div>
          {quotation.description && (
            <p className="text-sm text-gray-600 mt-0.5">{quotation.description}</p>
          )}
          <div className="flex flex-wrap gap-3 mt-1 text-sm text-gray-500">
            <span>
              💰 {formatCurrency(quotation.total_amount, quotation.currency)}
            </span>
            <span>📅 {formatDate(quotation.quotation_date)}</span>
          </div>
        </div>

        <div className="flex gap-1 ml-2">
          <button
            onClick={handleSelect}
            className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
              isSelected
                ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
                : "bg-blue-100 text-blue-700 hover:bg-blue-200"
            }`}
          >
            {isSelected ? "Desmarcar" : "Selecionar"}
          </button>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-700 hover:bg-red-200 disabled:opacity-50"
          >
            {isDeleting ? "..." : "🗑️"}
          </button>
        </div>
      </div>
    </div>
  );
}