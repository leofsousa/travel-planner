// components/requests/sections/hotel-section.tsx
"use client";

import { useEffect, useState } from "react";
import Input from "@/components/ui/input";
import { getGuests, createGuest } from "@/lib/services/guest-service";
import type { Guest } from "@/types/guest";

interface HotelGuest {
  id: string;
  name: string;
  document: string;
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
  
  // Estados para criar novo hóspede manualmente
  const [newGuestName, setNewGuestName] = useState("");
  const [newGuestDocument, setNewGuestDocument] = useState("");

  // Carrega hóspedes do Supabase
  const loadGuests = async () => {
    try {
      setLoading(true);
      const data = await getGuests();
      setAvailableGuests(data);
    } catch (error) {
      console.error("Erro ao carregar hóspedes:", error);
      // Mensagem mais amigável
      const errorMessage = error instanceof Error ? error.message : "Falha ao carregar lista de hóspedes";
      alert(`⚠️ ${errorMessage}\n\nVerifique o console para mais detalhes.`);
      setAvailableGuests([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGuests();
  }, []);

  // Filtra hóspedes disponíveis (que não estão na lista)
  const filteredGuests = availableGuests
    .filter((guest) => !guests.some((g) => g.id === guest.id))
    .filter((guest) =>
      guest.full_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

  // Adiciona hóspede existente (do autocomplete)
  const addExistingGuest = (guest: Guest) => {
    const newGuest: HotelGuest = {
      id: guest.id,
      name: guest.full_name,
      document: guest.document,
    };
    onGuestsChange([...guests, newGuest]);
    setSearchTerm("");
  };

  // Adiciona novo hóspede (criado manualmente) com INSERT no Supabase
  const addNewGuest = async () => {
    // Validação
    if (!newGuestName.trim() || !newGuestDocument.trim()) {
      alert("Preencha nome e documento do hóspede");
      return;
    }

    // Verifica duplicata na lista local
    const existsLocal = guests.some((g) => g.document === newGuestDocument.trim());
    if (existsLocal) {
      alert("Já existe um hóspede com este documento na lista");
      return;
    }

    setIsSubmitting(true);

    try {
      // Insere no Supabase
      const createdGuest = await createGuest(
        newGuestName.trim(),
        newGuestDocument.trim()
      );

      // Adiciona à lista local
      const newGuest: HotelGuest = {
        id: createdGuest.id,
        name: createdGuest.full_name,
        document: createdGuest.document,
      };
      onGuestsChange([...guests, newGuest]);

      // Atualiza a lista de hóspedes disponíveis
      await loadGuests();

      // Limpa os campos
      setNewGuestName("");
      setNewGuestDocument("");

      // Feedback de sucesso
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
            placeholder="Documento (CPF/CNPJ)"
            value={newGuestDocument}
            onChange={(e) => setNewGuestDocument(e.target.value)}
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
                <div className="text-sm text-gray-500">{guest.document}</div>
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
                  <p className="text-sm text-gray-500">{guest.document}</p>
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
          className="w-full rounded border border-gray-300 bg-white p-2 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          placeholder="Ex: quarto com vista, check-in tardio, preferência por andar baixo..."
          value={observations}
          onChange={(e) => onObservationsChange(e.target.value)}
          rows={3}
        />
      </div>
    </div>
  );
}