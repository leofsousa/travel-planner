import { getHotels } from "@/lib/services/hotel-service";
import HotelTable from "./components/hotel-table";

export default async function HotelsPage() {
  const hotels = await getHotels();

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            🏨 Gerenciar Hotéis
          </h1>
          <p className="text-sm text-gray-500">
            {hotels.length} hotel(éis) cadastrado(s)
          </p>
        </div>

        <HotelTable initialHotels={hotels} />
      </div>
    </div>
  );
}