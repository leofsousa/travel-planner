// components/quotations/quotation-modal.tsx
"use client";

import { useState } from "react";
import { addQuotation } from "@/lib/services/request-service";

interface QuotationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  requestId: string;
  serviceType: "hotel" | "flight" | "car";
}

export default function QuotationModal({
  isOpen,
  onClose,
  onSuccess,
  requestId,
  serviceType,
}: QuotationModalProps) {
  const [supplier, setSupplier] = useState("");
  const [description, setDescription] = useState("");
  const [totalAmount, setTotalAmount] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!supplier.trim() || !totalAmount.trim()) {
      setError("Preencha fornecedor e valor total");
      return;
    }

    const amount = parseFloat(totalAmount.replace(",", "."));
    if (isNaN(amount) || amount <= 0) {
      setError("Valor total inválido");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      await addQuotation({
        requestId,
        serviceType,
        supplier: supplier.trim(),
        description: description.trim(),
        totalAmount: amount,
      });

      onSuccess();
      setSupplier("");
      setDescription("");
      setTotalAmount("");
      onClose();
    } catch (error) {
      setError(error instanceof Error ? error.message : "Erro ao adicionar cotação");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 text-black">
      <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          ➕ Adicionar Cotação
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fornecedor *
            </label>
            <input
              type="text"
              value={supplier}
              onChange={(e) => setSupplier(e.target.value)}
              placeholder="Ex: Hilton Hotels"
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descrição
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ex: Quarto duplo com vista"
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Valor Total (R$) *
            </label>
            <input
              type="text"
              value={totalAmount}
              onChange={(e) => setTotalAmount(e.target.value)}
              placeholder="Ex: 1250.00"
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              required
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 p-2 rounded border border-red-200">
              ⚠️ {error}
            </p>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition-colors"
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`flex-1 py-2 rounded-lg transition-colors text-white ${
                isSubmitting
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {isSubmitting ? "Salvando..." : "Adicionar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}