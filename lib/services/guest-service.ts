// lib/services/guest-service.ts
import { createClient } from "@/lib/supabase/client";
import type { Guest } from "@/types/guest";

let cachedGuests: Guest[] | null = null;
let cacheTimestamp: number | null = null;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutos

export async function getGuests(): Promise<Guest[]> {
  // Verifica cache válido
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

export function clearGuestCache() {
  cachedGuests = null;
  cacheTimestamp = null;
}