// lib/services/guest-service.ts
import { createClient } from "@/lib/supabase/client";
import type { Guest } from "@/types/guest";

let cachedGuests: Guest[] | null = null;
let cacheTimestamp: number | null = null;
const CACHE_TTL = 5 * 60 * 1000;

// 🔍 BUSCAR TODOS
export async function getGuests(): Promise<Guest[]> {
  if (cachedGuests && cacheTimestamp && Date.now() - cacheTimestamp < CACHE_TTL) {
    return cachedGuests;
  }

  const supabase = createClient();
  
  const { data, error } = await supabase
    .from("guests")
    .select("*")
    .order("full_name", { ascending: true });

  if (error) {
    console.error("Erro ao buscar hóspedes:", error);
    throw new Error("Falha ao carregar lista de hóspedes");
  }

  cachedGuests = data || [];
  cacheTimestamp = Date.now();
  
  return cachedGuests;
}

// Criar Hóspede
export async function createGuest(data: {
  full_name: string;
  document?: string;
  email?: string;
}): Promise<Guest> {
  const supabase = createClient();
  
  // 🔥 Só verifica duplicata se documento foi fornecido
  if (data.document) {
    const { data: existing } = await supabase
      .from("guests")
      .select("id")
      .eq("document", data.document)
      .maybeSingle();

    if (existing) {
      throw new Error("Já existe um hóspede com este documento");
    }
  }

  const { data: guest, error } = await supabase
    .from("guests")
    .insert({
      full_name: data.full_name.trim(),
      document: data.document?.trim() || null,
      email: data.email?.trim() || null,
    })
    .select()
    .single();

  if (error) {
    console.error("Erro ao criar hóspede:", error);
    throw new Error(`Falha ao criar hóspede: ${error.message}`);
  }

  clearGuestCache();
  return guest;
}

// ✏️ ATUALIZAR
export async function updateGuest(id: string, data: {
  full_name: string;
  document?: string;
  email?: string;
}): Promise<Guest> {
  const supabase = createClient();

  // 🔥 Só verifica duplicata se documento foi fornecido e não é vazio
  if (data.document) {
    const { data: existing } = await supabase
      .from("guests")
      .select("id")
      .eq("document", data.document)
      .neq("id", id)
      .maybeSingle();

    if (existing) {
      throw new Error("Já existe um hóspede com este documento");
    }
  }

  const { data: guest, error } = await supabase
    .from("guests")
    .update({
      full_name: data.full_name.trim(),
      document: data.document?.trim() || null,
      email: data.email?.trim() || null,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Erro ao atualizar hóspede:", error);
    throw new Error(`Falha ao atualizar hóspede: ${error.message}`);
  }

  clearGuestCache();
  return guest;
}

// 🗑️ DELETAR
export async function deleteGuest(id: string): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase
    .from("guests")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Erro ao deletar hóspede:", error);
    throw new Error(`Falha ao deletar hóspede: ${error.message}`);
  }

  clearGuestCache();
}

// 🧹 LIMPAR CACHE
export function clearGuestCache() {
  cachedGuests = null;
  cacheTimestamp = null;
}