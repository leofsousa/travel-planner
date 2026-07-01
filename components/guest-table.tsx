"use client";

import { useState } from "react";
import type { Guest } from "@/types/guest";
import { deleteGuest, clearGuestCache } from "@/lib/services/guest-service";
import GuestModal from "./guest-modal";
import DocumentDisplay from "@/components/ui/document-display";

interface GuestTableProps {
  initialGuests: Guest[];
}

export default function GuestTable({ initialGuests }: GuestTableProps) {
  const [guests, setGuests] = useState<Guest[]>(initialGuests);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGuest, setEditingGuest] = useState<Guest | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const filteredGuests = guests.filter(
    (guest) =>
      guest.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      guest.document.includes(searchTerm)
  );

  const sortedGuests = [...filteredGuests].sort((a, b) =>
    a.full_name.localeCompare(b.full_name)
  );

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Tem certeza que deseja excluir "${name}"?`)) return;

    try {
      setIsDeleting(id);
      await deleteGuest(id);
      setGuests(guests.filter((g) => g.id !== id));
      clearGuestCache();
    } catch (error) {
      alert(error instanceof Error ? error.message : "Erro ao excluir hóspede");
    } finally {
      setIsDeleting(null);
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingGuest(null);
  };

  const handleGuestSaved = (savedGuest: Guest) => {
    if (editingGuest) {
      setGuests(guests.map((g) => (g.id === savedGuest.id ? savedGuest : g)));
    } else {
      setGuests([...guests, savedGuest]);
    }
    handleModalClose();
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Buscar por nome ou documento..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded border border-gray-300 px-3 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
        >
          + Novo Hóspede
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-gray-700 font-medium">Nome</th>
              <th className="px-4 py-3 text-gray-700 font-medium">Documento</th>
              <th className="px-4 py-3 text-gray-700 font-medium">Criado em</th>
              <th className="px-4 py-3 text-gray-700 font-medium text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {sortedGuests.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                  {searchTerm ? "Nenhum hóspede encontrado" : "Nenhum hóspede cadastrado"}
                </td>
              </tr>
            ) : (
              sortedGuests.map((guest) => (
                <tr key={guest.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-900">{guest.full_name}</td>
                  <td className="px-4 py-3">
                    <DocumentDisplay document={guest.document} />
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-sm">
                    {new Date(guest.created_at).toLocaleDateString("pt-BR")}
                  </td>
                  <td className="px-4 py-3 text-right space-x-2">
                    <button
                      onClick={() => {
                        setEditingGuest(guest);
                        setIsModalOpen(true);
                      }}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(guest.id, guest.full_name)}
                      disabled={isDeleting === guest.id}
                      className={`text-red-600 hover:text-red-800 text-sm font-medium ${
                        isDeleting === guest.id ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                    >
                      {isDeleting === guest.id ? "Excluindo..." : "Excluir"}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <GuestModal
          guest={editingGuest}
          onClose={handleModalClose}
          onSave={handleGuestSaved}
        />
      )}
    </div>
  );
}