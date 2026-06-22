// lib/services/guest-service.ts
import { createClient } from "@/lib/supabase/client";
import type { Guest } from "@/types/guest";

let cachedGuests: Guest[] | null = null;
let cacheTimestamp: number | null = null;
const CACHE_TTL = 5 * 60 * 1000;

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
    console.error("Erro detalhado do Supabase:", {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint,
    });
    
    // Mensagens mais específicas para o usuário
    if (error.code === "42P01") {
      throw new Error("Tabela 'guests' não encontrada. Verifique se a tabela foi criada no Supabase.");
    } else if (error.code === "42501") {
      throw new Error("Permissão negada. Verifique as políticas RLS da tabela 'guests'.");
    } else {
      throw new Error(`Erro ao buscar hóspedes: ${error.message}`);
    }
  }

  cachedGuests = data || [];
  cacheTimestamp = Date.now();
  
  return cachedGuests;
}

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
    console.error("Erro detalhado ao criar hóspede:", error);
    throw new Error(`Falha ao criar hóspede: ${error.message}`);
  }

  clearGuestCache();
  return data;
}

export function clearGuestCache() {
  cachedGuests = null;
  cacheTimestamp = null;
}