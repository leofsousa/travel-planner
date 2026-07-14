// app/hotels/components/hotel-table.tsx
"use client";

import { useState } from "react";
import type { Hotel } from "@/lib/services/hotel-service";
import { deleteHotel } from "@/lib/services/hotel-service";
import HotelModal from "./hotel-modal";

interface HotelTableProps {
  initialHotels: Hotel[];
}

export default function HotelTable({ initialHotels }: HotelTableProps) {
  const [hotels, setHotels] = useState<Hotel[]>(initialHotels);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHotel, setEditingHotel] = useState<Hotel | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const filteredHotels = hotels.filter(
    (hotel) =>
      hotel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      hotel.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (hotel.state && hotel.state.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const sortedHotels = [...filteredHotels].sort((a, b) =>
    a.name.localeCompare(b.name)
  );

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Tem certeza que deseja excluir "${name}"?`)) return;

    try {
      setIsDeleting(id);
      await deleteHotel(id);
      setHotels(hotels.filter((h) => h.id !== id));
    } catch (error) {
      alert(error instanceof Error ? error.message : "Erro ao excluir hotel");
    } finally {
      setIsDeleting(null);
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingHotel(null);
  };

  const handleHotelSaved = (savedHotel: Hotel) => {
    if (editingHotel) {
      setHotels(hotels.map((h) => (h.id === savedHotel.id ? savedHotel : h)));
    } else {
      setHotels([...hotels, savedHotel]);
    }
    handleModalClose();
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Buscar por nome, cidade ou estado..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded border border-gray-300 px-3 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
        >
          + Novo Hotel
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-gray-700 font-medium">Nome</th>
              <th className="px-4 py-3 text-gray-700 font-medium">Cidade</th>
              <th className="px-4 py-3 text-gray-700 font-medium">Estado</th>
              <th className="px-4 py-3 text-gray-700 font-medium">Telefone</th>
              <th className="px-4 py-3 text-gray-700 font-medium text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {sortedHotels.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                  {searchTerm ? "Nenhum hotel encontrado" : "Nenhum hotel cadastrado"}
                </td>
              </tr>
            ) : (
              sortedHotels.map((hotel) => (
                <tr key={hotel.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-900 font-medium">{hotel.name}</td>
                  <td className="px-4 py-3 text-gray-600">{hotel.city}</td>
                  <td className="px-4 py-3 text-gray-600">{hotel.state || "-"}</td>
                  <td className="px-4 py-3 text-gray-600">{hotel.phone || "-"}</td>
                  <td className="px-4 py-3 text-right space-x-2">
                    <button
                      onClick={() => {
                        setEditingHotel(hotel);
                        setIsModalOpen(true);
                      }}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(hotel.id, hotel.name)}
                      disabled={isDeleting === hotel.id}
                      className={`text-red-600 hover:text-red-800 text-sm font-medium ${
                        isDeleting === hotel.id ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                    >
                      {isDeleting === hotel.id ? "Excluindo..." : "Excluir"}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <HotelModal
          hotel={editingHotel}
          onClose={handleModalClose}
          onSave={handleHotelSaved}
        />
      )}
    </div>
  );
}