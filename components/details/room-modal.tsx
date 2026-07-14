"use client";

import { useState, useEffect } from "react";

interface Guest {
  id: string;
  name: string;
  document: string;
}

interface RatePeriod {
  startDate: string;
  endDate: string;
  dailyRate: number;
}

interface Room {
  id: string;
  type: "individual" | "duplo" | "triplo" | "quadruplo";
  guests: Guest[];
  periods: RatePeriod[];
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
  startDate: string;
  endDate: string;
  requestStartDate: string;
  requestEndDate: string;
}

export default function RoomModal({
  isOpen,
  onClose,
  onSave,
  availableGuests,
  editingRoom,
  nights,
  roomTypes,
  startDate,
  endDate,
  requestStartDate,
  requestEndDate,
}: RoomModalProps) {
  const [type, setType] = useState<Room["type"]>("individual");
  const [selectedGuests, setSelectedGuests] = useState<Guest[]>([]);
  const [periods, setPeriods] = useState<RatePeriod[]>([
    { startDate: startDate || requestStartDate, endDate: endDate || requestEndDate, dailyRate: 0 }
  ]);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState("");
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  useEffect(() => {
    if (editingRoom) {
      setType(editingRoom.type);
      setSelectedGuests(editingRoom.guests);
      setPeriods(editingRoom.periods);
    } else {
      setType("individual");
      setSelectedGuests([]);
      setPeriods([{ startDate: startDate || requestStartDate, endDate: endDate || requestEndDate, dailyRate: 0 }]);
    }
    setSearchTerm("");
    setError("");
    setValidationErrors([]);
  }, [editingRoom, isOpen, startDate, endDate, requestStartDate, requestEndDate]);

  // 🔥 VALIDAÇÃO DOS PERÍODOS
  const validatePeriods = () => {
    const errors: string[] = [];

    periods.forEach((period, index) => {
      // Período dentro da viagem
      if (period.startDate < requestStartDate) {
        errors.push(`Período ${index + 1} começa antes da viagem.`);
      }
      if (period.endDate > requestEndDate) {
        errors.push(`Período ${index + 1} termina depois da viagem.`);
      }
      if (period.startDate >= period.endDate) {
        errors.push(`Período ${index + 1} tem data de início maior ou igual ao fim.`);
      }
    });

    // Sobreposição de períodos
    for (let i = 0; i < periods.length; i++) {
      for (let j = i + 1; j < periods.length; j++) {
        const p1 = periods[i];
        const p2 = periods[j];
        if (p1.startDate < p2.endDate && p2.startDate < p1.endDate) {
          errors.push(`Períodos ${i + 1} e ${j + 1} estão sobrepostos.`);
        }
      }
    }

    setValidationErrors(errors);
    return errors.length === 0;
  };

  const addPeriod = () => {
    const lastPeriod = periods[periods.length - 1];
    const newStart = lastPeriod.endDate;
    setPeriods([
      ...periods,
      { startDate: newStart, endDate: requestEndDate, dailyRate: 0 }
    ]);
  };

  const removePeriod = (index: number) => {
    if (periods.length <= 1) return;
    setPeriods(periods.filter((_, i) => i !== index));
  };

  const updatePeriod = (index: number, field: keyof RatePeriod, value: string | number) => {
    const updated = [...periods];
    updated[index] = { ...updated[index], [field]: value };
    setPeriods(updated);
    setValidationErrors([]);
  };

  const calculateTotal = () => {
    return periods.reduce((sum, period) => {
      const start = new Date(period.startDate);
      const end = new Date(period.endDate);
      const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
      return sum + (days * period.dailyRate);
    }, 0);
  };

  const filteredGuests = availableGuests.filter(
    (guest) =>
      !selectedGuests.some((g) => g.id === guest.id) &&
      guest.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const addGuest = (guest: Guest) => {
    // 🔥 VALIDAÇÃO: Quarto individual só pode ter 1 hóspede
    if (type === "individual" && selectedGuests.length >= 1) {
      setError("Quartos individuais só podem ter 1 hóspede.");
      return;
    }
    setSelectedGuests([...selectedGuests, guest]);
    setSearchTerm("");
    setError("");
  };

  const removeGuest = (guestId: string) => {
    setSelectedGuests(selectedGuests.filter((g) => g.id !== guestId));
  };

  const handleSubmit = () => {
    // 🔥 VALIDAÇÃO DE HÓSPEDES
    if (selectedGuests.length === 0) {
      setError("Adicione pelo menos um hóspede ao quarto");
      return;
    }

    // 🔥 VALIDAÇÃO DE QUARTO INDIVIDUAL
    if (type === "individual" && selectedGuests.length > 1) {
      setError("Quartos individuais só podem ter 1 hóspede.");
      return;
    }

    // 🔥 VALIDAÇÃO DE PERÍODOS
    if (!validatePeriods()) {
      setError(validationErrors.join(" "));
      return;
    }

    if (periods.some(p => p.dailyRate <= 0)) {
      setError("Informe o valor da diária para todos os períodos");
      return;
    }

    setError("");
    onSave({
      type,
      guests: selectedGuests,
      periods,
    });
  };

  if (!isOpen) return null;

  const total = calculateTotal();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full p-6 shadow-xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          {editingRoom ? "✏️ Editar Quarto" : "➕ Adicionar Quarto"}
        </h2>

        <div className="space-y-4">
          {/* Tipo de Quarto */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de Quarto
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as Room["type"])}
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            >
              {Object.entries(roomTypes).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
            {type === "individual" && (
              <p className="text-xs text-gray-500 mt-1">
                ⚠️ Quarto individual: apenas 1 hóspede permitido.
              </p>
            )}
          </div>

          {/* Períodos */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Períodos e Valores
              </label>
              <button
                type="button"
                onClick={addPeriod}
                className="text-xs text-blue-600 hover:text-blue-800"
              >
                + Adicionar período
              </button>
            </div>
            <div className="space-y-3">
              {periods.map((period, index) => {
                const start = new Date(period.startDate);
                const end = new Date(period.endDate);
                const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

                return (
                  <div key={index} className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                    <div className="flex justify-between items-start">
                      <div className="grid grid-cols-2 gap-2 flex-1">
                        <div>
                          <label className="block text-xs text-gray-500">Início</label>
                          <input
                            type="date"
                            value={period.startDate}
                            min={requestStartDate}
                            max={requestEndDate}
                            onChange={(e) => updatePeriod(index, "startDate", e.target.value)}
                            className="w-full rounded border border-gray-300 px-2 py-1 text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500">Fim</label>
                          <input
                            type="date"
                            value={period.endDate}
                            min={requestStartDate}
                            max={requestEndDate}
                            onChange={(e) => updatePeriod(index, "endDate", e.target.value)}
                            className="w-full rounded border border-gray-300 px-2 py-1 text-sm"
                          />
                        </div>
                        <div className="col-span-2">
                          <label className="block text-xs text-gray-500">Diária (R$)</label>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={period.dailyRate || ""}
                            onChange={(e) => updatePeriod(index, "dailyRate", parseFloat(e.target.value) || 0)}
                            placeholder="Ex: 250.00"
                            className="w-full rounded border border-gray-300 px-2 py-1 text-sm"
                          />
                        </div>
                      </div>
                      {periods.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removePeriod(index)}
                          className="text-red-500 hover:text-red-700 text-sm ml-2 mt-1"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                    {days > 0 && period.dailyRate > 0 && (
                      <p className="text-xs text-gray-500 mt-1">
                        Total do período: R$ {(days * period.dailyRate).toFixed(2)} ({days} diárias)
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
            {validationErrors.length > 0 && (
              <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-lg">
                <ul className="list-disc list-inside text-xs text-red-600">
                  {validationErrors.map((err, idx) => (
                    <li key={idx}>{err}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Hóspedes */}
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
                className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
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

          {/* Total do Quarto */}
          {total > 0 && selectedGuests.length > 0 && (
            <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
              <p className="text-sm text-gray-700">
                <span className="font-medium">Total do quarto:</span>{" "}
                <span className="font-bold text-blue-700">
                  R$ {total.toFixed(2)}
                </span>
              </p>
            </div>
          )}

          {error && (
            <p className="text-sm text-red-600 bg-red-50 p-2 rounded border border-red-200">
              ⚠️ {error}
            </p>
          )}
        </div>

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
            {editingRoom ? "Atualizar" : "Adicionar"}
          </button>
        </div>
      </div>
    </div>
  );
}