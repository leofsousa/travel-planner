// lib/services/hotel-service.ts
import { createClient } from "@/lib/supabase/client";

export interface Hotel {
  id: string;
  name: string;
  city: string;
  state?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  created_at: string;
  updated_at: string;
}

// 🔍 Buscar todos os hotéis
export async function getHotels(): Promise<Hotel[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("hotels")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    console.error("Erro ao buscar hotéis:", error);
    throw new Error("Falha ao carregar hotéis");
  }

  return data || [];
}

// 🔍 Buscar hotéis por cidade
export async function getHotelsByCity(city: string): Promise<Hotel[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("hotels")
    .select("*")
    .ilike("city", `%${city}%`)
    .order("name", { ascending: true });

  if (error) {
    console.error("Erro ao buscar hotéis por cidade:", error);
    throw new Error("Falha ao carregar hotéis");
  }

  return data || [];
}

// ➕ Criar hotel
export async function createHotel(data: Omit<Hotel, "id" | "created_at" | "updated_at">): Promise<Hotel> {
  const supabase = createClient();

  // Verifica duplicata
  const { data: existing, error: checkError } = await supabase
    .from("hotels")
    .select("id")
    .eq("name", data.name)
    .eq("city", data.city)
    .maybeSingle();

  if (checkError) {
    console.error("Erro ao verificar duplicata:", checkError);
    throw checkError;
  }

  if (existing) {
    throw new Error(`Hotel "${data.name}" já cadastrado em ${data.city}`);
  }

  const { data: hotel, error } = await supabase
    .from("hotels")
    .insert({
      name: data.name.trim(),
      city: data.city.trim(),
      state: data.state || null,
      address: data.address || null,
      phone: data.phone || null,
      email: data.email || null,
      website: data.website || null,
    })
    .select()
    .single();

  if (error) {
    console.error("Erro ao criar hotel:", error);
    throw new Error("Falha ao criar hotel");
  }

  return hotel;
}

// ✏️ Atualizar hotel
export async function updateHotel(id: string, data: Partial<Omit<Hotel, "id" | "created_at" | "updated_at">>): Promise<Hotel> {
  const supabase = createClient();

  // Verifica duplicata (exceto o próprio hotel)
  if (data.name && data.city) {
    const { data: existing, error: checkError } = await supabase
      .from("hotels")
      .select("id")
      .eq("name", data.name)
      .eq("city", data.city)
      .neq("id", id)
      .maybeSingle();

    if (checkError) {
      console.error("Erro ao verificar duplicata:", checkError);
      throw checkError;
    }

    if (existing) {
      throw new Error(`Hotel "${data.name}" já cadastrado em ${data.city}`);
    }
  }

  const { data: hotel, error } = await supabase
    .from("hotels")
    .update({
      ...data,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Erro ao atualizar hotel:", error);
    throw new Error("Falha ao atualizar hotel");
  }

  return hotel;
}

// 🗑️ Deletar hotel
export async function deleteHotel(id: string): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase
    .from("hotels")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Erro ao deletar hotel:", error);
    throw new Error("Falha ao deletar hotel");
  }
}