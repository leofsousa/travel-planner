// components/details/flight-planning.tsx
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { getFlightPlanning, saveFlightPlanning } from "@/lib/services/request-service";
import FlightLegModal from "@/components/details/flight-leg-modal";
import FlightLegCard from "@/components/details/flight-leg-card";

interface FlightPlanningProps {
  requestId: string;
  eventName: string;
  location: string;
  startDate: string;
  endDate: string;
  onDataChange?: (data: {
    hasFlight: boolean;
    departureDate: string;
    returnDate: string;
    observations: string;
  }) => void;
}

interface FlightLeg {
  id: string;
  origin: string;
  destination: string;
  departureDate: string;
  departureTime: string;
  arrivalDate: string;
  arrivalTime: string;
  airline: string;
  flightNumber: string;
  observations: string;
}

export default function FlightPlanning({
  requestId,
  eventName,
  location,
  startDate,
  endDate,
  onDataChange,
}: FlightPlanningProps) {
  const [legs, setLegs] = useState<FlightLeg[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingLeg, setEditingLeg] = useState<FlightLeg | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const initialLegsRef = useRef<FlightLeg[] | null>(null);

  // 🔥 CALCULA DADOS DA PASSAGEM
  const calculateFlightData = useCallback(() => {
    const hasFlight = legs.length > 0;
    const firstLeg = legs[0];
    const lastLeg = legs[legs.length - 1];

    return {
      hasFlight,
      departureDate: firstLeg?.departureDate || "",
      returnDate: lastLeg?.arrivalDate || "",
      observations: legs.map(l => l.observations).filter(Boolean).join(" | "),
    };
  }, [legs]);

  // 🔥 NOTIFICAR O PAI SOBRE MUDANÇAS
  useEffect(() => {
    if (onDataChange && !loading) {
      onDataChange(calculateFlightData());
    }
  }, [legs, loading, onDataChange, calculateFlightData]);

  // Carregar dados salvos
  useEffect(() => {
    async function loadData() {
      try {
        const data = await getFlightPlanning(requestId);
        const loadedLegs = data?.legs || [];
        setLegs(loadedLegs);
        initialLegsRef.current = loadedLegs;
      } catch (error) {
        console.error("Erro ao carregar planejamento de voo:", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [requestId]);

  // Salvar automaticamente
  useEffect(() => {
    if (loading || initialLegsRef.current === null) return;

    const isDifferent = JSON.stringify(legs) !== JSON.stringify(initialLegsRef.current);
    if (!isDifferent) return;

    const saveTimeout = setTimeout(async () => {
      try {
        await saveFlightPlanning(requestId, { legs });
        initialLegsRef.current = legs;
      } catch (error) {
        console.error("Erro ao salvar planejamento de voo:", error);
      }
    }, 500);

    return () => clearTimeout(saveTimeout);
  }, [legs, requestId, loading]);

  const addLeg = (legData: Omit<FlightLeg, "id">) => {
    const newLeg: FlightLeg = {
      ...legData,
      id: `flight-${Date.now()}`,
    };
    setLegs([...legs, newLeg]);
  };

  const updateLeg = (updatedLeg: FlightLeg) => {
    setLegs(legs.map((l) => (l.id === updatedLeg.id ? updatedLeg : l)));
  };

  const removeLeg = (legId: string) => {
    if (!confirm("Tem certeza que deseja remover este trecho?")) return;
    setLegs(legs.filter((l) => l.id !== legId));
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingLeg(null);
  };

  const handleModalSave = (legData: Omit<FlightLeg, "id">) => {
    if (editingLeg) {
      updateLeg({ ...editingLeg, ...legData });
    } else {
      addLeg(legData);
    }
    handleModalClose();
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <p className="text-gray-500 text-center">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 space-y-6 text-black">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">✈️ Planejamento de Passagens</h2>
        <span className="text-sm text-gray-500">{legs.length} trecho(s)</span>
      </div>

      <div className="space-y-4">
        {legs.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-8">
            Nenhum trecho adicionado. Clique em &quot;Adicionar Trecho&quot; para começar.
          </p>
        ) : (
          legs.map((leg) => (
            <FlightLegCard
              key={leg.id}
              leg={leg}
              onEdit={() => {
                setEditingLeg(leg);
                setIsModalOpen(true);
              }}
              onRemove={() => removeLeg(leg.id)}
            />
          ))
        )}
      </div>

      <div className="border-t border-gray-200 pt-4">
        <button
          onClick={() => {
            setEditingLeg(null);
            setIsModalOpen(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
        >
          + Adicionar Trecho
        </button>
      </div>

      {isModalOpen && (
        <FlightLegModal
          isOpen={isModalOpen}
          onClose={handleModalClose}
          onSave={handleModalSave}
          editingLeg={editingLeg}
          startDate={startDate}
          endDate={endDate}
        />
      )}
    </div>
  );
}