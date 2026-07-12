// components/details/tasks-sidebar.tsx
"use client";

import { useState, useEffect } from "react";
import { getTasks, saveTasks, resetTasks } from "@/lib/services/request-service";

interface Subtask {
  key: string;
  label: string;
  completed: boolean;
}

interface Task {
  key: string;
  label: string;
  completed: boolean;
  subtasks?: Subtask[];
}

interface TasksSidebarProps {
  requestId: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function TasksSidebar({ requestId, isOpen, onClose }: TasksSidebarProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const data = await getTasks(requestId);
      setTasks(data || []);
    } catch (error) {
      console.error("Erro ao carregar tarefas:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, [requestId]);

  // 🔥 SALVAR AUTOMATICAMENTE NO BANCO
  const saveTasksToDatabase = async (updatedTasks: Task[]) => {
    try {
      await saveTasks(requestId, updatedTasks);
    } catch (error) {
      console.error("Erro ao salvar tarefas:", error);
      alert("Erro ao salvar tarefas. Tente novamente.");
      // Recarrega as tasks para garantir consistência
      await loadTasks();
    }
  };

  const handleToggleTask = async (taskKey: string) => {
    const updatedTasks = tasks.map((task) =>
      task.key === taskKey
        ? { ...task, completed: !task.completed }
        : task
    );
    setTasks(updatedTasks);
    await saveTasksToDatabase(updatedTasks);
  };

  const handleToggleSubtask = async (taskKey: string, subtaskKey: string) => {
    const updatedTasks = tasks.map((task) => {
      if (task.key === taskKey && task.subtasks) {
        const updatedSubtasks = task.subtasks.map((sub) =>
          sub.key === subtaskKey
            ? { ...sub, completed: !sub.completed }
            : sub
        );
        // Verifica se todos os subtasks estão completos
        const allSubtasksDone = updatedSubtasks.every((s) => s.completed);
        return {
          ...task,
          completed: allSubtasksDone,
          subtasks: updatedSubtasks,
        };
      }
      return task;
    });
    setTasks(updatedTasks);
    await saveTasksToDatabase(updatedTasks);
  };

  const handleReset = async () => {
    if (!confirm("Deseja reiniciar todas as tarefas?")) return;
    try {
      const defaultTasks = [
        {
          key: "hotel_reserved",
          label: "🏨 Hotel Reservado",
          completed: false,
          subtasks: []
        },
        {
          key: "email_sent",
          label: "📧 Email Enviado",
          completed: false,
          subtasks: []
        },
        {
          key: "car_reserved",
          label: "🚗 Reserva de Carro Realizada",
          completed: false,
          subtasks: []
        },
        {
          key: "flight_issued",
          label: "✈️ Emissão da Passagem",
          completed: false,
          subtasks: [
            { key: "flight_purchase", label: "Compra", completed: false },
            { key: "flight_checkin", label: "Check-in", completed: false },
            { key: "flight_sent", label: "Envio para o passageiro", completed: false },
          ],
        },
      ];
      setTasks(defaultTasks);
      await saveTasksToDatabase(defaultTasks);
      await loadTasks(); // Recarrega para confirmar
    } catch (error) {
      console.error("Erro ao reiniciar tarefas:", error);
      alert("Erro ao reiniciar tarefas");
    }
  };

  const completedCount = tasks.filter((t) => t.completed).length;
  const totalCount = tasks.length;

  if (loading) {
    return (
      <aside className="bg-white shadow-lg p-4 w-full h-full">
        <p className="text-gray-500 text-center mt-8">Carregando tarefas...</p>
      </aside>
    );
  }

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed top-0 right-0 h-full bg-white shadow-lg z-50 transition-transform duration-300
          w-80 p-4 overflow-y-auto
          ${isOpen ? "translate-x-0" : "translate-x-full"}
          lg:translate-x-0 lg:static lg:w-80 lg:shadow-none lg:border-l lg:border-gray-200
          lg:h-screen lg:sticky lg:top-0 lg:self-start
        `}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">
            ✅ Tarefas do Planejamento
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 lg:hidden"
          >
            ✕
          </button>
        </div>

        <div className="mb-4 text-sm text-gray-600">
          <span className="font-medium">{completedCount}</span> de{" "}
          <span className="font-medium">{totalCount}</span> concluídas
        </div>

        <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(completedCount / totalCount) * 100}%` }}
          />
        </div>

        <div className="space-y-4">
          {tasks.map((task) => (
            <div key={task.key} className="space-y-2">
              {/* Task principal */}
              <label
                className={`
                  flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors
                  ${
                    task.completed
                      ? "bg-green-50 border border-green-200"
                      : "bg-gray-50 hover:bg-gray-100 border border-transparent"
                  }
                `}
              >
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => handleToggleTask(task.key)}
                  className="mt-1 w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                />
                <span
                  className={`text-sm ${
                    task.completed ? "text-gray-500 line-through" : "text-gray-700"
                  }`}
                >
                  {task.label}
                </span>
              </label>

              {/* Subtasks (se existirem) */}
              {task.subtasks && task.subtasks.length > 0 && (
                <div className="ml-8 space-y-1">
                  {task.subtasks.map((subtask) => (
                    <label
                      key={subtask.key}
                      className={`
                        flex items-start gap-3 p-2 rounded-lg cursor-pointer transition-colors text-sm
                        ${
                          subtask.completed
                            ? "text-gray-400"
                            : "text-gray-600 hover:bg-gray-50"
                        }
                      `}
                    >
                      <input
                        type="checkbox"
                        checked={subtask.completed}
                        onChange={() => handleToggleSubtask(task.key, subtask.key)}
                        className="mt-1 w-3.5 h-3.5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                      />
                      <span className={subtask.completed ? "line-through" : ""}>
                        {subtask.label}
                      </span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-6 pt-4 border-t border-gray-200">
          <button
            onClick={handleReset}
            className="text-xs text-gray-400 hover:text-gray-600"
          >
            🔄 Reiniciar tarefas
          </button>
        </div>
      </aside>
    </>
  );
}