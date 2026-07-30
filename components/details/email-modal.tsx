// components/details/email-modal.tsx
"use client";

import { useState } from "react";
import EmailGenerator from "./email-generator";

interface EmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: {
    eventName: string;
    location: string;
    hotelName: string;
    hotelAddress?: string;
    checkIn: string;
    checkOut: string;
    rooms: any[];
    nights: number;
    totalCost: number;
  };
  guestEmails?: string[];
}

export default function EmailModal({
  isOpen,
  onClose,
  data,
  guestEmails = [],
}: EmailModalProps) {
  const [activeTab, setActiveTab] = useState<"financeiro" | "colaborador">("financeiro");

  const formatDate = (dateString) => {
    const [year, month, day] = dateString.split("-");
    return new Date(year, month - 1, day).toLocaleDateString("pt-BR");
  };
  // 🔥 FUNÇÃO PARA ATUALIZAR O PREVIEW EM TEMPO REAL
  const updatePreview = () => {
    const checkbox50 = document.getElementById("pagamento50") as HTMLInputElement;
    const checkboxPersonalizado = document.getElementById("pagamentoPersonalizado") as HTMLInputElement;
    const inputValor = document.querySelector('input[placeholder="R$ 0,00"]') as HTMLInputElement;
    const previewEl = document.getElementById("preview-email");
    const resumoEl = document.getElementById("resumo-pagamento");

    if (!previewEl) return;

    let pagamentoTexto = "";
    let valorAntecipado = 0;
    let valorRestante = 0;

    if (checkbox50?.checked) {
      valorAntecipado = data.totalCost / 2;
      valorRestante = data.totalCost - valorAntecipado;
      pagamentoTexto = `
⚠️ Pagamento Antecipado:
Já foi pago R$ ${valorAntecipado.toFixed(2)} (50% do valor total).
Restam R$ ${valorRestante.toFixed(2)} a serem pagos no check-in.`;
    } else if (checkboxPersonalizado?.checked) {
      valorAntecipado = parseFloat(inputValor?.value) || 0;
      valorRestante = data.totalCost - valorAntecipado;
      if (valorAntecipado > 0) {
        pagamentoTexto = `
⚠️ Pagamento Antecipado:
Já foi pago R$ ${valorAntecipado.toFixed(2)} (valor personalizado).
Restam R$ ${valorRestante.toFixed(2)} a serem pagos no check-in.`;
      }
    }

    if (resumoEl) {
      if (valorAntecipado > 0) {
        resumoEl.innerHTML = `
          <p><span className="font-medium">Antecipado:</span> R$ ${valorAntecipado.toFixed(2)}</p>
          <p><span className="font-medium">Restante:</span> R$ ${valorRestante.toFixed(2)}</p>
        `;
      } else {
        resumoEl.innerHTML = `<p className="text-gray-600">Nenhum pagamento antecipado selecionado.</p>`;
      }
    }

    const roomsSection = data.rooms
      .map((room) => {
        const guestsList = room.guests.map((g: any) => g.name).join(", ");
        return `- ${room.type} - ${guestsList} - R$ ${room.total.toFixed(2)}`;
      })
      .join("\n");

    previewEl.textContent = `Olá,

Segue as informações da reserva de hotel para o evento "${data.eventName}":

Hotel: ${data.hotelName}
Endereço: ${data.hotelAddress || "Endereço não informado"}
Check-in: ${formatDate(data.checkIn)}
Check-out: ${formatDate(data.checkOut)}
Total de diárias: ${data.nights}

Quartos e Hóspedes:
${roomsSection}

Valor total da reserva: R$ ${data.totalCost.toFixed(2)}
${pagamentoTexto}

Atenciosamente,`;
  };

  if (!isOpen) return null;

  const missingHotelName =
    !data.hotelName || data.hotelName.trim() === "" || data.hotelName === "Hotel não informado";
  const missingRooms = !data.rooms || data.rooms.length === 0;
  const hasMissingData = missingHotelName || missingRooms;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[100]">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-xl">
        {/* Cabeçalho */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">📧 Emails da Reserva</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            ✕
          </button>
        </div>

        {hasMissingData && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              ⚠️ Atenção: Algumas informações estão faltando. Você pode editar o email
              manualmente após copiar.
            </p>
            <ul className="text-xs text-yellow-700 mt-1 list-disc list-inside">
              {missingHotelName && <li>Nome do hotel não informado</li>}
              {missingRooms && <li>Nenhum quarto adicionado</li>}
            </ul>
          </div>
        )}

        {/* Abas */}
        <div className="flex border-b border-gray-200 mb-4">
          <button
            onClick={() => setActiveTab("financeiro")}
            className={`px-4 py-2 text-sm font-medium transition-colors ${activeTab === "financeiro"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-500 hover:text-gray-700"
              }`}
          >
            💳 Financeiro
          </button>
          <button
            onClick={() => setActiveTab("colaborador")}
            className={`px-4 py-2 text-sm font-medium transition-colors ${activeTab === "colaborador"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-500 hover:text-gray-700"
              }`}
          >
            👤 Colaborador
          </button>
        </div>

        {/* Conteúdo das abas */}
        <div>
          {activeTab === "financeiro" && <EmailGenerator {...data} />}

          {activeTab === "colaborador" && (
            <div className="space-y-4">
              {/* 📧 E-mail do responsável */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  📧 E-mail do responsável (ou múltiplos, separados por vírgula)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="email-responsavel"
                    defaultValue={guestEmails.join(", ")}
                    placeholder="email1@empresa.com, email2@empresa.com"
                    className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    onChange={updatePreview}
                  />
                  <datalist id="emails-list">
                    {guestEmails.length > 0 ? (
                      guestEmails.map((email) => <option key={email} value={email} />)
                    ) : (
                      <option value="Nenhum email disponível" />
                    )}
                  </datalist>
                </div>
                {guestEmails.length > 0 && (
                  <p className="text-xs text-gray-500 mt-1">
                    💡 Emails disponíveis: {guestEmails.join(", ")}
                  </p>
                )}
              </div>

              {/* ─── Pagamento Antecipado ─── */}
              <div className="border-t border-gray-200 pt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  💰 Pagamento Antecipado
                </h4>

                <div className="flex items-center gap-2 mb-2">
                  <input
                    type="checkbox"
                    id="pagamento50"
                    className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                    onChange={(e) => {
                      if (e.target.checked) {
                        const personalizado = document.getElementById(
                          "pagamentoPersonalizado"
                        ) as HTMLInputElement;
                        if (personalizado) personalizado.checked = false;
                      }
                      updatePreview();
                    }}
                  />
                  <label htmlFor="pagamento50" className="text-sm text-gray-700">
                    50% do valor total (R$ {(data.totalCost / 2).toFixed(2)})
                  </label>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="pagamentoPersonalizado"
                    className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                    onChange={(e) => {
                      if (e.target.checked) {
                        const checkbox50 = document.getElementById(
                          "pagamento50"
                        ) as HTMLInputElement;
                        if (checkbox50) checkbox50.checked = false;
                      }
                      updatePreview();
                    }}
                  />
                  <label htmlFor="pagamentoPersonalizado" className="text-sm text-gray-700">
                    Valor personalizado:
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="R$ 0,00"
                    className="w-32 rounded border border-gray-300 px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    onChange={updatePreview}
                  />
                </div>

                <div
                  id="resumo-pagamento"
                  className="mt-2 p-2 bg-blue-50 rounded border border-blue-200 text-sm"
                >
                  <p className="text-gray-600">Nenhum pagamento antecipado selecionado.</p>
                </div>
              </div>

              {/* 🔥 Preview do Email */}
              <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  Preview do Email:
                </h4>
                <pre
                  id="preview-email"
                  className="text-sm text-gray-600 whitespace-pre-wrap font-sans"
                >
                  {`Olá,

Segue as informações da reserva de hotel para o evento "${data.eventName}":

Hotel: ${data.hotelName}
Endereço: ${data.hotelAddress || "Endereço não informado"}
Check-in: ${new Date(data.checkIn).toLocaleDateString("pt-BR")}
Check-out: ${new Date(data.checkOut).toLocaleDateString("pt-BR")}
Total de diárias: ${data.nights}

Quartos e Hóspedes:
${data.rooms
                      .map((room) => {
                        const guestsList = room.guests.map((g: any) => g.name).join(", ");
                        return `- ${room.type} - ${guestsList} - R$ ${room.total.toFixed(2)}`;
                      })
                      .join("\n")}

Valor total da reserva: R$ ${data.totalCost.toFixed(2)}

Atenciosamente,`}
                </pre>
              </div>

              {/* 🔥 BOTÕES - APENAS COPIAR E ABRIR NO EMAIL */}
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => {
                    const previewEl = document.getElementById("preview-email");
                    if (previewEl) {
                      navigator.clipboard.writeText(previewEl.textContent || "");
                      alert("📋 Email copiado para a área de transferência!");
                    }
                  }}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm flex items-center gap-2"
                >
                  📋 Copiar Email
                </button>
                <button
                  onClick={() => {
                    const emailInput = document.getElementById(
                      "email-responsavel"
                    ) as HTMLInputElement;
                    const emails = emailInput?.value || "";
                    const subject = `Reserva de Hotel - ${data.eventName}`;
                    const previewEl = document.getElementById("preview-email");
                    const body = encodeURIComponent(previewEl?.textContent || "");
                    window.location.href = `mailto:${emails}?subject=${subject}&body=${body}`;
                  }}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm flex items-center gap-2"
                >
                  📧 Abrir no Email
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}