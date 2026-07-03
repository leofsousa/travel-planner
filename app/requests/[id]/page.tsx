// app/requests/[id]/page.tsx
import { getRequestById, updateRequestStatus } from "@/lib/services/request-service";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import HotelPlanning from "@/components/details/hotel-planning";
import FlightPlanning from "@/components/details/flight-planning";
import CarPlanning from "@/components/details/car-planning";
import DeleteButton from "@/components/ui/delete-button";
import QuotationSection from "@/components/quotations/quotation-section";

interface Params {
  id: string;
}

function StatusBadge({ status }: { status: string }) {
  const colors = {
    pending: "bg-yellow-100 text-yellow-800",
    in_progress: "bg-blue-100 text-blue-800",
    completed: "bg-green-100 text-green-800",
  };

  const labels = {
    pending: "📋 A Fazer",
    in_progress: "⏳ Em Andamento",
    completed: "✅ Concluída",
  };

  return (
    <span className={`px-3 py-1 rounded-full text-sm font-medium ${colors[status as keyof typeof colors]}`}>
      {labels[status as keyof typeof labels]}
    </span>
  );
}

function formatDate(dateString: string) {
  if (!dateString) return "Data não informada";
  const parts = dateString.split("-");
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return dateString;
}

function formatDateTime(date: string) {
  return new Date(date).toLocaleString("pt-BR");
}

export default async function RequestDetailPage({ params }: { params: Params }) {
  
  const request = await getRequestById(params.id);

  if (!request) {
    notFound();
  }

  const hotelData = request.request_hotels?.[0];
  const flightData = request.request_flights?.[0];
  const carData = request.request_cars?.[0];

  const hasHotel = hotelData?.enabled === true;
  const hasFlight = flightData?.enabled === true;
  const hasCar = carData?.enabled === true;

  const availableGuests = hotelData?.hotel_guests?.map((hg: any) => ({
    id: hg.guests.id,
    name: hg.guests.full_name,
    document: hg.guests.document,
  })) || [];
  console.log("🔍 Dados completos:", request);
console.log("🔍 request_flights:", request.request_flights);
console.log("🔍 request_cars:", request.request_cars);
  const updateStatus = async (formData: FormData) => {
    "use server";
    const status = formData.get("status") as "pending" | "in_progress" | "completed";
    await updateRequestStatus(params.id, status);
    redirect(`/requests/${params.id}`);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-4 flex justify-between items-center">
          <Link href="/" className="text-blue-600 hover:text-blue-800 text-sm">
            ← Voltar ao Dashboard
          </Link>
          <DeleteButton 
            requestId={params.id} 
            requestName={request.event_name} 
          />
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 space-y-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {request.event_name}
              </h1>
              <p className="text-gray-600">📍 {request.location}</p>
            </div>
            <StatusBadge status={request.status} />
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Data Início:</span>
              <span className="ml-2 text-gray-900">{formatDate(request.start_date)}</span>
            </div>
            <div>
              <span className="text-gray-500">Data Fim:</span>
              <span className="ml-2 text-gray-900">{formatDate(request.end_date)}</span>
            </div>
            <div>
              <span className="text-gray-500">Criado em:</span>
              <span className="ml-2 text-gray-900">{formatDateTime(request.created_at)}</span>
            </div>
            <div>
              <span className="text-gray-500">Última atualização:</span>
              <span className="ml-2 text-gray-900">{formatDateTime(request.updated_at)}</span>
            </div>
          </div>

          <form action={updateStatus} className="flex items-center gap-3 pt-2 border-t border-gray-100">
            <label className="text-sm font-medium text-gray-700">Status:</label>
            <select
              name="status"
              defaultValue={request.status}
              className="rounded border border-gray-300 px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            >
              <option value="pending">📋 A Fazer</option>
              <option value="in_progress">⏳ Em Andamento</option>
              <option value="completed">✅ Concluída</option>
            </select>
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700 transition-colors text-sm"
            >
              Atualizar
            </button>
          </form>
        </div>

        {/* ============================================ */}
        {/* SEÇÕES DE PLANEJAMENTO */}
        {/* ============================================ */}
        
        {/* 🏨 HOTEL */}
        {hasHotel && (
          <div className="mt-4">
            <HotelPlanning
              requestId={params.id}
              eventName={request.event_name}
              location={request.location}
              startDate={request.start_date}
              endDate={request.end_date}
              availableGuests={availableGuests}
            />
          </div>
        )}

        {/* ✈️ PASSAGEM */}
        {hasFlight && (
          <div className="mt-4">
            <FlightPlanning
              requestId={params.id}
              eventName={request.event_name}
              location={request.location}
              startDate={request.start_date}
              endDate={request.end_date}
            />
          </div>
        )}

        {/* 🚗 CARRO */}
        {hasCar && (
          <div className="mt-4">
            <CarPlanning
              requestId={params.id}
              startDate={request.start_date}
              endDate={request.end_date}
            />
          </div>
        )}

        {/* ============================================ */}
        {/* INFORMAÇÕES DA SOLICITAÇÃO E TAREFAS */}
        {/* ============================================ */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div className="bg-white rounded-lg shadow-lg p-4">
            <h2 className="font-semibold text-gray-900 mb-2">📋 Informações da Solicitação</h2>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-gray-500">Serviços solicitados:</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {hasHotel && <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded text-xs">🏨 Hotel</span>}
                  {hasFlight && <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded text-xs">✈️ Passagem</span>}
                  {hasCar && <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded text-xs">🚗 Carro</span>}
                  {!hasHotel && !hasFlight && !hasCar && (
                    <span className="text-gray-400">Nenhum serviço solicitado</span>
                  )}
                </div>
              </div>

              {hasHotel && request.request_hotels && (
                <div className="border-t border-gray-100 pt-2">
                  <p className="font-medium text-gray-700">🏨 Hotel</p>
                  {request.request_hotels[0]?.observations && (
                    <p className="text-gray-600 text-xs mt-1">
                      Obs: {request.request_hotels[0].observations}
                    </p>
                  )}
                  {request.request_hotels[0]?.hotel_guests?.length > 0 && (
                    <div className="mt-1">
                      <p className="text-gray-500 text-xs">Hóspedes:</p>
                      <ul className="list-disc list-inside text-xs text-gray-600">
                        {request.request_hotels[0].hotel_guests.map((hg: any) => (
                          <li key={hg.id}>
                            {hg.guests.full_name} - {hg.guests.document}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {hasFlight && request.request_flights && (
                <div className="border-t border-gray-100 pt-2">
                  <p className="font-medium text-gray-700">✈️ Passagem</p>
                  <div className="text-xs text-gray-600 space-y-1">
                    {request.request_flights.departure_date && (
                      <p>Saída: {formatDate(request.request_flights.departure_date)}</p>
                    )}
                    {request.request_flights.return_date && (
                      <p>Retorno: {formatDate(request.request_flights.return_date)}</p>
                    )}
                    {request.request_flights.observations && (
                      <p>Obs: {request.request_flights.observations}</p>
                    )}
                  </div>
                </div>
              )}

              {hasCar && request.request_cars && (
                <div className="border-t border-gray-100 pt-2">
                  <p className="font-medium text-gray-700">🚗 Locação de Carros</p>
                  {request.request_cars.car_rentals?.length > 0 ? (
                    <div className="space-y-2 mt-1">
                      {request.request_cars.car_rentals.map((rental: any, index: number) => (
                        <div key={rental.id} className="bg-gray-50 p-2 rounded text-xs">
                          <p className="font-medium text-gray-700">Locação #{index + 1}</p>
                          <p className="text-gray-600">Retirada: {formatDate(rental.start_date)}</p>
                          <p className="text-gray-600">Entrega: {formatDate(rental.end_date)}</p>
                          {rental.observations && (
                            <p className="text-gray-600">Obs: {rental.observations}</p>
                          )}
                          {rental.rental_drivers?.length > 0 && (
                            <div>
                              <p className="text-gray-500">Condutores:</p>
                              <ul className="list-disc list-inside text-gray-600">
                                {rental.rental_drivers.map((rd: any) => (
                                  <li key={rd.id}>
                                    {rd.guests.full_name} - {rd.guests.document}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-400 text-xs">Nenhuma locação adicionada</p>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-4">
            <h2 className="font-semibold text-gray-900 mb-2">✅ Tarefas do Planejamento</h2>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <input type="checkbox" className="w-4 h-4 text-blue-600" />
                <label className="text-gray-600">Reserva de hotel concluída</label>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" className="w-4 h-4 text-blue-600" />
                <label className="text-gray-600">Passagem emitida</label>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" className="w-4 h-4 text-blue-600" />
                <label className="text-gray-600">Carro reservado</label>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" className="w-4 h-4 text-blue-600" />
                <label className="text-gray-600">Documentos enviados ao viajante</label>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" className="w-4 h-4 text-blue-600" />
                <label className="text-gray-600">Cotação de hotel realizada</label>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" className="w-4 h-4 text-blue-600" />
                <label className="text-gray-600">Cotação de passagem realizada</label>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" className="w-4 h-4 text-blue-600" />
                <label className="text-gray-600">Cotação de carro realizada</label>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" className="w-4 h-4 text-blue-600" />
                <label className="text-gray-600">Aprovação do gestor obtida</label>
              </div>
            </div>
          </div>
        </div>

        {/* ============================================ */}
        {/* COTAÇÕES */}
        {/* ============================================ */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <QuotationSection
            requestId={params.id}
            serviceType="hotel"
            title="Cotações de Hotel"
            icon="🏨"
          />
          <QuotationSection
            requestId={params.id}
            serviceType="flight"
            title="Cotações de Passagem"
            icon="✈️"
          />
          <div className="md:col-span-2">
            <QuotationSection
              requestId={params.id}
              serviceType="car"
              title="Cotações de Carro"
              icon="🚗"
            />
          </div>
        </div>
      </div>
    </div>
  );
}