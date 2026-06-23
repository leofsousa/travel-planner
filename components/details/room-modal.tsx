// app/requests/[id]/components/room-modal.tsx
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
  }, [editingRoom]);

  const filteredGuests = availableGuests.filter(
    (guest) =>
      !selectedGuests.some((g) => g.id === guest.id) &&
      guest.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const addGuest = (guest: Guest) => {
    setSelectedGuests([...selectedGuests, guest]);
    setSearchTerm("");
  };

  const removeGuest = (guestId: string) => {
    setSelectedGuests(selectedGuests.filter((g) => g.id !== guestId));
  };

  const handleSubmit = () => {
    if (!type || selectedGuests.length === 0 || dailyRate <= 0) {
      alert("Preencha todos os campos");
      return;
    }

    onSave({
      type,
      guests: selectedGuests,
      dailyRate,
    });
  };

  if (!isOpen) return null;

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
              onChange={(e) => setDailyRate(parseFloat(e.target.value) || 0)}
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

              {searchTerm.length > 0 && filteredGuests.length > 0 && (
                <div className="border border-gray-200 rounded-md max-h-32 overflow-y-auto bg-white shadow-sm">
                  {filteredGuests.map((guest) => (
                    <button
                      key={guest.id}
                      type="button"
                      onClick={() => addGuest(guest)}
                      className="w-full text-left px-3 py-2 hover:bg-gray-50 transition-colors text-sm"
                    >
                      <div className="font-medium text-gray-900">{guest.name}</div>
                      <div className="text-gray-500 text-xs">{guest.document}</div>
                    </button>
                  ))}
                </div>
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
            </div>
          </div>

          {nights > 0 && dailyRate > 0 && (
            <p className="text-sm text-gray-600">
              Total do quarto: R$ {(dailyRate * nights).toFixed(2)} ({nights} diárias)
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