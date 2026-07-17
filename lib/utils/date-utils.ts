// lib/utils/date-utils.ts

/**
 * 🔥 EXTRAI O MÊS (YYYY-MM) DE UMA STRING ISO.
 * Exemplo: "2026-09-17" → "2026-09"
 */
export function getMonthFromDate(dateString: string): string {
  if (!dateString) return "";
  return dateString.substring(0, 7);
}

/**
 * 🔥 COMPARA SE O MÊS DE UMA DATA CORRESPONDE AO MÊS SELECIONADO.
 * Ambos os valores são strings no formato YYYY-MM.
 */
export function matchesMonth(dateString: string, selectedMonth: string): boolean {
  if (!dateString || !selectedMonth) return false;
  return getMonthFromDate(dateString) === selectedMonth;
}

/**
 * 🔥 GERA A LISTA DE MESES DISPONÍVEIS A PARTIR DE UM ARRAY DE SOLICITAÇÕES.
 * Retorna um array de objetos com índice e valor do mês.
 */
export function getAvailableMonths(requests: any[]): { index: number; value: string; label: string }[] {
  const monthsSet = new Set<string>();
  requests.forEach((r) => {
    if (r.start_date) {
      const month = getMonthFromDate(r.start_date);
      if (month) monthsSet.add(month);
    }
  });
  const sortedMonths = Array.from(monthsSet).sort();
  return sortedMonths.map((month, index) => ({
    index: index + 1, // Começa em 1 para evitar conflito com "all" (0)
    value: month,
    label: new Date(month + "-01").toLocaleDateString("pt-BR", {
      month: "long",
      year: "numeric",
    }),
  }));
}

/**
 * 🔥 RETORNA O MÊS CORRESPONDENTE A UM ÍNDICE.
 */
export function getMonthByIndex(months: { index: number; value: string }[], index: number): string | null {
  const found = months.find((m) => m.index === index);
  return found ? found.value : null;
}

/**
 * 🔥 RETORNA O ÍNDICE CORRESPONDENTE A UM MÊS.
 */
export function getIndexByMonth(months: { index: number; value: string }[], monthValue: string): number | null {
  const found = months.find((m) => m.value === monthValue);
  return found ? found.index : null;
}
export function formatDateBR(dateString: string): string {
  if (!dateString) return "Data não informada";
  const parts = dateString.split("-");
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return dateString;
}