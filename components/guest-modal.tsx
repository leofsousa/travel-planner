// app/guests/components/guest-modal.tsx
"use client";

import { useState, useEffect } from "react";
import type { Guest } from "@/types/guest";
import { createGuest, updateGuest } from "@/lib/services/guest-service";
import Input from "@/components/ui/input";

interface GuestModalProps {
  guest: Guest | null;
  onClose: () => void;
  onSave: (guest: Guest) => void;
}

export default function GuestModal({ guest, onClose, onSave }: GuestModalProps) {
  const [name, setName] = useState("");
  const [document, setDocument] = useState("");
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (guest) {
      setName(guest.full_name);
      setDocument(guest.document || "");
      setEmail(guest.email || "");
    } else {
      setName("");
      setDocument("");
      setEmail("");
    }
  }, [guest]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 🔥 Nome continua obrigatório
    if (!name.trim()) {
      alert("O nome é obrigatório");
      return;
    }

    // 🔥 Documento agora é opcional
    const documentValue = document.trim() || undefined;

    setIsSubmitting(true);

    try {
      let savedGuest: Guest;
      if (guest) {
        savedGuest = await updateGuest(guest.id, {
          full_name: name.trim(),
          document: documentValue,
          email: email.trim() || undefined,
        });
      } else {
        savedGuest = await createGuest({
          full_name: name.trim(),
          document: documentValue,
          email: email.trim() || undefined,
        });
      }
      onSave(savedGuest);
    } catch (error) {
      alert(error instanceof Error ? error.message : "Erro ao salvar hóspede");
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
          {guest ? "✏️ Editar Hóspede" : "➕ Novo Hóspede"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Nome completo *"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Digite o nome completo"
            disabled={isSubmitting}
            className="text-gray-900"
          />

          <Input
            label="Documento (CPF/CNPJ)"
            value={document}
            onChange={(e) => setDocument(e.target.value)}
            placeholder="Digite o documento (opcional)"
            disabled={isSubmitting}
            className="text-gray-900"
          />

          <Input
            label="E-mail"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Digite o e-mail do hóspede"
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
              {isSubmitting ? "Salvando..." : guest ? "Atualizar" : "Cadastrar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}