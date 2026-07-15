// app/control-panel/components/metrics-cards.tsx
"use client";

interface Metrics {
  totalCost: number;
  totalTrips: number;
  totalHotels: number;
  uniqueCities: string[];
  pendingTrips: number;
  inProgressTrips: number;
  completedTrips: number;
  topHotels: { name: string; count: number }[];
  // 🔥 NOVAS MÉTRICAS
  totalCarRentals: number;
  totalFlights: number;
  totalHotelRooms: number;
}

interface MetricsCardsProps {
  metrics: Metrics;
}

export default function MetricsCards({ metrics }: MetricsCardsProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  return (
    <div className="space-y-6">
      {/* Cards principais */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">💰</span>
            <div>
              <p className="text-sm text-gray-500">Valor Total Gasto</p>
              <p className="text-xl font-bold text-gray-900">
                {formatCurrency(metrics.totalCost)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">✈️</span>
            <div>
              <p className="text-sm text-gray-500">Total de Viagens</p>
              <p className="text-xl font-bold text-gray-900">
                {metrics.totalTrips}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🏨</span>
            <div>
              <p className="text-sm text-gray-500">Hotéis Utilizados</p>
              <p className="text-xl font-bold text-gray-900">
                {metrics.totalHotels}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">📍</span>
            <div>
              <p className="text-sm text-gray-500">Cidades Visitadas</p>
              <p className="text-xl font-bold text-gray-900">
                {metrics.uniqueCities.length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 🔥 NOVOS CARDS: Serviços */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-purple-50 rounded-lg shadow p-4 border border-purple-200">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🚗</span>
            <div>
              <p className="text-sm text-gray-600">Locações de Carro</p>
              <p className="text-2xl font-bold text-purple-700">
                {metrics.totalCarRentals}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-indigo-50 rounded-lg shadow p-4 border border-indigo-200">
          <div className="flex items-center gap-2">
            <span className="text-2xl">✈️</span>
            <div>
              <p className="text-sm text-gray-600">Passagens Compradas</p>
              <p className="text-2xl font-bold text-indigo-700">
                {metrics.totalFlights}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-pink-50 rounded-lg shadow p-4 border border-pink-200">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🛏️</span>
            <div>
              <p className="text-sm text-gray-600">Quartos de Hotel</p>
              <p className="text-2xl font-bold text-pink-700">
                {metrics.totalHotelRooms}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Status detalhado */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-yellow-50 rounded-lg shadow p-4 border border-yellow-200">
          <p className="text-sm text-gray-600">📋 A Fazer</p>
          <p className="text-2xl font-bold text-yellow-700">{metrics.pendingTrips}</p>
        </div>
        <div className="bg-blue-50 rounded-lg shadow p-4 border border-blue-200">
          <p className="text-sm text-gray-600">⏳ Em Andamento</p>
          <p className="text-2xl font-bold text-blue-700">{metrics.inProgressTrips}</p>
        </div>
        <div className="bg-green-50 rounded-lg shadow p-4 border border-green-200">
          <p className="text-sm text-gray-600">✅ Concluídas</p>
          <p className="text-2xl font-bold text-green-700">{metrics.completedTrips}</p>
        </div>
      </div>

      {/* Top Hotéis */}
      {metrics.topHotels.length > 0 && (
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-sm font-medium text-gray-700 mb-2">🏆 Hotéis Mais Utilizados</h3>
          <div className="space-y-1">
            {metrics.topHotels.map((hotel, index) => (
              <div key={index} className="flex justify-between text-sm">
                <span className="text-gray-600">{hotel.name}</span>
                <span className="text-gray-900 font-medium">{hotel.count}x</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lista de Cidades */}
      {metrics.uniqueCities.length > 0 && (
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-sm font-medium text-gray-700 mb-2">🌍 Cidades Visitadas</h3>
          <div className="flex flex-wrap gap-2">
            {metrics.uniqueCities.map((city) => (
              <span
                key={city}
                className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm"
              >
                {city}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}