// components/requests/sections/car-rental-item.tsx
"use client";

import { useState, useEffect } from "react";
import Input from "@/components/ui/input";
import { getGuests } from "@/lib/services/guest-service";
import type { Guest } from "@/types/guest";

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

interface CarRentalItemProps {
  rental: CarRental;
  onUpdate: (rental: CarRental) => void;
  onRemove: () => void;
}

export default function CarRentalItem({
  rental,
  onUpdate,
  onRemove,
}: CarRentalItemProps) {
  const [availableGuests, setAvailableGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [newDriverName, setNewDriverName] = useState("");
  const [newDriverDocument, setNewDriverDocument] = useState("");

  // Carrega hóspedes do Supabase
  useEffect(() => {
    async function loadGuests() {
      try {
        const data = await getGuests();
        setAvailableGuests(data);
      } catch (error) {
        console.error("Erro ao carregar condutores:", error);
      } finally {
        setLoading(false);
      }
    }

    loadGuests();
  }, []);

  // Filtra condutores disponíveis (que não estão na lista)
  const filteredGuests = availableGuests
    .filter((guest) => !rental.drivers.some((d) => d.id === guest.id))
    .filter((guest) =>
      guest.full_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

  // Adiciona condutor existente (do autocomplete)
  const addExistingDriver = (guest: Guest) => {
    const newDriver = {
      id: guest.id,
      name: guest.full_name,
      document: guest.document,
    };
    onUpdate({
      ...rental,
      drivers: [...rental.drivers, newDriver],
    });
    setSearchTerm("");
  };

  // Adiciona condutor manualmente
  const addNewDriver = () => {
    if (!newDriverName.trim() || !newDriverDocument.trim()) {
      alert("Preencha nome e documento do condutor");
      return;
    }

    const exists = rental.drivers.some((d) => d.document === newDriverDocument.trim());
    if (exists) {
      alert("Já existe um condutor com este documento nesta locação");
      return;
    }

    const newDriver = {
      id: `temp-${Date.now()}`,
      name: newDriverName.trim(),
      document: newDriverDocument.trim(),
    };

    onUpdate({
      ...rental,
      drivers: [...rental.drivers, newDriver],
    });
    setNewDriverName("");
    setNewDriverDocument("");
  };

  const removeDriver = (id: string) => {
    onUpdate({
      ...rental,
      drivers: rental.drivers.filter((d) => d.id !== id),
    });
  };

  const updateField = (field: keyof CarRental, value: any) => {
    onUpdate({
      ...rental,
      [field]: value,
    });
  };

  return (
    <div className="border border-gray-200 rounded-md bg-white p-4 space-y-4">
      <div className="flex justify-between items-start">
        <h3 className="font-medium text-gray-900">🚗 Locação #{rental.id.slice(-4)}</h3>
        <button
          type="button"
          onClick={onRemove}
          className="text-red-600 hover:text-red-800 text-sm font-medium"
        >
          Remover locação
        </button>
      </div>

      {/* Datas */}
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Data de retirada"
          type="date"
          value={rental.startDate}
          onChange={(e) => updateField("startDate", e.target.value)}
        />
        <Input
          label="Data de entrega"
          type="date"
          value={rental.endDate}
          onChange={(e) => updateField("endDate", e.target.value)}
        />
      </div>

      {/* Condutores */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Condutores ({rental.drivers.length})
        </label>

        {/* Adicionar condutor manualmente */}
        <div className="grid grid-cols-2 gap-2 mb-2">
          <Input
            placeholder="Nome do condutor"
            value={newDriverName}
            onChange={(e) => setNewDriverName(e.target.value)}
            className="bg-white text-gray-900"
          />
          <Input
            placeholder="Documento"
            value={newDriverDocument}
            onChange={(e) => setNewDriverDocument(e.target.value)}
            className="bg-white text-gray-900"
          />
        </div>
        <button
          type="button"
          onClick={addNewDriver}
          className="w-full bg-green-600 text-white py-1 rounded-md hover:bg-green-700 transition-colors text-sm font-medium mb-2"
        >
          + Adicionar condutor manualmente
        </button>

        {/* Autocomplete */}
        <div>
          <Input
            type="text"
            placeholder={loading ? "Carregando..." : "Buscar condutor existente..."}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            disabled={loading}
            className="bg-white text-gray-900"
          />

          {searchTerm.length > 0 && filteredGuests.length > 0 && (
            <div className="mt-1 border border-gray-200 rounded-md max-h-32 overflow-y-auto bg-white shadow-sm">
              {filteredGuests.map((guest) => (
                <button
                  key={guest.id}
                  type="button"
                  onClick={() => addExistingDriver(guest)}
                  className="w-full text-left px-3 py-2 hover:bg-gray-50 transition-colors text-sm"
                >
                  <div className="font-medium text-gray-900">{guest.full_name}</div>
                  <div className="text-gray-500">{guest.document}</div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Lista de condutores */}
        {rental.drivers.length > 0 && (
          <div className="mt-2 space-y-1">
            {rental.drivers.map((driver) => (
              <div
                key={driver.id}
                className="flex items-center justify-between bg-gray-50 rounded p-2 text-sm"
              >
                <div>
                  <span className="font-medium text-gray-900">{driver.name}</span>
                  <span className="text-gray-500 ml-2">{driver.document}</span>
                </div>
                <button
                  type="button"
                  onClick={() => removeDriver(driver.id)}
                  className="text-red-600 hover:text-red-800 text-sm"
                >
                  Remover
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Observações da locação */}
      <div>
        <label htmlFor={`car-obs-${rental.id}`} className="block text-sm font-medium text-gray-700 mb-1">
          Observações desta locação
        </label>
        <textarea
          id={`car-obs-${rental.id}`}
          className="resize-none w-full rounded border border-gray-300 bg-white p-2 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          placeholder="Ex: categoria do carro, necessidade de cadeirinha, GPS..."
          value={rental.observations}
          onChange={(e) => updateField("observations", e.target.value)}
          rows={2}
        />
      </div>
    </div>
  );
}