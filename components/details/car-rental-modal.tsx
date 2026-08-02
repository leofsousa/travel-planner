// components/details/car-rental-modal.tsx
"use client";

import { useState, useEffect } from "react";

interface CarRental {
  id: string;
  supplier: string;
  pickUpDate: string;
  pickUpTime: string;
  returnDate: string;
  returnTime: string;
  carModel: string;
  category: string;
  totalAmount: number;
  observations: string;
}

interface CarRentalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (rentalData: Omit<CarRental, "id">) => void;
  editingRental: CarRental | null;
  startDate: string;
  endDate: string;
}

export default function CarRentalModal({
  isOpen,
  onClose,
  onSave,
  editingRental,
  startDate,
  endDate,
}: CarRentalModalProps) {
  const [supplier, setSupplier] = useState("");
  const [pickUpDate, setPickUpDate] = useState(startDate || "");
  const [pickUpTime, setPickUpTime] = useState("");
  const [returnDate, setReturnDate] = useState(endDate || "");
  const [returnTime, setReturnTime] = useState("");
  const [carModel, setCarModel] = useState("");
  const [category, setCategory] = useState("");
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [observations, setObservations] = useState("");
  const [error, setError] = useState("");

  // 🔥 CALCULA O NÚMERO DE DIÁRIAS
  const calculateNights = () => {
    if (!pickUpDate || !returnDate) return 0;
    const start = new Date(pickUpDate);
    const end = new Date(returnDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const nights = calculateNights();
  const dailyRate = totalAmount && nights > 0 ? totalAmount / nights : 0;

  useEffect(() => {
    if (editingRental) {
      setSupplier(editingRental.supplier || "");
      setPickUpDate(editingRental.pickUpDate);
      setPickUpTime(editingRental.pickUpTime || "");
      setReturnDate(editingRental.returnDate);
      setReturnTime(editingRental.returnTime || "");
      setCarModel(editingRental.carModel || "");
      setCategory(editingRental.category || "");
      setTotalAmount(editingRental.totalAmount || 0);
      setObservations(editingRental.observations || "");
    } else {
      setSupplier("");
      setPickUpDate(startDate || "");
      setPickUpTime("");
      setReturnDate(endDate || "");
      setReturnTime("");
      setCarModel("");
      setCategory("");
      setTotalAmount(0);
      setObservations("");
    }
    setError("");
  }, [editingRental, startDate, endDate, isOpen]);

  const handleSubmit = () => {
    if (!supplier.trim()) {
      setError("Preencha o fornecedor");
      return;
    }

    if (!pickUpDate || !returnDate) {
      setError("Preencha as datas de retirada e devolução");
      return;
    }

    if (totalAmount <= 0) {
      setError("Informe o valor total da locação");
      return;
    }

    onSave({
      supplier: supplier.trim(),
      pickUpDate,
      pickUpTime,
      returnDate,
      returnTime,
      carModel: carModel.trim(),
      category: category.trim(),
      totalAmount,
      observations: observations.trim(),
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 text-black">
      <div className="bg-white rounded-lg max-w-2xl w-full p-6 shadow-xl">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          {editingRental ? "✏️ Editar Locação" : "➕ Adicionar Locação"}
        </h2>

        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Fornecedor *</label>
            <input
              type="text"
              value={supplier}
              onChange={(e) => setSupplier(e.target.value)}
              placeholder="Ex: Localiza, Movida, Unidas..."
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Data de Retirada *</label>
            <input
              type="date"
              value={pickUpDate}
              onChange={(e) => setPickUpDate(e.target.value)}
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Hora de Retirada</label>
            <input
              type="time"
              value={pickUpTime}
              onChange={(e) => setPickUpTime(e.target.value)}
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Data de Devolução *</label>
            <input
              type="date"
              value={returnDate}
              onChange={(e) => setReturnDate(e.target.value)}
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Hora de Devolução</label>
            <input
              type="time"
              value={returnTime}
              onChange={(e) => setReturnTime(e.target.value)}
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Modelo do Carro</label>
            <input
              type="text"
              value={carModel}
              onChange={(e) => setCarModel(e.target.value)}
              placeholder="Ex: Onix, Corolla..."
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="">Selecione...</option>
              <option value="Econômico">Econômico</option>
              <option value="Intermediário">Intermediário</option>
              <option value="Sedan">Sedan</option>
              <option value="SUV">SUV</option>
              <option value="Pickup">Pickup</option>
              <option value="Luxo">Luxo</option>
            </select>
          </div>

          {/* 🔥 VALOR TOTAL DA LOCAÇÃO */}
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Valor total da locação (R$) *
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={totalAmount || ""}
              onChange={(e) => setTotalAmount(parseFloat(e.target.value) || 0)}
              placeholder="Ex: 1500.00"
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
            {nights > 0 && totalAmount > 0 && (
              <p className="text-xs text-gray-500 mt-1">
                💰 {formatCurrency(dailyRate)} / dia ({nights} diária{nights > 1 ? "s" : ""})
              </p>
            )}
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Observações</label>
            <textarea
              value={observations}
              onChange={(e) => setObservations(e.target.value)}
              placeholder="Ex: GPS incluso, cadeirinha, carro automático..."
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none"
              rows={2}
            />
          </div>
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 p-2 rounded border border-red-200 mt-4">
            ⚠️ {error}
          </p>
        )}

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            {editingRental ? "Atualizar" : "Adicionar"}
          </button>
        </div>
      </div>
    </div>
  );
}