// components/layout/header.tsx
"use client";

import { useState } from "react";
import Sidebar from "./sidebar";

interface HeaderProps {
  children: React.ReactNode;
}

export default function Header({ children }: HeaderProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <>
      {/* Cabeçalho fixo com botão hambúrguer */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30 md:hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Abrir menu"
          >
            <svg
              className="w-6 h-6 text-gray-700"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
          <h1 className="text-lg font-bold text-gray-900">✈️ Travel Planner</h1>
          <div className="w-10" />
        </div>
      </header>

      {/* 🔥 CORREÇÃO: Layout com altura total */}
      <div className="flex min-h-[calc(100vh-64px)] md:min-h-screen">
        <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />

        {/* Conteúdo principal */}
        <main className="flex-1 p-4 md:p-6 bg-gray-100">
          {children}
        </main>
      </div>
    </>
  );
}