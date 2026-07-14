// components/details/hotel-autocomplete.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { searchHotels, addHotel } from "@/lib/services/request-service";

interface Hotel {
  id: string;
  name: string;
  city: string;
  state?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
}

interface HotelAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onHotelSelected: (hotel: Hotel) => void;
  city: string;
  placeholder?: string;
}

export default function HotelAutocomplete({
  value,
  onChange,
  onHotelSelected,
  city,
  placeholder = "Digite o nome do hotel...",
}: HotelAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<Hotel[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Busca hotéis quando o usuário digita
  useEffect(() => {
    const delayDebounce = setTimeout(async () => {
      if (value.length >= 2) {
        setIsLoading(true);
        try {
          const results = await searchHotels(value, city);
          setSuggestions(results);
          setIsOpen(true);
        } catch (error) {
          console.error("Erro ao buscar hotéis:", error);
        } finally {
          setIsLoading(false);
        }
      } else {
        setSuggestions([]);
        setIsOpen(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [value, city]);

  // Fecha o dropdown ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectSuggestion = (hotel: Hotel) => {
    onChange(hotel.name);
    onHotelSelected(hotel);
    setIsOpen(false);
  };

  const handleCreateHotel = async () => {
    if (!value.trim() || !city) {
      alert("Preencha o nome do hotel e certifique-se de que a cidade está definida.");
      return;
    }

    setIsCreating(true);
    try {
      const newHotel = await addHotel({
        name: value.trim(),
        city: city,
      });
      onChange(newHotel.name);
      onHotelSelected(newHotel);
      setIsOpen(false);
      alert(`✅ Hotel "${newHotel.name}" cadastrado com sucesso!`);
    } catch (error) {
      console.error("Erro ao criar hotel:", error);
      alert(error instanceof Error ? error.message : "Erro ao criar hotel");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div ref={wrapperRef} className="relative w-full">
      <input
        type="text"
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          if (e.target.value.length >= 2) {
            setIsOpen(true);
          }
        }}
        onFocus={() => {
          if (value.length >= 2) {
            setIsOpen(true);
          }
        }}
        placeholder={placeholder}
        className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
      />

      {isLoading && (
        <div className="absolute right-3 top-2.5 text-gray-400 text-sm">
          Carregando...
        </div>
      )}

      {/* 🔥 DROPDOWN - SEMPRE ABERTO QUANDO isOpen É TRUE */}
      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {/* SUGESTÕES */}
          {suggestions.length > 0 ? (
            suggestions.map((hotel) => (
              <button
                key={hotel.id}
                onClick={() => handleSelectSuggestion(hotel)}
                className="w-full text-left px-4 py-2 hover:bg-blue-50 transition-colors border-b border-gray-100 last:border-0"
              >
                <div className="font-medium text-gray-900">{hotel.name}</div>
                <div className="text-sm text-gray-500">
                  {hotel.city}{hotel.state ? `, ${hotel.state}` : ""}
                </div>
              </button>
            ))
          ) : (
            // 🔥 MENSAGEM QUANDO NÃO HÁ SUGESTÕES
            <div className="px-4 py-2 text-sm text-gray-500 border-b border-gray-100">
              Nenhum hotel encontrado para "{value}"
            </div>
          )}

          {/* 🔥 BOTÃO DE CADASTRO - SEMPRE VISÍVEL QUANDO HÁ TEXTO DIGITADO */}
          {value.length >= 2 && (
            <button
              onClick={handleCreateHotel}
              disabled={isCreating}
              className="w-full text-left px-4 py-2 bg-blue-50 hover:bg-blue-100 transition-colors text-sm text-blue-700 font-medium border-t border-gray-200"
            >
              {isCreating ? (
                "Cadastrando..."
              ) : (
                `+ Cadastrar "${value.trim()}"`
              )}
            </button>
          )}
        </div>
      )}
    </div>
  );
}