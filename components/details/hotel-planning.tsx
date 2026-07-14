// components/details/hotel-planning.tsx
"use client";

import { useState, useEffect } from "react";
import RoomCard from "./room-card";
import RoomModal from "./room-modal";
import EmailGenerator from "./email-generator";
import { saveHotelPlanning, getHotelPlanning } from "@/lib/services/request-service";

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

interface HotelPlanningProps {
  requestId: string;
  eventName: string;
  location: string;
  startDate: string;
  endDate: string;
  availableGuests: Guest[];
  onDataChange?: (data: {
    hotelName: string;
    checkIn: string;
    checkOut: string;
    rooms: Room[];
    nights: number;
    totalCost: number;
  }) => void;
}

export default function HotelPlanning({
  requestId,
  eventName,
  location,
  startDate,
  endDate,
  availableGuests,
  onDataChange,
}: HotelPlanningProps) {
  const [hotelName, setHotelName] = useState("");
  const [checkIn, setCheckIn] = useState(startDate);
  const [checkOut, setCheckOut] = useState(endDate);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const calculateNights = () => {
    if (!checkIn || !checkOut) return 0;
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const nights = calculateNights();

  const calculateTotal = () => {
    return rooms.reduce((sum, room) => sum + room.total, 0);
  };

  // 🔥 NOTIFICAR O PAI SEMPRE QUE OS DADOS MUDAREM
  useEffect(() => {
    if (onDataChange && !isLoading) {
      onDataChange({
        hotelName,
        checkIn,
        checkOut,
        rooms,
        nights,
        totalCost: calculateTotal(),
      });
    }
  }, [hotelName, checkIn, checkOut, rooms, nights, isLoading]);

  // Carregar planejamento salvo
  useEffect(() => {
    async function loadPlanning() {
      try {
        setIsLoading(true);
        const data = await getHotelPlanning(requestId);
        if (data) {
          setHotelName(data.hotel_name || "");
          setCheckIn(data.check_in || startDate);
          setCheckOut(data.check_out || endDate);
          
          if (data.rooms && data.rooms.length > 0) {
            const loadedRooms = data.rooms.map((room: any) => {
              const periods = room.periods || [];
              const total = periods.reduce((sum: number, period: any) => {
                const start = new Date(period.startDate);
                const end = new Date(period.endDate);
                const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
                return sum + (days * period.dailyRate);
              }, 0);

              return {
                id: room.id,
                type: room.type,
                guests: room.room_guests?.map((rg: any) => ({
                  id: rg.guests.id,
                  name: rg.guests.full_name,
                  document: rg.guests.document,
                })) || [],
                periods: periods,
                total: total,
              };
            });
            setRooms(loadedRooms);
          }
        }
      } catch (error) {
        console.error("Erro ao carregar planejamento:", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadPlanning();
  }, [requestId, startDate, endDate]);

  // Salvar automaticamente quando houver mudanças
  useEffect(() => {
    if (isLoading) return;

    const saveTimeout = setTimeout(async () => {
      try {
        await saveHotelPlanning(requestId, {
          hotelName,
          checkIn,
          checkOut,
          rooms: rooms.map((room) => ({
            type: room.type,
            periods: room.periods,
            guests: room.guests.map((g) => g.id),
          })),
        });
      } catch (error) {
        console.error("Erro ao salvar planejamento:", error);
      }
    }, 500);

    return () => clearTimeout(saveTimeout);
  }, [hotelName, checkIn, checkOut, rooms, requestId, isLoading]);

  const addRoom = (roomData: Omit<Room, "id" | "total">) => {
    const total = roomData.periods.reduce((sum, period) => {
      const start = new Date(period.startDate);
      const end = new Date(period.endDate);
      const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
      return sum + (days * period.dailyRate);
    }, 0);

    const newRoom: Room = {
      ...roomData,
      id: `room-${Date.now()}`,
      total,
    };
    setRooms([...rooms, newRoom]);
  };

  const updateRoom = (updatedRoom: Room) => {
    setRooms(rooms.map((r) => (r.id === updatedRoom.id ? updatedRoom : r)));
  };

  const removeRoom = (roomId: string) => {
    setRooms(rooms.filter((r) => r.id !== roomId));
  };

  const handleEditRoom = (room: Room) => {
    setEditingRoom(room);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingRoom(null);
  };

  const handleModalSave = (roomData: Omit<Room, "id" | "total">) => {
    if (editingRoom) {
      const total = roomData.periods.reduce((sum, period) => {
        const start = new Date(period.startDate);
        const end = new Date(period.endDate);
        const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
        return sum + (days * period.dailyRate);
      }, 0);

      const updatedRoom = {
        ...editingRoom,
        ...roomData,
        total,
      };
      updateRoom(updatedRoom);
    } else {
      addRoom(roomData);
    }
    handleModalClose();
  };

  const roomTypes = {
    individual: "Individual",
    duplo: "Duplo",
    triplo: "Triplo",
    quadruplo: "Quadruplo",
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <p className="text-gray-500 text-center">Carregando planejamento...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">🏨 Planejamento do Hotel</h2>
        <span className="text-sm text-gray-500">
          {rooms.length} quarto(s) | {nights} noite(s)
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nome do Hotel
          </label>
          <input
            type="text"
            value={hotelName}
            onChange={(e) => setHotelName(e.target.value)}
            placeholder="Ex: Hilton São Paulo"
            className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Check-in
          </label>
          <input
            type="date"
            value={checkIn}
            onChange={(e) => setCheckIn(e.target.value)}
            className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Check-out
          </label>
          <input
            type="date"
            value={checkOut}
            onChange={(e) => setCheckOut(e.target.value)}
            className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
        </div>
      </div>

      {nights > 0 && (
        <p className="text-sm text-gray-600">
          📅 Total de {nights} diária(s)
        </p>
      )}

      <div className="border-t border-gray-200 pt-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-medium text-gray-900">Quartos</h3>
          <button
            onClick={() => {
              setEditingRoom(null);
              setIsModalOpen(true);
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
          >
            + Adicionar Quarto
          </button>
        </div>

        {rooms.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-8">
            Nenhum quarto adicionado. Clique em "Adicionar Quarto" para começar.
          </p>
        ) : (
          <div className="space-y-3">
            {rooms.map((room) => (
              <RoomCard
                key={room.id}
                room={room}
                nights={nights}
                onEdit={() => handleEditRoom(room)}
                onRemove={() => removeRoom(room.id)}
                roomTypes={roomTypes}
              />
            ))}
          </div>
        )}

        {rooms.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold text-gray-900">
                Total da reserva:
              </span>
              <span className="text-xl font-bold text-blue-600">
                R$ {calculateTotal().toFixed(2)}
              </span>
            </div>
          </div>
        )}
      </div>

      {isModalOpen && (
        <RoomModal
          isOpen={isModalOpen}
          onClose={handleModalClose}
          onSave={handleModalSave}
          availableGuests={availableGuests}
          editingRoom={editingRoom}
          nights={nights}
          roomTypes={roomTypes}
          startDate={checkIn}   
          endDate={checkOut} 
        />
      )}
    </div>
  );
}