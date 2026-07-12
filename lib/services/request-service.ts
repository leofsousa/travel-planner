// lib/services/request-service.ts
import { createClient } from "@/lib/supabase/client";

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

// lib/services/request-service.ts
// lib/services/request-service.ts

export async function createRequest(data: RequestData) {
  const supabase = createClient();

  try {
    // 🔥 NOVA ESTRUTURA DE TASKS (com subitens)
    const defaultTasks = [
      {
        key: "hotel_reserved",
        label: "🏨 Hotel Reservado",
        completed: false,
        subtasks: []
      },
      {
        key: "email_sent",
        label: "📧 Email Enviado",
        completed: false,
        subtasks: []
      },
      {
        key: "car_reserved",
        label: "🚗 Reserva de Carro Realizada",
        completed: false,
        subtasks: []
      },
      {
        key: "flight_issued",
        label: "✈️ Emissão da Passagem",
        completed: false,
        subtasks: [
          {
            key: "flight_purchase",
            label: "Compra",
            completed: false
          },
          {
            key: "flight_checkin",
            label: "Check-in",
            completed: false
          },
          {
            key: "flight_sent",
            label: "Envio para o passageiro",
            completed: false
          }
        ]
      }
    ];

    // 1. Criar a solicitação com as tasks
    const { data: request, error: requestError } = await supabase
      .from("requests")
      .insert({
        event_name: data.eventName,
        location: data.local,
        start_date: data.startDate,
        end_date: data.endDate,
        status: "pending",
        tasks: defaultTasks, // ← AGORA COM A NOVA ESTRUTURA
      })
      .select()
      .single();

    if (requestError) {
      console.error("Erro ao criar solicitação:", requestError);
      throw requestError;
    }

    const requestId = request.id;

    // ... (resto do código: hotel, flight, car)

    console.log("✅ Solicitação criada com sucesso! ID:", requestId);
    return { success: true, requestId };
  } catch (error) {
    console.error("❌ Erro ao criar solicitação:", error);
    throw new Error(
      error instanceof Error ? error.message : "Falha ao criar solicitação"
    );
  }
}
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

export async function saveHotelPlanning(
  requestId: string,
  data: {
    hotelName: string;
    checkIn: string;
    checkOut: string;
    rooms: {
      type: string;
      dailyRate: number;
      guests: string[];
    }[];
  }
) {
  const supabase = createClient();

  const { data: existingPlanning, error: searchError } = await supabase
    .from("hotel_planning")
    .select("id")
    .eq("request_id", requestId)
    .maybeSingle();

  if (searchError) throw searchError;

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

    if (updateError) throw updateError;
    planningId = updated.id;

    const { error: deleteError } = await supabase
      .from("rooms")
      .delete()
      .eq("hotel_planning_id", planningId);

    if (deleteError) throw deleteError;
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

    if (insertError) throw insertError;
    planningId = newPlanning.id;
  }

  for (const room of data.rooms) {
    const { data: roomData, error: roomError } = await supabase
      .from("rooms")
      .insert({
        hotel_planning_id: planningId,
        type: room.type,
        daily_rate: room.dailyRate,
      })
      .select()
      .single();

    if (roomError) throw roomError;

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

  // Se estiver selecionando, desmarca todas as outras do mesmo tipo
  if (isSelected) {
    // Primeiro, busca a cotação para saber o tipo de serviço
    const { data: quotation, error: fetchError } = await supabase
      .from("quotations")
      .select("request_id, service_type")
      .eq("id", id)
      .single();

    if (fetchError) throw fetchError;

    // Desmarca todas as outras do mesmo serviço
    const { error: updateError } = await supabase
      .from("quotations")
      .update({ is_selected: false })
      .eq("request_id", quotation.request_id)
      .eq("service_type", quotation.service_type)
      .neq("id", id);

    if (updateError) throw updateError;
  }

  // Seleciona/desmarca a cotação atual
  const { error } = await supabase
    .from("quotations")
    .update({ is_selected })
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