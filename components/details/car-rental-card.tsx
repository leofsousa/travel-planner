// components/details/car-rental-card.tsx
"use client";

interface CarRental {
  id: string;
  supplier: string;
  pickUpDate: string;
  pickUpTime: string;
  returnDate: string;
  returnTime: string;
  carModel: string;
  category: string;
  dailyRate: number;
  observations: string;
}

interface CarRentalCardProps {
  rental: CarRental;
  onEdit: () => void;
  onRemove: () => void;
}

export default function CarRentalCard({ rental, onEdit, onRemove }: CarRentalCardProps) {
  const formatDate = (date: string) => {
    if (!date) return "Data não definida";
    const parts = date.split("-");
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return date;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
      <div className="flex justify-between items-start">
        <div>
          <h4 className="font-medium text-gray-900">
            {rental.supplier || "Fornecedor não definido"}
          </h4>
          {rental.carModel && (
            <p className="text-sm text-gray-600">
              {rental.carModel} {rental.category && `- ${rental.category}`}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <button onClick={onEdit} className="text-blue-600 hover:text-blue-800 text-sm">
            Editar
          </button>
          <button onClick={onRemove} className="text-red-600 hover:text-red-800 text-sm">
            Remover
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 mt-2 text-sm text-gray-600">
        <div>
          <span className="font-medium">Retirada:</span> {formatDate(rental.pickUpDate)}
          {rental.pickUpTime && ` às ${rental.pickUpTime}`}
        </div>
        <div>
          <span className="font-medium">Devolução:</span> {formatDate(rental.returnDate)}
          {rental.returnTime && ` às ${rental.returnTime}`}
        </div>
        {rental.dailyRate > 0 && (
          <div className="col-span-2">
            <span className="font-medium">Diária:</span> {formatCurrency(rental.dailyRate)}
          </div>
        )}
      </div>

      {rental.observations && (
        <p className="text-sm text-gray-500 mt-2 border-t border-gray-100 pt-2">
          📝 {rental.observations}
        </p>
      )}
    </div>
  );
}