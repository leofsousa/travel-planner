// app/control-panel/components/monthly-filter.tsx
"use client";

import { useState } from "react";

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
  const [tempMonth, setTempMonth] = useState(selectedMonth);

  const handleApply = () => {
    onMonthChange(tempMonth);
  };

  return (
    <div className="flex items-center gap-3">
      <label className="text-sm font-medium text-gray-700">📅 Mês:</label>
      <select
        value={tempMonth}
        onChange={(e) => setTempMonth(e.target.value)}
        className="rounded border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
      >
        <option value="all">Todos os meses</option>
        {availableMonths.map((month) => (
          <option key={month} value={month}>
            {new Date(month + "-01").toLocaleDateString("pt-BR", {
              month: "long",
              year: "numeric",
            })}
          </option>
        ))}
      </select>
      <button
        onClick={handleApply}
        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
      >
        Aplicar
      </button>
    </div>
  );
}