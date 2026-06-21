'use client';

import { useState } from 'react';
import Input from '@/components/ui/input';

export default function RequestForm() {
  const [request, setRequest] = useState({
    eventName: '',
    local: '',
    startDate: '',
    endDate: '',
    services: {
      hotel: {
        enabled: false,
        guests: [],
        observations: '',
      },
      car: { enabled: false },
      flight: { enabled: false },
    },
  });
  return (
    <div className="max-w-3xl mx-auto bg-white p-6 rounded-xl shadow flex flex-col gap-7">
      <h1 className="text-2xl font-bold mb-6">Nova Solicitação</h1>
      <Input label="Nome do Evento" value={request.local} />
      <Input label="Local" value={request.local} />
      <div className="grid grid-cols-2 gap-3">
        <Input label="Data Início" type="date" value={request.local} />
        <Input label="Data Retorno" type="date" value={request.local} />
      </div>
    </div>
  );
}
