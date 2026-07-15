"use client";

interface MonthlyFilterProps {
  selectedMonth: string;
  onMonthChange: (month: string) => void;
  availableMonths: string[];
}

export default function MonthlyFilter({
  selectedMonth,
  onMonthChange,
  availableMonths,
}: MonthlyFilterProps) {
  console.log("📅 MonthlyFilter - availableMonths:", availableMonths);
  console.log("📅 MonthlyFilter - selectedMonth:", selectedMonth);

  return (
    <div className="flex items-center gap-3">
      <label className="text-sm font-medium text-gray-700">📅 Mês:</label>
      <select
        value={selectedMonth}
        onChange={(e) => {
          const newValue = e.target.value;
          console.log("📅 MonthlyFilter - onChange:", newValue);
          onMonthChange(newValue);
        }}
        className="rounded border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
      >
        <option value="all">Todos os meses</option>
        {availableMonths.map((month) => {
          // 🔥 GARANTE QUE O MÊS É UMA STRING LIMPA
          const cleanMonth = month.substring(0, 7);
          console.log("📅 Renderizando mês:", cleanMonth);
          return (
            <option key={cleanMonth} value={cleanMonth}>
              {new Date(cleanMonth + "-01").toLocaleDateString("pt-BR", {
                month: "long",
                year: "numeric",
              })}
            </option>
          );
        })}
      </select>
    </div>
  );
}