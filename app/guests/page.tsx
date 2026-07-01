// app/guests/page.tsx
import { getGuests } from "@/lib/services/guest-service";
import GuestTable from "@/components/guest-table";

export default async function GuestsPage() {
  const guests = await getGuests();

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            👥 Gerenciar Hóspedes
          </h1>
          <p className="text-sm text-gray-500">
            {guests.length} hóspede(s) cadastrado(s)
          </p>
        </div>

        <GuestTable initialGuests={guests} />
      </div>
    </div>
  );
}