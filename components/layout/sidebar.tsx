// components/layout/sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();

  const menuItems = [
    { href: "/", label: "📊 Dashboard", icon: "📊" },
    { href: "/requests/new", label: "➕ Nova Solicitação", icon: "➕" },
    { href: "/guests", label: "👥 Hóspedes", icon: "👥" },
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <>
      {/* Overlay para mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* 🔥 CORREÇÃO: Menu com altura total */}
      <aside
        className={`
          fixed top-0 left-0 h-full bg-white shadow-lg z-50 transition-transform duration-300
          w-64 p-4 overflow-y-auto
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0 md:static md:w-64 md:shadow-none md:border-r md:border-gray-200
          md:min-h-screen
        `}
      >
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-xl font-bold text-gray-900">✈️ Travel Planner</h1>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 md:hidden"
          >
            ✕
          </button>
        </div>

        <nav className="space-y-2">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={`
                flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                ${
                  isActive(item.href)
                    ? "bg-blue-50 text-blue-700 font-medium"
                    : "text-gray-700 hover:bg-gray-100"
                }
              `}
            >
              <span className="text-xl">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="absolute bottom-4 left-4 right-4">
          <div className="text-xs text-gray-400 border-t border-gray-200 pt-4">
            <p>Travel Planner v1.0</p>
            <p className="mt-1">Uso pessoal</p>
          </div>
        </div>
      </aside>
    </>
  );
}