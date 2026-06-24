// components/details/room-modal.tsx
"use client";

import { useState, useEffect } from "react";

interface Guest {
  id: string;
  name: string;
  document: string;
}

interface Room {
  id: string;
  type: "individual" | "duplo" | "triplo" | "quadruplo";
  guests: Guest[];
  dailyRate: number;
  total: number;
}

interface RoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (roomData: Omit<Room, "id" | "total">) => void;
  availableGuests: Guest[];
  editingRoom: Room | null;
  nights: number;
  roomTypes: Record<string, string>;
}

export default function RoomModal({
  isOpen,
  onClose,
  onSave,
  availableGuests,
  editingRoom,
  nights,
  roomTypes,
}: RoomModalProps) {
  const [type, setType] = useState<Room["type"]>("individual");
  const [selectedGuests, setSelectedGuests] = useState<Guest[]>([]);
  const [dailyRate, setDailyRate] = useState<number>(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState("");

  // Reset do modal
  useEffect(() => {
    if (editingRoom) {
      setType(editingRoom.type);
      setSelectedGuests(editingRoom.guests);
      setDailyRate(editingRoom.dailyRate);
    } else {
      setType("individual");
      setSelectedGuests([]);
      setDailyRate(0);
    }
    setSearchTerm("");
    setError("");
  }, [editingRoom, isOpen]);

  // 🔥 CORREÇÃO 1: Filtro de hóspedes (mais robusto)
  const filteredGuests = availableGuests.filter((guest) => {
    // Remove hóspedes já selecionados
    const isAlreadySelected = selectedGuests.some((g) => g.id === guest.id);
    // Verifica se o nome contém o termo de busca (case insensitive)
    const matchesSearch = guest.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    return !isAlreadySelected && matchesSearch;
  });

  const addGuest = (guest: Guest) => {
    setSelectedGuests([...selectedGuests, guest]);
    setSearchTerm("");
    setError("");
  };

  const removeGuest = (guestId: string) => {
    setSelectedGuests(selectedGuests.filter((g) => g.id !== guestId));
  };

  // 🔥 CORREÇÃO 2: Cálculo do total (mais robusto)
  const calculateTotal = () => {
    if (nights > 0 && dailyRate > 0) {
      return dailyRate * nights;
    }
    return 0;
  };

  const total = calculateTotal();

  const handleSubmit = () => {
    // Validações
    if (selectedGuests.length === 0) {
      setError("Adicione pelo menos um hóspede ao quarto");
      return;
    }

    if (dailyRate <= 0) {
      setError("Informe o valor da diária (deve ser maior que zero)");
      return;
    }

    if (nights === 0) {
      setError("O número de diárias é zero. Verifique as datas do hotel.");
      return;
    }

    setError("");
    onSave({
      type,
      guests: selectedGuests,
      dailyRate,
    });
  };

  if (!isOpen) return null;

  // 🔥 CORREÇÃO 3: Debug - ver o que está chegando
  console.log("🔍 availableGuests no modal:", availableGuests);
  console.log("🔍 filteredGuests:", filteredGuests);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-lg w-full p-6 shadow-xl">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          {editingRoom ? "✏️ Editar Quarto" : "➕ Adicionar Quarto"}
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de Quarto
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as Room["type"])}
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            >
              {Object.entries(roomTypes).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Valor da Diária (R$)
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={dailyRate || ""}
              onChange={(e) => {
                const value = parseFloat(e.target.value);
                setDailyRate(isNaN(value) ? 0 : value);
                setError("");
              }}
              placeholder="Ex: 250.00"
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Hóspedes ({selectedGuests.length})
            </label>
            <div className="space-y-2">
              <input
                type="text"
                placeholder="Buscar hóspede..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />

              {/* 🔥 CORREÇÃO 4: Lista de sugestões mais visível */}
              {searchTerm.length > 0 && filteredGuests.length > 0 && (
                <div className="border border-gray-300 rounded-md max-h-40 overflow-y-auto bg-white shadow-lg">
                  {filteredGuests.map((guest) => (
                    <button
                      key={guest.id}
                      type="button"
                      onClick={() => addGuest(guest)}
                      className="w-full text-left px-4 py-2 hover:bg-blue-50 transition-colors border-b border-gray-100 last:border-0"
                    >
                      <div className="font-medium text-gray-900">{guest.name}</div>
                      <div className="text-gray-500 text-xs">{guest.document}</div>
                    </button>
                  ))}
                </div>
              )}

              {searchTerm.length > 0 && filteredGuests.length === 0 && (
                <p className="text-sm text-gray-500">
                  Nenhum hóspede encontrado com "{searchTerm}"
                </p>
              )}

              {selectedGuests.length > 0 && (
                <div className="space-y-1 mt-2">
                  {selectedGuests.map((guest) => (
                    <div
                      key={guest.id}
                      className="flex items-center justify-between bg-gray-50 rounded p-2 text-sm"
                    >
                      <span className="text-gray-900">{guest.name}</span>
                      <button
                        type="button"
                        onClick={() => removeGuest(guest.id)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Remover
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {availableGuests.length === 0 && (
                <p className="text-sm text-gray-500 bg-yellow-50 p-2 rounded border border-yellow-200">
                  ⚠️ Nenhum hóspede disponível. Adicione hóspedes na seção de hotel.
                </p>
              )}
            </div>
          </div>

          {/* 🔥 CORREÇÃO 5: Exibição do total sempre visível quando há dados */}
          <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
            <p className="text-sm text-gray-700">
              <span className="font-medium">Diárias:</span> {nights}
              {nights > 0 && dailyRate > 0 && (
                <>
                  <br />
                  <span className="font-medium">Total do quarto:</span>{" "}
                  <span className="font-bold text-blue-700">
                    R$ {total.toFixed(2)}
                  </span>{" "}
                  (R$ {dailyRate.toFixed(2)} × {nights} diária
                  {nights > 1 ? "s" : ""})
                </>
              )}
              {nights === 0 && (
                <span className="text-red-500 block mt-1">
                  ⚠️ Defina as datas do hotel para calcular as diárias.
                </span>
              )}
              {dailyRate === 0 && nights > 0 && (
                <span className="text-yellow-600 block mt-1">
                  ⚠️ Informe o valor da diária para ver o total.
                </span>
              )}
            </p>
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 p-2 rounded border border-red-200">
              ⚠️ {error}
            </p>
          )}
        </div>

        <div className="flex gap-3 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            {editingRoom ? "Atualizar" : "Adicionar"}
          </button>
        </div>
      </div>
    </div>
  );
}