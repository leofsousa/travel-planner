"use client";

interface CostSummaryProps {
  hotelCost: number;
  carCost: number;
  flightCost: number;
}

export default function CostSummary({ hotelCost, carCost, flightCost }: CostSummaryProps) {
  const total = hotelCost + carCost + flightCost;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  if (total === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 space-y-4">
      <h2 className="text-lg font-semibold text-gray-900">💰 Resumo de Custos</h2>
      
      <div className="space-y-2 text-sm">
        {hotelCost > 0 && (
          <div className="flex justify-between items-center border-b border-gray-100 pb-2">
            <span className="text-gray-600">🏨 Hotel</span>
            <span className="font-medium text-gray-900">{formatCurrency(hotelCost)}</span>
          </div>
        )}
        
        {carCost > 0 && (
          <div className="flex justify-between items-center border-b border-gray-100 pb-2">
            <span className="text-gray-600">🚗 Locação de Carro</span>
            <span className="font-medium text-gray-900">{formatCurrency(carCost)}</span>
          </div>
        )}
        
        {flightCost > 0 && (
          <div className="flex justify-between items-center border-b border-gray-100 pb-2">
            <span className="text-gray-600">✈️ Passagem</span>
            <span className="font-medium text-gray-900">{formatCurrency(flightCost)}</span>
          </div>
        )}
      </div>

      <div className="flex justify-between items-center pt-2 border-t-2 border-gray-200">
        <span className="text-base font-semibold text-gray-900">Total</span>
        <span className="text-xl font-bold text-blue-600">{formatCurrency(total)}</span>
      </div>
    </div>
  );
}