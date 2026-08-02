// components/requests/sections/car-rental-item.tsx
"use client";

import { useState, useEffect } from "react";
import Input from "@/components/ui/input";
import { getGuests, createGuest } from "@/lib/services/guest-service";
import type { Guest } from "@/types/guest";

interface CarDriver {
  id: string;
  name: string;
  document?: string;
  email?: string;
}

interface CarRental {
  id: string;
  startDate: string;
  endDate: string;
  drivers: CarDriver[];
  totalAmount?: number;
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
  const [newDriverEmail, setNewDriverEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  // 🔥 CALCULA O NÚMERO DE DIÁRIAS
  const calculateNights = () => {
    if (!rental.startDate || !rental.endDate) return 0;
    const start = new Date(rental.startDate);
    const end = new Date(rental.endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const nights = calculateNights();

  // 🔥 CALCULA O VALOR POR DIA
  const dailyRate = rental.totalAmount && nights > 0 ? rental.totalAmount / nights : 0;

  // 🔥 ATUALIZA O TOTAL
  const handleTotalAmountChange = (value: string) => {
    const total = parseFloat(value) || 0;
    onUpdate({
      ...rental,
      totalAmount: total,
    });
  };

  const filteredGuests = availableGuests
    .filter((guest) => !rental.drivers.some((d) => d.id === guest.id))
    .filter((guest) =>
      guest.full_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const addExistingDriver = (guest: Guest) => {
    const newDriver: CarDriver = {
      id: guest.id,
      name: guest.full_name,
      document: guest.document,
      email: guest.email,
    };
    onUpdate({
      ...rental,
      drivers: [...rental.drivers, newDriver],
    });
    setSearchTerm("");
  };

  const addNewDriver = async () => {
    if (!newDriverName.trim()) {
      alert("Preencha o nome do condutor");
      return;
    }

    setIsSubmitting(true);

    try {
      const createdGuest = await createGuest({
        full_name: newDriverName.trim(),
        document: undefined,
        email: newDriverEmail.trim() || undefined,
      });

      const newDriver: CarDriver = {
        id: createdGuest.id,
        name: createdGuest.full_name,
        document: createdGuest.document,
        email: createdGuest.email,
      };

      onUpdate({
        ...rental,
        drivers: [...rental.drivers, newDriver],
      });

      const updatedGuests = await getGuests();
      setAvailableGuests(updatedGuests);

      setNewDriverName("");
      setNewDriverEmail("");
      alert(`✅ Condutor "${createdGuest.full_name}" cadastrado com sucesso!`);
    } catch (error) {
      console.error("Erro ao criar condutor:", error);
      alert(error instanceof Error ? error.message : "Falha ao criar condutor");
    } finally {
      setIsSubmitting(false);
    }
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

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  return (
    <div className="border border-gray-200 rounded-md bg-white p-4 space-y-4 text-black">
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

      {/* 🔥 VALOR TOTAL E DIÁRIA - VERSÃO CORRIGIDA */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Valor total da locação (R$)
          </label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={rental.totalAmount || ""}
            onChange={(e) => handleTotalAmountChange(e.target.value)}
            placeholder="Ex: 1500.00"
            className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Valor por diária
          </label>
          <div className="w-full rounded border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700">
            {nights > 0 && rental.totalAmount ? (
              <>
                {formatCurrency(dailyRate)} / dia
                <span className="text-xs text-gray-500 ml-2">
                  ({nights} diária{nights > 1 ? "s" : ""})
                </span>
              </>
            ) : (
              <span className="text-gray-400">
                {nights === 0 ? "Defina as datas" : "Informe o valor total"}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Condutores */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Condutores ({rental.drivers.length})
        </label>

        <div className="grid grid-cols-2 gap-2 mb-2">
          <Input
            placeholder="Nome do condutor *"
            value={newDriverName}
            onChange={(e) => setNewDriverName(e.target.value)}
            disabled={isSubmitting}
            className="bg-white text-gray-900"
          />
          <Input
            placeholder="E-mail (opcional)"
            type="email"
            value={newDriverEmail}
            onChange={(e) => setNewDriverEmail(e.target.value)}
            disabled={isSubmitting}
            className="bg-white text-gray-900"
          />
        </div>
        <button
          type="button"
          onClick={addNewDriver}
          disabled={isSubmitting}
          className={`w-full py-1 rounded-md transition-colors text-sm font-medium mb-2 ${
            isSubmitting
              ? "bg-gray-400 text-white cursor-not-allowed"
              : "bg-green-600 text-white hover:bg-green-700"
          }`}
        >
          {isSubmitting ? "Cadastrando..." : "+ Adicionar condutor manualmente"}
        </button>

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
                  {guest.email && (
                    <div className="text-gray-500 text-xs">{guest.email}</div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {rental.drivers.length > 0 && (
          <div className="mt-2 space-y-1">
            {rental.drivers.map((driver) => (
              <div
                key={driver.id}
                className="flex items-center justify-between bg-gray-50 rounded p-2 text-sm"
              >
                <div>
                  <span className="font-medium text-gray-900">{driver.name}</span>
                  {driver.email && (
                    <span className="text-gray-500 ml-2">{driver.email}</span>
                  )}
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