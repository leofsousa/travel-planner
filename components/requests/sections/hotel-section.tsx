type HotelSectionProps = {
  guests: string[];
  observations: string;
  onAddGuest: () => void;
};

export default function HotelSection({
  guests,
  observations,
  onAddGuest,
}: HotelSectionProps) {
  return (
    <div className="mt-6 rounded-lg border p-4">
      <h2 className="mb-4 text-lg font-semibold">Hospedagem</h2>

      <div className="space-y-2">
        {guests.length === 0 && (
          <p className="text-sm text-gray-500">Nenhum hóspede adicionado.</p>
        )}

        {guests.map((guest, index) => (
          <div key={index} className="rounded border p-2">
            {guest}
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={onAddGuest}
        className="mt-4 rounded bg-blue-600 px-4 py-2 text-white"
      >
        Adicionar hóspede
      </button>

      <textarea
        className="mt-4 w-full rounded border p-2"
        placeholder="Observações"
        value={observations}
        readOnly
      />
    </div>
  );
}
