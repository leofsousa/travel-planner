"use client";

import { useState, useEffect } from "react";
import { getRequests } from "@/lib/services/request-service";
import Link from "next/link";
import MetricsCards from "./components/metrics-cards";
import MonthlyFilter from "./components/monthly-filter";
import ExportButton from "./components/export-button";

interface Request {
  id: string;
  event_name: string;
  location: string;
  start_date: string;
  end_date: string;
  status: "pending" | "in_progress" | "completed";
  created_at: string;
  hotel_planning?: any[];
  request_flights?: any;
  request_cars?: any;
}

function getMonthFromDate(dateString: string): string {
  if (!dateString) return "";
  return dateString.substring(0, 7);
}

function calculateMetrics(requests: Request[]) {
  let totalCost = 0;
  const cities = new Set<string>();
  const hotels: Record<string, number> = {};
  let pending = 0,
    inProgress = 0,
    completed = 0;
  let totalCarRentals = 0;
  let totalFlights = 0;
  let totalHotelRooms = 0;

  requests.forEach((r) => {
    if (r.status === "pending") pending++;
    else if (r.status === "in_progress") inProgress++;
    else if (r.status === "completed") completed++;

    if (r.location) cities.add(r.location);

    if (r.hotel_planning?.[0]?.hotel_name) {
      const name = r.hotel_planning[0].hotel_name;
      hotels[name] = (hotels[name] || 0) + 1;
    }

    if (r.hotel_planning?.[0]?.rooms) {
      const rooms = r.hotel_planning[0].rooms || [];
      totalHotelRooms += rooms.length;
      rooms.forEach((room: any) => {
        const periods = room.periods || [];
        periods.forEach((period: any) => {
          const startParts = period.startDate.split("-").map(Number);
          const endParts = period.endDate.split("-").map(Number);
          const start = new Date(startParts[0], startParts[1] - 1, startParts[2]);
          const end = new Date(endParts[0], endParts[1] - 1, endParts[2]);
          const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
          totalCost += days * period.dailyRate;
        });
      });
    }

    if (r.request_flights?.enabled) {
      totalFlights += 1;
    }

    if (r.request_cars?.enabled && r.request_cars?.car_rentals) {
      totalCarRentals += r.request_cars.car_rentals.length || 0;
    }
  });

  const topHotels = Object.entries(hotels)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return {
    totalCost,
    totalTrips: requests.length,
    totalHotels: Object.keys(hotels).length,
    uniqueCities: Array.from(cities),
    pendingTrips: pending,
    inProgressTrips: inProgress,
    completedTrips: completed,
    topHotels,
    totalCarRentals,
    totalFlights,
    totalHotelRooms,
  };
}

function getAvailableMonths(requests: Request[]) {
  const months = new Set<string>();
  requests.forEach((r) => {
    if (r.start_date) {
      const month = getMonthFromDate(r.start_date);
      months.add(month);
    }
  });
  return Array.from(months).sort();
}

export default function ControlPanelPage() {
  const [allRequests, setAllRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState("all");

  useEffect(() => {
    async function loadData() {
      try {
        const data = await getRequests();
        setAllRequests(data);
      } catch (error) {
        console.error("Erro ao carregar solicitações:", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const filteredRequests = selectedMonth === "all"
    ? allRequests
    : allRequests.filter((r) => {
        if (!r.start_date) return false;
        const month = getMonthFromDate(r.start_date);
        return month === selectedMonth;
      });

  const metrics = calculateMetrics(filteredRequests);
  const availableMonths = getAvailableMonths(allRequests);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <p className="text-gray-500 text-center">Carregando dados...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto text-black">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              📊 Painel de Controle
            </h1>
            <p className="text-sm text-gray-500">
              {selectedMonth === "all"
                ? `Mostrando todas as ${filteredRequests.length} viagens`
                : `Mostrando ${filteredRequests.length} viagens de ${new Date(selectedMonth + "-01").toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}`}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <MonthlyFilter
              selectedMonth={selectedMonth}
              onMonthChange={setSelectedMonth}
              availableMonths={availableMonths}
            />
            <ExportButton
              requests={filteredRequests}
              selectedMonth={selectedMonth}
            />
            <Link
              href="/"
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              ← Voltar ao Dashboard
            </Link>
          </div>
        </div>

        <MetricsCards metrics={metrics} />
      </div>
    </div>
  );
}