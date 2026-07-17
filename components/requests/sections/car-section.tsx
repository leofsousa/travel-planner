// components/requests/sections/car-section.tsx
"use client";

import { useState } from "react";
import CarRentalItem from "./car-rental-item";

interface CarDriver {
  id: string;
  name: string;
  document: string;
}

interface CarRental {
  id: string;
  startDate: string;
  endDate: string;
  drivers: CarDriver[];
  observations: string;
}

interface CarSectionProps {
  enabled: boolean;
  rentals: CarRental[];
  onRentalsChange: (rentals: CarRental[]) => void;
}

export default function CarSection({
  enabled,
  rentals,
  onRentalsChange,
}: CarSectionProps) {
  if (!enabled) return null;

  const addRental = () => {
    const newRental: CarRental = {
      id: `car-${Date.now()}`,
      startDate: "",
      endDate: "",
      drivers: [],
      observations: "",
    };
    onRentalsChange([...rentals, newRental]);
  };

  const updateRental = (index: number, updatedRental: CarRental) => {
    const newRentals = [...rentals];
    newRentals[index] = updatedRental;
    onRentalsChange(newRentals);
  };

  const removeRental = (index: number) => {
    onRentalsChange(rentals.filter((_, i) => i !== index));
  };

  return (
    <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-900">🚗 Locação de Carros</h2>
        <button
          type="button"
          onClick={addRental}
          className="bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700 transition-colors text-sm"
        >
          + Nova locação
        </button>
      </div>

      {rentals.length === 0 ? (
        <p className="text-sm text-gray-500 text-center py-4">
         Nenhuma locação adicionada. Clique em &quot;Nova loca&ccedil;&atilde;o&quot; para começar.
        </p>
      ) : (
        <div className="space-y-4">
          {rentals.map((rental, index) => (
            <CarRentalItem
              key={rental.id}
              rental={rental}
              onUpdate={(updated) => updateRental(index, updated)}
              onRemove={() => removeRental(index)}
            />
          ))}
        </div>
      )}
    </div>
  );
}