"use client";

import * as XLSX from "xlsx";

interface Request {
  id: string;
  event_name: string;
  location: string;
  start_date: string;
  end_date: string;
  status: string;
  created_at: string;
  hotel_planning?: any[];
}

interface ExportButtonProps {
  requests: Request[];
  selectedMonth: string;
}

export default function ExportButton({ requests, selectedMonth }: ExportButtonProps) {
  const handleExport = () => {
    // Prepara os dados para a planilha
    const data = requests.map((r) => {
      // Calcula o valor total do hotel
      let hotelCost = 0;
      if (r.hotel_planning?.[0]?.rooms) {
        const rooms = r.hotel_planning[0].rooms || [];
        rooms.forEach((room: any) => {
          const periods = room.periods || [];
          periods.forEach((period: any) => {
            const start = new Date(period.startDate);
            const end = new Date(period.endDate);
            const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
            hotelCost += days * period.dailyRate;
          });
        });
      }

      return {
        "Evento": r.event_name,
        "Local": r.location,
        "Status": r.status === "pending" ? "📋 A Fazer" :
                  r.status === "in_progress" ? "⏳ Em Andamento" : "✅ Concluída",
        "Data Início": new Date(r.start_date).toLocaleDateString("pt-BR"),
        "Data Fim": new Date(r.end_date).toLocaleDateString("pt-BR"),
        "Criado em": new Date(r.created_at).toLocaleString("pt-BR"),
        "Valor Total (R$)": hotelCost.toFixed(2),
      };
    });

    // Cria a planilha
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(wb, ws, "Viagens");

    // Gera o arquivo
    const fileName = `viagens_${selectedMonth === "all" ? "todos" : selectedMonth}.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

  return (
    <button
      onClick={handleExport}
      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium flex items-center gap-2"
    >
      📊 Exportar XLSX
    </button>
  );
}