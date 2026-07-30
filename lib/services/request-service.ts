// lib/services/request-service.ts
import { createClient } from "@/lib/supabase/client";
import type { HotelGuest, CarDriver, CarRental } from "@/types/request";


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

/// lib/services/request-service.ts
export async function createRequest(data: RequestData) {
  const supabase = createClient();

  try {
    // 🔥 TASKS PADRÃO
    const defaultTasks = [
      { key: "hotel_reserved", label: "🏨 Hotel Reservado", completed: false, subtasks: [] },
      { key: "email_sent", label: "📧 Email Enviado", completed: false, subtasks: [] },
      { key: "car_reserved", label: "🚗 Reserva de Carro Realizada", completed: false, subtasks: [] },
      {
        key: "flight_issued",
        label: "✈️ Emissão da Passagem",
        completed: false,
        subtasks: [
          { key: "flight_purchase", label: "Compra", completed: false },
          { key: "flight_checkin", label: "Check-in", completed: false },
          { key: "flight_sent", label: "Envio para o passageiro", completed: false },
        ],
      },
    ];

    // 1. Criar a solicitação principal
    const { data: request, error: requestError } = await supabase
      .from("requests")
      .insert({
        event_name: data.eventName,
        location: data.local,
        start_date: data.startDate,
        end_date: data.endDate,
        status: "pending",
        tasks: defaultTasks,
      })
      .select()
      .single();

    if (requestError) {
      console.error("❌ Erro ao criar solicitação:", requestError);
      throw requestError;
    }

    const requestId = request.id;

    // 2. HOTEL
    if (data.hotel.enabled) {
      const { data: hotel, error: hotelError } = await supabase
        .from("request_hotels")
        .insert({
          request_id: requestId,
          enabled: true,
          observations: data.hotel.observations || "",
        })
        .select()
        .single();

      if (hotelError) {
        console.error("❌ Erro ao salvar hotel:", hotelError);
        throw hotelError;
      }

      if (data.hotel.guests && data.hotel.guests.length > 0) {
        const hotelGuests = data.hotel.guests.map((guest) => ({
          request_hotel_id: hotel.id,
          guest_id: guest.id,
        }));

        const { error: hotelGuestsError } = await supabase
          .from("hotel_guests")
          .insert(hotelGuests);

        if (hotelGuestsError) {
          console.error("❌ Erro ao salvar hóspedes do hotel:", hotelGuestsError);
          throw hotelGuestsError;
        }
      }
    }

    // 3. ✈️ PASSAGEM
    if (data.flight.enabled) {
      const { error: flightError } = await supabase
        .from("request_flights")
        .insert({
          request_id: requestId,
          enabled: true,
          departure_date: data.flight.departureDate || null,
          return_date: data.flight.returnDate || null,
          observations: data.flight.observations || "",
        })
        .select()
        .single();

      if (flightError) {
        console.error("❌ Erro ao salvar passagem:", flightError);
        throw flightError;
      }
    }

    // 4. 🚗 CARRO
    if (data.car.enabled && data.car.rentals && data.car.rentals.length > 0) {
      const { data: carHeader, error: carHeaderError } = await supabase
        .from("request_cars")
        .insert({
          request_id: requestId,
          enabled: true,
        })
        .select()
        .single();

      if (carHeaderError) {
        console.error("❌ Erro ao criar cabeçalho do carro:", carHeaderError);
        throw carHeaderError;
      }

      for (const rental of data.car.rentals) {
        const { data: carRental, error: rentalError } = await supabase
          .from("car_rentals")
          .insert({
            request_car_id: carHeader.id,
            start_date: rental.startDate,
            end_date: rental.endDate,
            observations: rental.observations || "",
          })
          .select()
          .single();

        if (rentalError) {
          console.error("❌ Erro ao salvar locação:", rentalError);
          throw rentalError;
        }

        if (rental.drivers && rental.drivers.length > 0) {
          const rentalDrivers = rental.drivers.map((driver) => ({
            car_rental_id: carRental.id,
            guest_id: driver.id,
          }));

          const { error: driversError } = await supabase
            .from("rental_drivers")
            .insert(rentalDrivers);

          if (driversError) {
            console.error("❌ Erro ao salvar condutores:", driversError);
            throw driversError;
          }
        }
      }
    }

    return { success: true, requestId };
  } catch (error) {
    console.error("❌ Erro ao criar solicitação:", error);
    throw new Error(
      error instanceof Error ? error.message : "Falha ao criar solicitação"
    );
  }
}
// lib/services/request-service.ts
// lib/services/request-service.ts
// lib/services/request-service.ts
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
          *,
          rental_drivers (
            guests (*)
          )
        )
      ),
      hotel_planning (
        id,
        hotel_name,
        check_in,
        check_out,
        rooms (
          id,
          type,
          periods,
          room_guests (
            guests (*)
          )
        )
      )
    `)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("❌ Erro ao buscar solicitações:", error);
    throw new Error(`Falha ao carregar solicitações: ${error.message}`);
  }

  return data;
}

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
      ),
      hotel_planning (
        id,
        hotel_name,
        check_in,
        check_out,
        rooms (
          id,
          type,
          periods,
          room_guests (
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
    console.error("❌ Erro ao buscar solicitação:", error);
    console.error("❌ Detalhes:", error.details);
    console.error("❌ Mensagem:", error.message);
    throw new Error("Falha ao carregar solicitação");
  }

  return data;
}

export async function updateRequestStatus(
  id: string,
  status: "pending" | "in_progress" | "completed"
) {
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

  const { error } = await supabase.from("requests").delete().eq("id", id);

  if (error) {
    console.error("Erro ao deletar solicitação:", error);
    throw new Error(`Falha ao deletar solicitação: ${error.message}`);
  }
}

// lib/services/request-service.ts (versão corrigida e simplificada)

export async function saveHotelPlanning(
  requestId: string,
  data: {
    hotelName: string;
    checkIn: string;
    checkOut: string;
    rooms: {
      type: string;
      periods: any[];
      guests: string[];
    }[];
  }
) {
  const supabase = createClient();

  try {
    // 1. Buscar ou criar planejamento
    const { data: existingPlanning, error: searchError } = await supabase
      .from("hotel_planning")
      .select("id")
      .eq("request_id", requestId)
      .maybeSingle();

    if (searchError) {
      console.error("❌ Erro ao buscar planejamento:", searchError);
      throw searchError;
    }

    let planningId: string;

    if (existingPlanning) {
      const { data: updated, error: updateError } = await supabase
        .from("hotel_planning")
        .update({
          hotel_name: data.hotelName,
          check_in: data.checkIn,
          check_out: data.checkOut,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingPlanning.id)
        .select()
        .single();

      if (updateError) {
        console.error("❌ Erro ao atualizar planejamento:", updateError);
        throw updateError;
      }
      planningId = updated.id;

      // Remove quartos antigos
      const { error: deleteError } = await supabase
        .from("rooms")
        .delete()
        .eq("hotel_planning_id", planningId);

      if (deleteError) {
        console.error("❌ Erro ao deletar quartos antigos:", deleteError);
        throw deleteError;
      }
    } else {
      const { data: newPlanning, error: insertError } = await supabase
        .from("hotel_planning")
        .insert({
          request_id: requestId,
          hotel_name: data.hotelName,
          check_in: data.checkIn,
          check_out: data.checkOut,
        })
        .select()
        .single();

      if (insertError) {
        console.error("❌ Erro ao criar planejamento:", insertError);
        throw insertError;
      }
      planningId = newPlanning.id;
    }

    // 2. Inserir quartos um por um (com validação)
    for (const room of data.rooms) {
      // 🔥 VALIDAÇÃO ESTRITA DOS DADOS
      const roomData = {
        hotel_planning_id: planningId,
        type: room.type,
        periods: Array.isArray(room.periods) ? room.periods : [],
      };

      // 🔥 VERIFICA SE OS DADOS SÃO VÁLIDOS
      if (!roomData.type || !['individual', 'duplo', 'triplo', 'quadruplo'].includes(roomData.type)) {
        console.warn("⚠️ Tipo de quarto inválido:", roomData.type);
        continue;
      }

      if (roomData.periods.length === 0) {
        console.warn("⚠️ Quarto sem períodos válidos, pulando...");
        continue;
      }

      const { data: insertedRoom, error: roomError } = await supabase
        .from("rooms")
        .insert(roomData)
        .select()
        .single();

      if (roomError) {
        console.error("❌ Erro detalhado ao salvar quarto:", {
          error: roomError,
          message: roomError.message,
          details: roomError.details,
          hint: roomError.hint,
        });
        throw roomError;
      }

      // 3. Associar hóspedes
      if (room.guests.length > 0 && insertedRoom) {
        const roomGuests = room.guests.map((guestId) => ({
          room_id: insertedRoom.id,
          guest_id: guestId,
        }));

        const { error: guestsError } = await supabase
          .from("room_guests")
          .insert(roomGuests);

        if (guestsError) {
          console.error("❌ Erro ao salvar hóspedes:", guestsError);
          throw guestsError;
        }

      }
    }

    return { success: true, planningId };
  } catch (error) {
    console.error("❌ Erro geral em saveHotelPlanning:", error);
    throw error;
  }
}

export async function getHotelPlanning(requestId: string) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("hotel_planning")
    .select(
      `
      *,
      rooms (
        *,
        room_guests (
          guests (*)
        )
      )
    `
    )
    .eq("request_id", requestId)
    .maybeSingle();

  if (error) {
    console.error("Erro ao buscar planejamento:", error);
    throw new Error("Falha ao carregar planejamento do hotel");
  }

  return data;
}

// ============================================
// FUNÇÕES DE COTAÇÕES
// ============================================

interface QuotationData {
  requestId: string;
  serviceType: 'hotel' | 'flight' | 'car';
  supplier: string;
  description: string;
  totalAmount: number;
  currency?: string;
  metadata?: any;
}

export async function addQuotation(data: QuotationData) {
  const supabase = createClient();

  const { data: quotation, error } = await supabase
    .from("quotations")
    .insert({
      request_id: data.requestId,
      service_type: data.serviceType,
      supplier: data.supplier,
      description: data.description,
      total_amount: data.totalAmount,
      currency: data.currency || 'BRL',
      metadata: data.metadata || {},
    })
    .select()
    .single();

  if (error) {
    console.error("Erro ao adicionar cotação:", error);
    throw new Error(`Falha ao adicionar cotação: ${error.message}`);
  }

  return quotation;
}

export async function getQuotations(requestId: string) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("quotations")
    .select("*")
    .eq("request_id", requestId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Erro ao buscar cotações:", error);
    throw new Error(`Falha ao carregar cotações: ${error.message}`);
  }

  return data;
}

export async function updateQuotationSelection(id: string, isSelected: boolean) {
  const supabase = createClient();

  // 🔥 CORREÇÃO: Use o nome correto da coluna no banco
  const { error } = await supabase
    .from("quotations")
    .update({ is_selected: isSelected }) // ← Use is_selected (com sublinhado)
    .eq("id", id);

  if (error) {
    console.error("Erro ao atualizar seleção:", error);
    throw new Error(`Falha ao atualizar seleção: ${error.message}`);
  }

  return { success: true };
}

export async function deleteQuotation(id: string) {
  const supabase = createClient();

  const { error } = await supabase
    .from("quotations")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Erro ao deletar cotação:", error);
    throw new Error(`Falha ao deletar cotação: ${error.message}`);
  }

  return { success: true };
}
export async function saveFlightPlanning(
  requestId: string,
  data: { legs: any[] }
) {
  const supabase = createClient();

  const { data: existing, error: searchError } = await supabase
    .from("flight_planning")
    .select("id")
    .eq("request_id", requestId)
    .maybeSingle();

  if (searchError) throw searchError;

  let planningId: string;

  if (existing) {
    const { data: updated, error: updateError } = await supabase
      .from("flight_planning")
      .update({ legs: data.legs, updated_at: new Date().toISOString() })
      .eq("id", existing.id)
      .select()
      .single();

    if (updateError) throw updateError;
    planningId = updated.id;
  } else {
    const { data: newPlanning, error: insertError } = await supabase
      .from("flight_planning")
      .insert({
        request_id: requestId,
        legs: data.legs,
      })
      .select()
      .single();

    if (insertError) throw insertError;
    planningId = newPlanning.id;
  }

  return { success: true, planningId };
}

export async function getFlightPlanning(requestId: string) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("flight_planning")
    .select("*")
    .eq("request_id", requestId)
    .maybeSingle();

  if (error) {
    console.error("Erro ao buscar planejamento de voo:", error);
    throw new Error("Falha ao carregar planejamento de voo");
  }

  return data;
}
// lib/services/request-service.ts

// 🔍 Buscar tasks de uma solicitação
// lib/services/request-service.ts

// 🔍 Buscar tasks de uma solicitação
export async function getTasks(requestId: string) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("requests")
    .select("tasks")
    .eq("id", requestId)
    .single();

  if (error) {
    console.error("Erro ao buscar tasks:", error);
    throw new Error("Falha ao carregar tasks");
  }

  return data?.tasks || [];
}


// 💾 Salvar tasks completas
export async function saveTasks(requestId: string, tasks: any[]) {
  const supabase = createClient();

  const { error } = await supabase
    .from("requests")
    .update({ tasks })
    .eq("id", requestId);

  if (error) {
    console.error("Erro ao salvar tasks:", error);
    throw new Error("Falha ao salvar tasks");
  }

  return { success: true };
}
// 🔄 Alternar status de uma task (com suporte a subitens)
export async function toggleTask(requestId: string, taskKey: string) {
  const supabase = createClient();

  // Buscar a solicitação
  const { data: request, error: fetchError } = await supabase
    .from("requests")
    .select("tasks")
    .eq("id", requestId)
    .single();

  if (fetchError) {
    console.error("Erro ao buscar solicitação:", fetchError);
    throw new Error("Falha ao buscar solicitação");
  }

  const tasks = request.tasks || [];
  const updatedTasks = tasks.map((task: any) => {
    if (task.key === taskKey) {
      return { ...task, completed: !task.completed };
    }
    return task;
  });

  // Salvar de volta
  const { error: updateError } = await supabase
    .from("requests")
    .update({ tasks: updatedTasks })
    .eq("id", requestId);

  if (updateError) {
    console.error("Erro ao atualizar task:", updateError);
    throw new Error("Falha ao atualizar task");
  }

  return { success: true, tasks: updatedTasks };
}

// 🔄 Reiniciar todas as tasks
export async function resetTasks(requestId: string) {
  const supabase = createClient();

  const defaultTasks = [
    { key: "hotel_reservation", label: "Reserva de hotel concluída", completed: false },
    { key: "flight_issued", label: "Passagem emitida", completed: false },
    { key: "car_reserved", label: "Carro reservado", completed: false },
    { key: "documents_sent", label: "Documentos enviados ao viajante", completed: false },
    { key: "hotel_quotation", label: "Cotação de hotel realizada", completed: false },
    { key: "flight_quotation", label: "Cotação de passagem realizada", completed: false },
    { key: "car_quotation", label: "Cotação de carro realizada", completed: false },
    { key: "manager_approval", label: "Aprovação do gestor obtida", completed: false },
  ];

  const { error } = await supabase
    .from("requests")
    .update({ tasks: defaultTasks })
    .eq("id", requestId);

  if (error) {
    console.error("Erro ao reiniciar tasks:", error);
    throw new Error("Falha ao reiniciar tasks");
  }

  return { success: true, tasks: defaultTasks };
}
// lib/services/request-service.ts (adicione no final)


export async function searchHotels(query: string, city?: string) {
  const supabase = createClient();

  let supabaseQuery = supabase
    .from("hotels")
    .select("*")
    .ilike("name", `%${query}%`)
    .order("name", { ascending: true })
    .limit(10);

  const { data, error } = await supabaseQuery;

  if (error) {
    console.error("❌ Erro ao buscar hotéis:", error);
    throw new Error("Falha ao buscar hotéis");
  }

  return data || [];
}

// lib/services/request-service.ts
export async function addHotel(hotelData: {
  name: string;
  city: string;
  state?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
}) {
  const supabase = createClient();

  // 🔥 SE A CIDADE VIER NO FORMATO "Cidade-Estado", EXTRAI SEPARADO
  let city = hotelData.city.trim();
  let state = hotelData.state || "";

  if (city.includes("-") && !state) {
    const parts = city.split("-");
    city = parts[0].trim();
    state = parts[1].trim();
  }

  // Verifica se já existe um hotel com o mesmo nome e cidade
  const { data: existing, error: checkError } = await supabase
    .from("hotels")
    .select("id")
    .eq("name", hotelData.name)
    .eq("city", hotelData.city)
    .maybeSingle();

  if (checkError) {
    console.error("Erro ao verificar hotel existente:", checkError);
    throw checkError;
  }

  if (existing) {
    // Retorna o hotel existente
    const { data, error } = await supabase
      .from("hotels")
      .select("*")
      .eq("id", existing.id)
      .single();

    if (error) {
      console.error("Erro ao buscar hotel existente:", error);
      throw error;
    }
    return data;
  }

  // Insere novo hotel
  const { data, error } = await supabase
    .from("hotels")
    .insert({
      name: hotelData.name.trim(),
      city: hotelData.city.trim(),
      state: hotelData.state || null,
      address: hotelData.address || null,
      phone: hotelData.phone || null,
      email: hotelData.email || null,
      website: hotelData.website || null,
    })
    .select()
    .single();

  if (error) {
    console.error("Erro ao adicionar hotel:", error);
    throw new Error("Falha ao adicionar hotel");
  }

  return data;
}
export async function saveCarPlanning(
  requestId: string,
  data: { rentals: any[] }
) {
  const supabase = createClient();

  const { data: existing, error: searchError } = await supabase
    .from("car_planning")
    .select("id")
    .eq("request_id", requestId)
    .maybeSingle();

  if (searchError) throw searchError;

  let planningId: string;

  if (existing) {
    const { data: updated, error: updateError } = await supabase
      .from("car_planning")
      .update({ rentals: data.rentals, updated_at: new Date().toISOString() })
      .eq("id", existing.id)
      .select()
      .single();

    if (updateError) throw updateError;
    planningId = updated.id;
  } else {
    const { data: newPlanning, error: insertError } = await supabase
      .from("car_planning")
      .insert({
        request_id: requestId,
        rentals: data.rentals,
      })
      .select()
      .single();

    if (insertError) throw insertError;
    planningId = newPlanning.id;
  }

  return { success: true, planningId };
}

export async function getCarPlanning(requestId: string) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("car_planning")
    .select("*")
    .eq("request_id", requestId)
    .maybeSingle();

  if (error) {
    console.error("Erro ao buscar planejamento de carro:", error);
    throw new Error("Falha ao carregar planejamento de carro");
  }

  return data;
}
export async function updateRequest(id: string, data: RequestData) {
  const supabase = createClient();

  try {
    // 1. Atualizar a solicitação principal
    const { error: requestError } = await supabase
      .from("requests")
      .update({
        event_name: data.eventName,
        location: data.local,
        start_date: data.startDate,
        end_date: data.endDate,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (requestError) throw requestError;

    // 2. Buscar os registros relacionados existentes
    const { data: existingHotel, error: hotelError } = await supabase
      .from("request_hotels")
      .select("id")
      .eq("request_id", id)
      .maybeSingle();

    if (hotelError) throw hotelError;

    // 3. Atualizar ou criar hotel
    if (data.hotel.enabled) {
      if (existingHotel) {
        // Atualiza hotel existente
        const { error: updateHotelError } = await supabase
          .from("request_hotels")
          .update({
            enabled: true,
            observations: data.hotel.observations,
          })
          .eq("id", existingHotel.id);

        if (updateHotelError) throw updateHotelError;

        // Remove hóspedes antigos
        const { error: deleteGuestsError } = await supabase
          .from("hotel_guests")
          .delete()
          .eq("request_hotel_id", existingHotel.id);

        if (deleteGuestsError) throw deleteGuestsError;

        // Adiciona novos hóspedes
        if (data.hotel.guests.length > 0) {
          const hotelGuests = data.hotel.guests.map((guest) => ({
            request_hotel_id: existingHotel.id,
            guest_id: guest.id,
          }));

          const { error: insertGuestsError } = await supabase
            .from("hotel_guests")
            .insert(hotelGuests);

          if (insertGuestsError) throw insertGuestsError;
        }
      } else {
        // Cria novo hotel
        const { data: newHotel, error: createHotelError } = await supabase
          .from("request_hotels")
          .insert({
            request_id: id,
            enabled: true,
            observations: data.hotel.observations,
          })
          .select()
          .single();

        if (createHotelError) throw createHotelError;

        if (data.hotel.guests.length > 0) {
          const hotelGuests = data.hotel.guests.map((guest) => ({
            request_hotel_id: newHotel.id,
            guest_id: guest.id,
          }));

          const { error: insertGuestsError } = await supabase
            .from("hotel_guests")
            .insert(hotelGuests);

          if (insertGuestsError) throw insertGuestsError;
        }
      }
    } else if (existingHotel) {
      // Se hotel foi desabilitado, remove
      await supabase.from("request_hotels").delete().eq("id", existingHotel.id);
    }

    // 4. Passagem (similar ao hotel, mas mais simples)
    const { data: existingFlight, error: flightError } = await supabase
      .from("request_flights")
      .select("id")
      .eq("request_id", id)
      .maybeSingle();

    if (flightError) throw flightError;

    if (data.flight.enabled) {
      const flightData = {
        enabled: true,
        departure_date: data.flight.departureDate || null,
        return_date: data.flight.returnDate || null,
        observations: data.flight.observations,
      };

      if (existingFlight) {
        await supabase
          .from("request_flights")
          .update(flightData)
          .eq("id", existingFlight.id);
      } else {
        await supabase
          .from("request_flights")
          .insert({
            request_id: id,
            ...flightData,
          });
      }
    } else if (existingFlight) {
      await supabase.from("request_flights").delete().eq("id", existingFlight.id);
    }

    // 5. Carro (similar ao hotel, mas com múltiplas locações)
    const { data: existingCar, error: carError } = await supabase
      .from("request_cars")
      .select("id")
      .eq("request_id", id)
      .maybeSingle();

    if (carError) throw carError;

    if (data.car.enabled && data.car.rentals.length > 0) {
      let carId: string;

      if (existingCar) {
        carId = existingCar.id;
        // Remove locações antigas
        await supabase.from("car_rentals").delete().eq("request_car_id", carId);
      } else {
        const { data: newCar, error: createCarError } = await supabase
          .from("request_cars")
          .insert({
            request_id: id,
            enabled: true,
          })
          .select()
          .single();

        if (createCarError) throw createCarError;
        carId = newCar.id;
      }

      // Adiciona novas locações
      for (const rental of data.car.rentals) {
        const { data: carRental, error: rentalError } = await supabase
          .from("car_rentals")
          .insert({
            request_car_id: carId,
            start_date: rental.startDate,
            end_date: rental.endDate,
            observations: rental.observations,
          })
          .select()
          .single();

        if (rentalError) throw rentalError;

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
    } else if (existingCar) {
      await supabase.from("request_cars").delete().eq("id", existingCar.id);
    }

    return { success: true };
  } catch (error) {
    console.error("❌ Erro ao atualizar solicitação:", error);
    throw new Error(
      error instanceof Error ? error.message : "Falha ao atualizar solicitação"
    );
  }
}