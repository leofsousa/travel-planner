// lib/utils/string-utils.ts

/**
 * Separa uma string no formato "Cidade-Estado" em um objeto { city, state }.
 * Exemplo: "Goiânia-GO" → { city: "Goiânia", state: "GO" }
 * Exemplo: "São Paulo-SP" → { city: "São Paulo", state: "SP" }
 */
export function splitCityAndState(input: string): { city: string; state: string | null } {
    if (!input) return { city: "", state: null };
  
    // Remove espaços extras
    const trimmed = input.trim();
  
    // Tenta encontrar o padrão "Cidade-Estado" (ex: "Goiânia-GO")
    const match = trimmed.match(/^(.*?)\s*-\s*([A-Z]{2})$/);
  
    if (match) {
      return {
        city: match[1].trim(),
        state: match[2].trim().toUpperCase(),
      };
    }
  
    // Se não encontrar o padrão, retorna o texto como cidade
    return {
      city: trimmed,
      state: null,
    };
  }