// components/details/tasks-sidebar.tsx
"use client";

import { useState, useEffect } from "react";
import { getRequestTasks, toggleTaskCompletion, initializeTasks } from "@/lib/services/request-service";

interface Task {
  id: string;
  task_key: string;
  task_label: string;
  is_completed: boolean;
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
      let data = await getRequestTasks(requestId);
      
      // Se não houver tarefas, inicializa com as padrão
      if (data.length === 0) {
        await initializeTasks(requestId);
        data = await getRequestTasks(requestId);
      }
      
      setTasks(data);
    } catch (error) {
      console.error("Erro ao carregar tarefas:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, [requestId]);

  const handleToggle = async (taskId: string, currentStatus: boolean) => {
    try {
      await toggleTaskCompletion(taskId, !currentStatus);
      setTasks((prev) =>
        prev.map((task) =>
          task.id === taskId ? { ...task, is_completed: !currentStatus } : task
        )
      );
    } catch (error) {
      console.error("Erro ao atualizar tarefa:", error);
      alert("Erro ao atualizar tarefa");
    }
  };

  const completedCount = tasks.filter((t) => t.is_completed).length;
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
      {/* Overlay para mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Aside do checklist */}
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

        <div className="space-y-3">
          {tasks.map((task) => (
            <label
              key={task.id}
              className={`
                flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors
                ${
                  task.is_completed
                    ? "bg-green-50 border border-green-200"
                    : "bg-gray-50 hover:bg-gray-100 border border-transparent"
                }
              `}
            >
              <input
                type="checkbox"
                checked={task.is_completed}
                onChange={() => handleToggle(task.id, task.is_completed)}
                className="mt-1 w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
              />
              <span
                className={`text-sm ${
                  task.is_completed ? "text-gray-500 line-through" : "text-gray-700"
                }`}
              >
                {task.task_label}
              </span>
            </label>
          ))}
        </div>

        <div className="mt-6 pt-4 border-t border-gray-200">
          <button
            onClick={() => {
              if (confirm("Deseja reiniciar todas as tarefas?")) {
                loadTasks();
              }
            }}
            className="text-xs text-gray-400 hover:text-gray-600"
          >
            🔄 Reiniciar tarefas
          </button>
        </div>
      </aside>
    </>
  );
}