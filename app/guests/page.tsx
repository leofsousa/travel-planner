// app/guests/page.tsx

export const dynamic = 'force-dynamic'; // ← FORÇA RENDERIZAÇÃO DINÂMICA
export const revalidate = 0; // ← DESABILITA CACHE

import { getGuests } from "@/lib/services/guest-service";
import GuestTable from "./components/guest-table";

export const dynamic = "force-dynamic";

export default async function GuestsPage() {
  const guests = await getGuests();
  console.log("👥 Hóspedes carregados na página:", guests.length);

  return (
    <div className="max-w-6xl mx-auto text-black">
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