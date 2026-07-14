// hooks/useHotelValidation.ts
import { useState, useEffect } from "react";

interface ValidationRule {
  field: string;
  validate: () => boolean;
  message: string;
}

interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export function useHotelValidation(
  checkIn: string,
  checkOut: string,
  requestStartDate: string,
  requestEndDate: string,
  rooms: any[]
) {
  const [errors, setErrors] = useState<string[]>([]);
  const [isValid, setIsValid] = useState(true);

  const validate = (): ValidationResult => {
    const newErrors: string[] = [];

    // 1. Check-in não pode ser antes da data de início
    if (checkIn && requestStartDate && checkIn < requestStartDate) {
      newErrors.push("Check-in não pode ser antes da data de início da viagem.");
    }

    // 2. Check-out não pode ser antes do Check-in
    if (checkIn && checkOut && checkOut < checkIn) {
      newErrors.push("Check-out não pode ser anterior ao Check-in.");
    }

    // 3. Check-out não pode ser depois da data de fim
    if (checkOut && requestEndDate && checkOut > requestEndDate) {
      newErrors.push("Check-out não pode ser depois da data de fim da viagem.");
    }

    // 4. Validar quartos
    rooms.forEach((room, index) => {
      // 4a. Quarto individual com mais de 1 hóspede
      if (room.type === "individual" && room.guests.length > 1) {
        newErrors.push(`Quarto Individual #${index + 1} só pode ter 1 hóspede.`);
      }

      // 4b. Períodos dentro do período da viagem
      room.periods.forEach((period: any, pIndex: number) => {
        if (period.startDate < requestStartDate) {
          newErrors.push(
            `Período ${pIndex + 1} do Quarto #${index + 1} começa antes da viagem.`
          );
        }
        if (period.endDate > requestEndDate) {
          newErrors.push(
            `Período ${pIndex + 1} do Quarto #${index + 1} termina depois da viagem.`
          );
        }
      });

      // 4c. Verificar sobreposição de períodos
      for (let i = 0; i < room.periods.length; i++) {
        for (let j = i + 1; j < room.periods.length; j++) {
          const p1 = room.periods[i];
          const p2 = room.periods[j];
          if (p1.startDate < p2.endDate && p2.startDate < p1.endDate) {
            newErrors.push(
              `Períodos do Quarto #${index + 1} estão sobrepostos.`
            );
          }
        }
      }
    });

    return {
      isValid: newErrors.length === 0,
      errors: newErrors,
    };
  };

  useEffect(() => {
    const result = validate();
    setIsValid(result.isValid);
    setErrors(result.errors);
  }, [checkIn, checkOut, requestStartDate, requestEndDate, rooms]);

  return { isValid, errors, validate };
}