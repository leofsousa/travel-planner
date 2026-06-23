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

// ➕ CRIAR
export async function createGuest(name: string, document: string): Promise<Guest> {
  const supabase = createClient();
  
  const { data: existing } = await supabase
    .from("guests")
    .select("id")
    .eq("document", document)
    .maybeSingle();

  if (existing) {
    throw new Error("Já existe um hóspede com este documento");
  }

  const { data, error } = await supabase
    .from("guests")
    .insert({
      full_name: name.trim(),
      document: document.trim(),
    })
    .select()
    .single();

  if (error) {
    console.error("Erro ao criar hóspede:", error);
    throw new Error(`Falha ao criar hóspede: ${error.message}`);
  }

  clearGuestCache();
  return data;
}

// ✏️ ATUALIZAR
export async function updateGuest(id: string, name: string, document: string): Promise<Guest> {
  const supabase = createClient();

  // Verifica se o documento já existe em outro registro
  const { data: existing } = await supabase
    .from("guests")
    .select("id")
    .eq("document", document)
    .neq("id", id)
    .maybeSingle();

  if (existing) {
    throw new Error("Já existe um hóspede com este documento");
  }

  const { data, error } = await supabase
    .from("guests")
    .update({
      full_name: name.trim(),
      document: document.trim(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Erro ao atualizar hóspede:", error);
    throw new Error(`Falha ao atualizar hóspede: ${error.message}`);
  }

  clearGuestCache();
  return data;
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