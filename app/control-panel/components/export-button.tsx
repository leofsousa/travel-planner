// app/control-panel/components/export-button.tsx
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
  request_flights?: any;
  request_cars?: any;
}

interface ExportButtonProps {
  requests: Request[];
  selectedMonth: string;
}

export default function ExportButton({ requests, selectedMonth }: ExportButtonProps) {
  const handleExport = () => {
    // 🔥 1. CALCULAR TOTAIS
    let totalCost = 0;
    let totalCarRentals = 0;
    let totalFlights = 0;

    const data = requests.map((r) => {
      let hotelCost = 0;
      let carCount = 0;
      let flightCount = 0;

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

      if (r.request_cars?.enabled && r.request_cars?.car_rentals) {
        carCount = r.request_cars.car_rentals.length || 0;
      }
      if (r.request_flights?.enabled) {
        flightCount = 1;
      }

      totalCost += hotelCost;
      totalCarRentals += carCount;
      totalFlights += flightCount;

      return {
        "Evento": r.event_name,
        "Local": r.location,
        "Status": r.status === "pending" ? "📋 A Fazer" :
                  r.status === "in_progress" ? "⏳ Em Andamento" : "✅ Concluída",
        "Data Início": new Date(r.start_date).toLocaleDateString("pt-BR"),
        "Data Fim": new Date(r.end_date).toLocaleDateString("pt-BR"),
        "Criado em": new Date(r.created_at).toLocaleString("pt-BR"),
        "Custo Hotel (R$)": hotelCost.toFixed(2),
        "Qtd. Carros": carCount,
        "Qtd. Passagens": flightCount,
      };
    });

    // 🔥 2. CRIAR PLANILHA
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(data);

    // 🔥 3. DEFINIR LARGURA DAS COLUNAS
    ws["!cols"] = [
      { wch: 30 }, // Evento
      { wch: 25 }, // Local
      { wch: 18 }, // Status
      { wch: 15 }, // Data Início
      { wch: 15 }, // Data Fim
      { wch: 25 }, // Criado em
      { wch: 18 }, // Custo Hotel
      { wch: 15 }, // Qtd. Carros
      { wch: 18 }, // Qtd. Passagens
    ];

    // 🔥 4. ADICIONAR LINHA DE TOTAIS
    const totalRow = {
      "Evento": "📊 TOTAL DO MÊS",
      "Local": "",
      "Status": "",
      "Data Início": "",
      "Data Fim": "",
      "Criado em": "",
      "Custo Hotel (R$)": totalCost.toFixed(2),
      "Qtd. Carros": totalCarRentals,
      "Qtd. Passagens": totalFlights,
    };

    // Adiciona a linha de totais no final
    const totalRowArray = [
      totalRow["Evento"],
      totalRow["Local"],
      totalRow["Status"],
      totalRow["Data Início"],
      totalRow["Data Fim"],
      totalRow["Criado em"],
      totalRow["Custo Hotel (R$)"],
      totalRow["Qtd. Carros"],
      totalRow["Qtd. Passagens"],
    ];
    XLSX.utils.sheet_add_aoa(ws, [totalRowArray], { origin: -1 });

    // 🔥 5. NOMEAR A PLANILHA
    const sheetName = selectedMonth === "all" ? "Todos os meses" : selectedMonth;
    wb.SheetNames = [sheetName];
    wb.Sheets = { [sheetName]: ws };

    // 🔥 6. GERAR ARQUIVO
    const fileName = `relatorio_${selectedMonth === "all" ? "todos" : selectedMonth}.xlsx`;
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