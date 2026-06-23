// app/requests/[id]/components/room-card.tsx
"use client";

interface Room {
  id: string;
  type: "individual" | "duplo" | "triplo" | "quadruplo";
  guests: { id: string; name: string; document: string }[];
  dailyRate: number;
  total: number;
}

interface RoomCardProps {
  room: Room;
  nights: number;
  onEdit: () => void;
  onRemove: () => void;
  roomTypes: Record<string, string>;
}

export default function RoomCard({
  room,
  nights,
  onEdit,
  onRemove,
  roomTypes,
}: RoomCardProps) {
  const formatCurrency = (value: number) => {
    return `R$ ${value.toFixed(2)}`;
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
      <div className="flex justify-between items-start">
        <div>
          <h4 className="font-medium text-gray-900">
            Quarto {roomTypes[room.type]}
          </h4>
          <p className="text-sm text-gray-500">
            {room.guests.length} hóspede(s)
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onEdit}
            className="text-blue-600 hover:text-blue-800 text-sm"
          >
            Editar
          </button>
          <button
            onClick={onRemove}
            className="text-red-600 hover:text-red-800 text-sm"
          >
            Remover
          </button>
        </div>
      </div>

      <div className="mt-2 space-y-1">
        <p className="text-sm text-gray-600">
          Diária: {formatCurrency(room.dailyRate)} × {nights} noite(s)
        </p>
        <p className="text-sm font-medium text-gray-900">
          Total: {formatCurrency(room.total)}
        </p>
      </div>

      {room.guests.length > 0 && (
        <div className="mt-2">
          <p className="text-xs text-gray-500">Hóspedes:</p>
          <ul className="list-disc list-inside text-sm text-gray-700">
            {room.guests.map((guest) => (
              <li key={guest.id}>{guest.name}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}