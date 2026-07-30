// app/requests/[id]/edit/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getRequestById, updateRequest } from "@/lib/services/request-service";
import RequestForm from "@/components/requests/request-form";
import { notFound } from "next/navigation";

interface EditRequestPageProps {
  params: {
    id: string;
  };
}

export default function EditRequestPage({ params }: EditRequestPageProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [initialData, setInitialData] = useState<any>(null);

  useEffect(() => {
    async function loadRequest() {
      try {
        const data = await getRequestById(params.id);
        if (!data) {
          notFound();
          return;
        }

        // Transforma os dados do banco para o formato do formulário
        const formattedData = {
          eventName: data.event_name,
          local: data.location,
          startDate: data.start_date,
          endDate: data.end_date,
          hotel: {
            enabled: data.request_hotels?.[0]?.enabled || false,
            guests: data.request_hotels?.[0]?.hotel_guests?.map((hg: any) => ({
              id: hg.guests.id,
              name: hg.guests.full_name,
              document: hg.guests.document,
            })) || [],
            observations: data.request_hotels?.[0]?.observations || "",
          },
          flight: {
            enabled: data.request_flights?.[0]?.enabled || false,
            departureDate: data.request_flights?.[0]?.departure_date || "",
            returnDate: data.request_flights?.[0]?.return_date || "",
            observations: data.request_flights?.[0]?.observations || "",
          },
          car: {
            enabled: data.request_cars?.[0]?.enabled || false,
            rentals: data.request_cars?.[0]?.car_rentals?.map((rental: any) => ({
              id: rental.id,
              startDate: rental.start_date,
              endDate: rental.end_date,
              drivers: rental.rental_drivers?.map((rd: any) => ({
                id: rd.guests.id,
                name: rd.guests.full_name,
                document: rd.guests.document,
              })) || [],
              observations: rental.observations || "",
            })) || [],
          },
        };

        setInitialData(formattedData);
      } catch (error) {
        console.error("Erro ao carregar solicitação:", error);
      } finally {
        setLoading(false);
      }
    }

    loadRequest();
  }, [params.id]);

  const handleSubmit = async (data: any) => {
    try {
      await updateRequest(params.id, data);
      router.push(`/requests/${params.id}`);
    } catch (error) {
      console.error("Erro ao atualizar:", error);
      alert(error instanceof Error ? error.message : "Erro ao atualizar solicitação");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-4 flex items-center justify-center">
        <p className="text-gray-500">Carregando solicitação...</p>
      </div>
    );
  }

  if (!initialData) {
    return (
      <div className="min-h-screen bg-gray-100 p-4 flex items-center justify-center">
        <p className="text-gray-500">Solicitação não encontrada.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-4">
          <button
            onClick={() => router.back()}
            className="text-blue-600 hover:text-blue-800 text-sm"
          >
            ← Voltar
          </button>
        </div>
        <RequestForm initialData={initialData} onSubmit={handleSubmit} isEditing />
      </div>
    </div>
  );
}