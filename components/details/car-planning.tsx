// components/details/car-planning.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { getCarPlanning, saveCarPlanning } from "@/lib/services/request-service";
import CarRentalCard from "./car-rental-card";
import CarRentalModal from "./car-rental-modal";

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

interface CarPlanningProps {
  requestId: string;
  startDate: string;
  endDate: string;
  onCostChange?: (cost: number) => void;
  onDataChange?: (data: {
    hasRental: boolean;
    rentals: any[];
    totalCost: number;
  }) => void;
}

export default function CarPlanning({ requestId, startDate, endDate, onCostChange, onDataChange }: CarPlanningProps) {
  const [rentals, setRentals] = useState<CarRental[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingRental, setEditingRental] = useState<CarRental | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const calculateCarTotal = useCallback(() => {
    return rentals.reduce((sum, rental) => sum + (rental.totalAmount || 0), 0);
  }, [rentals]);

  useEffect(() => {
    if (onDataChange && !loading) {
      const totalCost = rentals.reduce((sum, r) => sum + (r.totalAmount || 0), 0);
      onDataChange({
        hasRental: rentals.length > 0,
        rentals: rentals.map((r) => ({
          id: r.id,
          supplier: r.supplier,
          pickUpDate: r.pickUpDate,
          pickUpTime: r.pickUpTime,
          returnDate: r.returnDate,
          returnTime: r.returnTime,
          carModel: r.carModel,
          category: r.category,
          totalAmount: r.totalAmount || 0,
          observations: r.observations,
        })),
        totalCost,
      });
    }
  }, [rentals, loading, onDataChange]);

  useEffect(() => {
    if (onCostChange) {
      const total = calculateCarTotal();
      onCostChange(total);
    }
  }, [rentals, onCostChange, calculateCarTotal]);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await getCarPlanning(requestId);
        if (data) {
          setRentals(data.rentals || []);
        }
      } catch (error) {
        console.error("Erro ao carregar planejamento de carro:", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [requestId]);

  useEffect(() => {
    if (loading) return;

    const saveTimeout = setTimeout(async () => {
      try {
        await saveCarPlanning(requestId, { rentals });
      } catch (error) {
        console.error("Erro ao salvar planejamento de carro:", error);
      }
    }, 500);

    return () => clearTimeout(saveTimeout);
  }, [rentals, requestId, loading]);

  const addRental = (rentalData: Omit<CarRental, "id">) => {
    const newRental: CarRental = {
      ...rentalData,
      id: `car-${Date.now()}`,
    };
    setRentals([...rentals, newRental]);
  };

  const updateRental = (updatedRental: CarRental) => {
    setRentals(rentals.map((r) => (r.id === updatedRental.id ? updatedRental : r)));
  };

  const removeRental = (rentalId: string) => {
    if (!confirm("Tem certeza que deseja remover esta locação?")) return;
    setRentals(rentals.filter((r) => r.id !== rentalId));
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingRental(null);
  };

  const handleModalSave = (rentalData: Omit<CarRental, "id">) => {
    if (editingRental) {
      updateRental({ ...editingRental, ...rentalData });
    } else {
      addRental(rentalData);
    }
    handleModalClose();
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <p className="text-gray-500 text-center">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">🚗 Planejamento de Carros</h2>
        <span className="text-sm text-gray-500">{rentals.length} locação(ões)</span>
      </div>

      <div className="space-y-4">
        {rentals.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-8">
            Nenhuma locação adicionada. Clique em &quot;Nova loca&ccedil;&atilde;o&quot; para começar.
          </p>
        ) : (
          rentals.map((rental) => (
            <CarRentalCard
              key={rental.id}
              rental={rental}
              onEdit={() => {
                setEditingRental(rental);
                setIsModalOpen(true);
              }}
              onRemove={() => removeRental(rental.id)}
            />
          ))
        )}
      </div>

      <div className="border-t border-gray-200 pt-4">
        <button
          onClick={() => {
            setEditingRental(null);
            setIsModalOpen(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
        >
          + Adicionar Locação
        </button>
      </div>

      {isModalOpen && (
        <CarRentalModal
          isOpen={isModalOpen}
          onClose={handleModalClose}
          onSave={handleModalSave}
          editingRental={editingRental}
          startDate={startDate}
          endDate={endDate}
        />
      )}
    </div>
  );
}