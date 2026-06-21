import Input  from "@/components/ui/input";

type HotelSectionProps = {
  guests: {
    id: string;
    name: string;
    document: string;
  }[];
  observations: string;
  onAddGuest: () => void;
  guestName: string;
  guestDocument: string;
  setGuestName: (value: string) => void;
  setGuestDocument: (value: string) => void;
  onRemoveGuest: (id: string) => void;
};

export default function HotelSection({
  guests,
  observations,
  onAddGuest,
  guestName,
  guestDocument,
  setGuestName,
  setGuestDocument,
  onRemoveGuest,
}: HotelSectionProps) {
  return (
    <div className="mt-6 rounded-lg border p-4">
      <h2 className="mb-4 text-lg font-semibold">
        Hospedagem
      </h2>

      {/* ADD GUEST */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <Input
          placeholder="Nome do hóspede"
          value={guestName}
          onChange={(e) => setGuestName(e.target.value)}
        />

        <Input
          placeholder="Documento"
          value={guestDocument}
          onChange={(e) => setGuestDocument(e.target.value)}
        />
      </div>

      <button
        type="button"
        onClick={onAddGuest}
        className="mb-4 rounded bg-blue-600 px-4 py-2 text-white"
      >
        Adicionar hóspede
      </button>

      {/* LISTA */}
      <div className="space-y-2">
        {guests.length === 0 && (
          <p className="text-sm text-gray-500">
            Nenhum hóspede adicionado
          </p>
        )}

        {guests.map((guest) => (
          <div
            key={guest.id}
            className="flex items-center justify-between rounded border p-2"
          >
            <div>
              <p className="font-medium">{guest.name}</p>
              <p className="text-sm text-gray-500">
                {guest.document}
              </p>
            </div>

            <button
              onClick={() => onRemoveGuest(guest.id)}
              className="text-red-500 text-sm"
            >
              Remover
            </button>
          </div>
        ))}
      </div>

      {/* OBSERVAÇÕES */}
      <textarea
        className="mt-4 w-full rounded border p-2"
        placeholder="Observações"
        value={observations}
        readOnly
      />
    </div>
  );
}