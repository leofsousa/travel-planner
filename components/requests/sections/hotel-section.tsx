// components/requests/sections/hotel-section.tsx
"use client";

import { useEffect, useState } from "react";
import Input from "@/components/ui/input";
import { getGuests, createGuest } from "@/lib/services/guest-service";
import type { Guest } from "@/types/guest";

interface HotelGuest {
  id: string;
  name: string;
  document?: string; // ← Opcional, mas mantido para compatibilidade
  email?: string;
}

interface HotelSectionProps {
  guests: HotelGuest[];
  observations: string;
  onGuestsChange: (guests: HotelGuest[]) => void;
  onObservationsChange: (value: string) => void;
}

export default function HotelSection({
  guests,
  observations,
  onGuestsChange,
  onObservationsChange,
}: HotelSectionProps) {
  const [availableGuests, setAvailableGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newGuestName, setNewGuestName] = useState("");
  const [newGuestEmail, setNewGuestEmail] = useState("");

  const loadGuests = async () => {
    try {
      setLoading(true);
      const data = await getGuests();
      setAvailableGuests(data);
    } catch (error) {
      console.error("Erro ao carregar hóspedes:", error);
      alert(error instanceof Error ? error.message : "Falha ao carregar lista de hóspedes");
      setAvailableGuests([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGuests();
  }, []);

  // 🔥 Remove a exibição do documento nas sugestões
  const filteredGuests = availableGuests
    .filter((guest) => !guests.some((g) => g.id === guest.id))
    .filter((guest) =>
      guest.full_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const addExistingGuest = (guest: Guest) => {
    const newGuest: HotelGuest = {
      id: guest.id,
      name: guest.full_name,
      document: guest.document,
      email: guest.email,
    };
    onGuestsChange([...guests, newGuest]);
    setSearchTerm("");
  };

  const addNewGuest = async () => {
    if (!newGuestName.trim()) {
      alert("Preencha o nome do hóspede");
      return;
    }

    setIsSubmitting(true);

    try {
      const createdGuest = await createGuest({
        full_name: newGuestName.trim(),
        document: undefined, // ← SEM DOCUMENTO
        email: newGuestEmail.trim() || undefined,
      });

      const newGuest: HotelGuest = {
        id: createdGuest.id,
        name: createdGuest.full_name,
        document: createdGuest.document,
        email: createdGuest.email,
      };
      onGuestsChange([...guests, newGuest]);
      await loadGuests();
      setNewGuestName("");
      setNewGuestEmail("");
      alert(`✅ Hóspede "${createdGuest.full_name}" cadastrado com sucesso!`);
    } catch (error) {
      console.error("Erro ao criar hóspede:", error);
      alert(error instanceof Error ? error.message : "Falha ao criar hóspede");
    } finally {
      setIsSubmitting(false);
    }
  };

  const removeGuest = (id: string) => {
    onGuestsChange(guests.filter((g) => g.id !== id));
  };

  return (
    <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-4 space-y-4">
      <h2 className="text-lg font-semibold text-gray-900">🏨 Hospedagem</h2>

      {/* SEÇÃO: ADICIONAR NOVO HÓSPEDE MANUALMENTE */}
      <div className="border border-gray-200 rounded-md bg-white p-3">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Cadastrar novo hóspede
        </label>
        <div className="grid grid-cols-2 gap-2">
          <Input
            placeholder="Nome completo"
            value={newGuestName}
            onChange={(e) => setNewGuestName(e.target.value)}
            disabled={isSubmitting}
            className="bg-white text-gray-900"
          />
          <Input
            placeholder="E-mail (opcional)"
            type="email"
            value={newGuestEmail}
            onChange={(e) => setNewGuestEmail(e.target.value)}
            disabled={isSubmitting}
            className="bg-white text-gray-900"
          />
        </div>
        <button
          type="button"
          onClick={addNewGuest}
          disabled={isSubmitting}
          className={`mt-2 w-full py-2 rounded-md transition-colors text-sm font-medium ${
            isSubmitting
              ? "bg-gray-400 text-white cursor-not-allowed"
              : "bg-green-600 text-white hover:bg-green-700"
          }`}
        >
          {isSubmitting ? "Cadastrando..." : "+ Adicionar hóspede manualmente"}
        </button>
      </div>

      {/* SEÇÃO: AUTOCOMPLETE */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Buscar hóspede existente
        </label>
        <Input
          type="text"
          placeholder={loading ? "Carregando..." : "Digite o nome para buscar..."}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          disabled={loading}
          className="bg-white text-gray-900"
        />

        {searchTerm.length > 0 && filteredGuests.length > 0 && (
          <div className="mt-1 border border-gray-200 rounded-md max-h-40 overflow-y-auto divide-y divide-gray-100 bg-white shadow-sm">
            {filteredGuests.map((guest) => (
              <button
                key={guest.id}
                type="button"
                onClick={() => addExistingGuest(guest)}
                className="w-full text-left px-3 py-2 hover:bg-gray-50 transition-colors"
              >
                <div className="font-medium text-gray-900">{guest.full_name}</div>
                {/* 🔥 DOCUMENTO REMOVIDO DAS SUGESTÕES */}
                {guest.email && (
                  <div className="text-sm text-gray-500">{guest.email}</div>
                )}
              </button>
            ))}
          </div>
        )}

        {searchTerm.length > 0 && filteredGuests.length === 0 && !loading && (
          <p className="text-sm text-gray-600 mt-1">
            Nenhum hóspede encontrado. Cadastre um novo acima.
          </p>
        )}
      </div>

      {/* LISTA DE HÓSPEDES ADICIONADOS */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Hóspedes selecionados ({guests.length})
        </label>
        {guests.length === 0 ? (
          <p className="text-sm text-gray-500">Nenhum hóspede adicionado</p>
        ) : (
          <div className="space-y-2">
            {guests.map((guest) => (
              <div
                key={guest.id}
                className="flex items-center justify-between rounded border border-gray-200 bg-white p-2"
              >
                <div>
                  <p className="font-medium text-gray-900">{guest.name}</p>
                  {/* 🔥 EMAIL EXIBIDO, DOCUMENTO REMOVIDO */}
                  {guest.email && (
                    <p className="text-sm text-gray-500">{guest.email}</p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => removeGuest(guest.id)}
                  className="text-red-600 hover:text-red-800 text-sm font-medium"
                >
                  Remover
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* OBSERVAÇÕES */}
      <div>
        <label htmlFor="hotel-observations" className="block text-sm font-medium text-gray-700 mb-1">
          Observações do hotel
        </label>
        <textarea
          id="hotel-observations"
          className="w-full rounded border border-gray-300 bg-white p-2 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
          placeholder="Ex: quarto com vista, check-in tardio..."
          value={observations}
          onChange={(e) => onObservationsChange(e.target.value)}
          rows={3}
        />
      </div>
    </div>
  );
}