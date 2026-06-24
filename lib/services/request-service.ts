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
// lib/services/request-service.ts
export async function getRequestById(id: string) {
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
          id,
          guests (
            id,
            full_name,
            document
          )
        )
      ),
      request_flights (
        id,
        enabled,
        departure_date,
        return_date,
        observations
      ),
      request_cars (
        id,
        enabled,
        car_rentals (
          id,
          start_date,
          end_date,
          observations,
          rental_drivers (
            id,
            guests (
              id,
              full_name,
              document
            )
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

  // 🔥 LOG TEMPORÁRIO - vai aparecer no console do navegador
  console.log("🔍 DADOS COMPLETOS:", JSON.stringify(data, null, 2));
  console.log("🔍 HOTEL:", data.request_hotels);
  console.log("🔍 ENABLED:", data.request_hotels?.enabled);

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

export async function deleteRequest(id: string): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase
    .from("requests")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Erro ao deletar solicitação:", error);
    throw new Error(`Falha ao deletar solicitação: ${error.message}`);
  }
}
// lib/services/request-service.ts (adicione no final)

// Salvar planejamento do hotel
export async function saveHotelPlanning(
  requestId: string,
  data: {
    hotelName: string;
    checkIn: string;
    checkOut: string;
    rooms: {
      type: string;
      dailyRate: number;
      guests: string[]; // IDs dos hóspedes
    }[];
  }
) {
  const supabase = createClient();

  // 1. Criar o planejamento do hotel
  const { data: planning, error: planningError } = await supabase
    .from("hotel_planning")
    .insert({
      request_id: requestId,
      hotel_name: data.hotelName,
      check_in: data.checkIn,
      check_out: data.checkOut,
    })
    .select()
    .single();

  if (planningError) throw planningError;

  // 2. Para cada quarto
  for (const room of data.rooms) {
    const { data: roomData, error: roomError } = await supabase
      .from("rooms")
      .insert({
        hotel_planning_id: planning.id,
        type: room.type,
        daily_rate: room.dailyRate,
      })
      .select()
      .single();

    if (roomError) throw roomError;

    // 3. Associar hóspedes ao quarto
    if (room.guests.length > 0) {
      const roomGuests = room.guests.map((guestId) => ({
        room_id: roomData.id,
        guest_id: guestId,
      }));

      const { error: guestsError } = await supabase
        .from("room_guests")
        .insert(roomGuests);

      if (guestsError) throw guestsError;
    }
  }

  return { success: true };
}

// Buscar planejamento do hotel
export async function getHotelPlanning(requestId: string) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("hotel_planning")
    .select(`
      *,
      rooms (
        *,
        room_guests (
          guests (*)
        )
      )
    `)
    .eq("request_id", requestId)
    .maybeSingle();

  if (error) {
    console.error("Erro ao buscar planejamento:", error);
    throw new Error("Falha ao carregar planejamento do hotel");
  }

  return data;
}