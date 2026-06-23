// lib/services/request-service.ts
import { createClient } from "@/lib/supabase/client";
import type { Guest } from "@/types/guest";

// Tipos para o request
interface HotelGuest {
  id: string;
  name: string;
  document: string;
}

interface CarDriver {
  id: string;
  name: string;
  document: string;
}

interface CarRental {
  id: string;
  startDate: string;
  endDate: string;
  drivers: CarDriver[];
  observations: string;
}

interface RequestData {
  eventName: string;
  local: string;
  startDate: string;
  endDate: string;
  hotel: {
    enabled: boolean;
    guests: HotelGuest[];
    observations: string;
  };
  flight: {
    enabled: boolean;
    departureDate: string;
    returnDate: string;
    observations: string;
  };
  car: {
    enabled: boolean;
    rentals: CarRental[];
  };
}

// 🔥 Função principal: Salvar solicitação completa
export async function createRequest(data: RequestData) {
  const supabase = createClient();

  try {
    // 1. Criar a solicitação principal
    const { data: request, error: requestError } = await supabase
      .from("requests")
      .insert({
        event_name: data.eventName,
        location: data.local,
        start_date: data.startDate,
        end_date: data.endDate,
        status: "pending", // Sempre começa como pendente
      })
      .select()
      .single();

    if (requestError) throw requestError;

    const requestId = request.id;

    // 2. Se hotel estiver habilitado
    if (data.hotel.enabled) {
      // 2.1 Criar o registro de hotel
      const { data: hotel, error: hotelError } = await supabase
        .from("request_hotels")
        .insert({
          request_id: requestId,
          enabled: true,
          observations: data.hotel.observations,
        })
        .select()
        .single();

      if (hotelError) throw hotelError;

      // 2.2 Adicionar hóspedes ao hotel
      if (data.hotel.guests.length > 0) {
        const hotelGuests = data.hotel.guests.map((guest) => ({
          request_hotel_id: hotel.id,
          guest_id: guest.id,
        }));

        const { error: hotelGuestsError } = await supabase
          .from("hotel_guests")
          .insert(hotelGuests);

        if (hotelGuestsError) throw hotelGuestsError;
      }
    }

    // 3. Se passagem estiver habilitada
    if (data.flight.enabled) {
      const { error: flightError } = await supabase
        .from("request_flights")
        .insert({
          request_id: requestId,
          enabled: true,
          departure_date: data.flight.departureDate || null,
          return_date: data.flight.returnDate || null,
          observations: data.flight.observations,
        });

      if (flightError) throw flightError;
    }

    // 4. Se carro estiver habilitado
    if (data.car.enabled && data.car.rentals.length > 0) {
      // 4.1 Criar o cabeçalho de locação
      const { data: carHeader, error: carHeaderError } = await supabase
        .from("request_cars")
        .insert({
          request_id: requestId,
          enabled: true,
        })
        .select()
        .single();

      if (carHeaderError) throw carHeaderError;

      // 4.2 Para cada locação
      for (const rental of data.car.rentals) {
        // 4.2.1 Criar a locação
        const { data: carRental, error: rentalError } = await supabase
          .from("car_rentals")
          .insert({
            request_car_id: carHeader.id,
            start_date: rental.startDate,
            end_date: rental.endDate,
            observations: rental.observations,
          })
          .select()
          .single();

        if (rentalError) throw rentalError;

        // 4.2.2 Adicionar condutores à locação
        if (rental.drivers.length > 0) {
          const rentalDrivers = rental.drivers.map((driver) => ({
            car_rental_id: carRental.id,
            guest_id: driver.id,
          }));

          const { error: driversError } = await supabase
            .from("rental_drivers")
            .insert(rentalDrivers);

          if (driversError) throw driversError;
        }
      }
    }

    // 5. Retorna o ID da solicitação criada
    return { success: true, requestId };

  } catch (error) {
    console.error("Erro ao criar solicitação:", error);
    throw new Error(
      error instanceof Error 
        ? error.message 
        : "Falha ao criar solicitação"
    );
  }
}

// 🔍 Buscar todas as solicitações (para o dashboard)
export async function getRequests() {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("requests")
    .select(`
      *,
      request_hotels (
        id,
        enabled,
        observations,
        hotel_guests (
          guests (*)
        )
      ),
      request_flights (*),
      request_cars (
        id,
        enabled,
        car_rentals (
          *,
          rental_drivers (
            guests (*)
          )
        )
      )
    `)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Erro ao buscar solicitações:", error);
    throw new Error("Falha ao carregar solicitações");
  }

  return data;
}

// 🔍 Buscar uma solicitação específica (para página detalhada)
export async function getRequestById(id: string) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("requests")
    .select(`
      *,
      request_hotels (
        *,
        hotel_guests (
          guests (*)
        )
      ),
      request_flights (*),
      request_cars (
        *,
        car_rentals (
          *,
          rental_drivers (
            guests (*)
          )
        )
      )
    `)
    .eq("id", id)
    .single();

  if (error) {
    console.error("Erro ao buscar solicitação:", error);
    throw new Error("Falha ao carregar solicitação");
  }

  return data;
}

// 📊 Atualizar status da solicitação
export async function updateRequestStatus(id: string, status: "pending" | "in_progress" | "completed") {
  const supabase = createClient();

  const { error } = await supabase
    .from("requests")
    .update({ status })
    .eq("id", id);

  if (error) {
    console.error("Erro ao atualizar status:", error);
    throw new Error("Falha ao atualizar status");
  }

  return { success: true };
}