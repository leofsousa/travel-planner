// app/control-panel/components/monthly-filter.tsx
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
  console.log("📅 MonthlyFilter - selectedMonth (recebido):", selectedMonth);
  console.log("📅 MonthlyFilter - availableMonths:", availableMonths);

  availableMonths.forEach((month) => {
    const d = new Date(month + "-01");

    console.log({
      month,
      date: d,
      locale: d.toLocaleDateString("pt-BR", {
        month: "long",
        year: "numeric",
      }),
    });
  });
  return (
    <div className="flex items-center gap-3">
      <label className="text-sm font-medium text-gray-700">📅 Mês:</label>
      <select
        value={selectedMonth}
        onChange={(e) => {
          console.log("🔥🔥🔥 onChange DISPARADO! Novo valor:", e.target.value);
          onMonthChange(e.target.value);
        }}
        className="rounded border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
      >
        <option value="all">Todos os meses</option>
        {availableMonths.map((month) => {
          const [year, m] = month.split("-").map(Number);

          return (
            <option key={month} value={month}>
              {new Date(year, m - 1, 1).toLocaleDateString("pt-BR", {
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