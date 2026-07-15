export function formatDateBR(dateString: string): string {
    if (!dateString) return "Data não informada";
    const parts = dateString.split("-");
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateString;
  }
  
  /**
   * Extrai o mês no formato YYYY-MM de uma data ISO.
   */
  export function getMonthFromDate(dateString: string): string {
    if (!dateString) return "";
    return dateString.substring(0, 7);
  }
  
  /**
   * Calcula o número de dias entre duas datas ISO, sem conversão de fuso.
   */
  export function calculateDays(startDate: string, endDate: string): number {
    const startParts = startDate.split("-").map(Number);
    const endParts = endDate.split("-").map(Number);
    const start = new Date(startParts[0], startParts[1] - 1, startParts[2]);
    const end = new Date(endParts[0], endParts[1] - 1, endParts[2]);
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  }