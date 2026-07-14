// app/hotels/components/hotel-modal.tsx
"use client";

import { useState, useEffect } from "react";
import type { Hotel } from "@/lib/services/hotel-service";
import { createHotel, updateHotel } from "@/lib/services/hotel-service";
import Input from "@/components/ui/input";

interface HotelModalProps {
  hotel: Hotel | null;
  onClose: () => void;
  onSave: (hotel: Hotel) => void;
}

export default function HotelModal({ hotel, onClose, onSave }: HotelModalProps) {
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (hotel) {
      setName(hotel.name);
      setCity(hotel.city);
      setState(hotel.state || "");
      setAddress(hotel.address || "");
      setPhone(hotel.phone || "");
      setEmail(hotel.email || "");
      setWebsite(hotel.website || "");
    } else {
      setName("");
      setCity("");
      setState("");
      setAddress("");
      setPhone("");
      setEmail("");
      setWebsite("");
    }
  }, [hotel]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !city.trim()) {
      alert("Preencha nome e cidade (campos obrigatórios)");
      return;
    }

    setIsSubmitting(true);

    try {
      let savedHotel: Hotel;
      if (hotel) {
        savedHotel = await updateHotel(hotel.id, {
          name: name.trim(),
          city: city.trim(),
          state: state.trim() || undefined,
          address: address.trim() || undefined,
          phone: phone.trim() || undefined,
          email: email.trim() || undefined,
          website: website.trim() || undefined,
        });
      } else {
        savedHotel = await createHotel({
          name: name.trim(),
          city: city.trim(),
          state: state.trim() || undefined,
          address: address.trim() || undefined,
          phone: phone.trim() || undefined,
          email: email.trim() || undefined,
          website: website.trim() || undefined,
        });
      }
      onSave(savedHotel);
    } catch (error) {
      alert(error instanceof Error ? error.message : "Erro ao salvar hotel");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={handleOverlayClick}
    >
      <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          {hotel ? "✏️ Editar Hotel" : "➕ Novo Hotel"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Nome do Hotel *"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: Hilton São Paulo"
            disabled={isSubmitting}
            className="text-gray-900"
          />

          <Input
            label="Cidade *"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Ex: São Paulo"
            disabled={isSubmitting}
            className="text-gray-900"
          />

          <Input
            label="Estado"
            value={state}
            onChange={(e) => setState(e.target.value)}
            placeholder="Ex: SP"
            disabled={isSubmitting}
            className="text-gray-900"
          />

          <Input
            label="Endereço"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Ex: Av. Paulista, 1000"
            disabled={isSubmitting}
            className="text-gray-900"
          />

          <Input
            label="Telefone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Ex: (11) 99999-9999"
            disabled={isSubmitting}
            className="text-gray-900"
          />

          <Input
            label="E-mail"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Ex: contato@hilton.com"
            disabled={isSubmitting}
            className="text-gray-900"
          />

          <Input
            label="Website"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            placeholder="Ex: https://www.hilton.com"
            disabled={isSubmitting}
            className="text-gray-900"
          />

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition-colors"
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`flex-1 py-2 rounded-lg transition-colors text-white ${
                isSubmitting
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {isSubmitting ? "Salvando..." : hotel ? "Atualizar" : "Cadastrar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}