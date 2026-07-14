// components/details/room-card.tsx
"use client";

interface RatePeriod {
  startDate: string;
  endDate: string;
  dailyRate: number;
}

interface Room {
  id: string;
  type: "individual" | "duplo" | "triplo" | "quadruplo";
  guests: { id: string; name: string; document: string }[];
  periods: RatePeriod[];
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
    if (value === undefined || value === null) return "R$ 0,00";
    return `R$ ${value.toFixed(2)}`;
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "Data não definida";
    const parts = dateString.split("-");
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateString;
  };

  // Calcula o total do quarto com base nos períodos
  const calculateRoomTotal = () => {
    if (!room.periods || room.periods.length === 0) return 0;
    return room.periods.reduce((sum, period) => {
      const start = new Date(period.startDate);
      const end = new Date(period.endDate);
      const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
      return sum + (days * period.dailyRate);
    }, 0);
  };

  const total = room.total || calculateRoomTotal();

  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
      <div className="flex justify-between items-start">
        <div>
          <h4 className="font-medium text-gray-900">
            Quarto {roomTypes[room.type] || room.type}
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

      {/* Períodos do quarto */}
      <div className="mt-2 space-y-1">
        {room.periods && room.periods.length > 0 ? (
          room.periods.map((period, index) => {
            const start = new Date(period.startDate);
            const end = new Date(period.endDate);
            const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
            return (
              <div key={index} className="text-sm text-gray-600">
                <span className="font-medium">
                  {formatDate(period.startDate)} a {formatDate(period.endDate)}:
                </span>{" "}
                {formatCurrency(period.dailyRate)}/diária ({days} dias)
              </div>
            );
          })
        ) : (
          <p className="text-sm text-gray-400">Nenhum período definido</p>
        )}
      </div>

      {/* Total do quarto */}
      <div className="mt-2 pt-2 border-t border-gray-100">
        <p className="text-sm font-medium text-gray-900">
          Total: {formatCurrency(total)}
        </p>
      </div>

      {/* Hóspedes */}
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