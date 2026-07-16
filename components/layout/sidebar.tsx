// components/layout/sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { user, signOut } = useAuth();

  const menuItems = [
    { href: "/", label: "Dashboard", icon: "📊" },
    { href: "/control-panel", label: "Painel de Controle", icon: "📈" },
    { href: "/requests/new", label: "Nova Solicitação", icon: "➕" },
    { href: "/guests", label: "Hóspedes", icon: "👥" },
    { href: "/hotels", label: "Hotéis", icon: "🏨" },
  ];

  const isActive = (href: string) => pathname === href;

  const handleLogout = async () => {
    console.log("🔴 Botão Sair clicado");
    try {
      await signOut();
      // O redirecionamento já é feito dentro do signOut
    } catch (error) {
      console.error("❌ Erro ao sair:", error);
      // 🔥 FALLBACK: Se der erro, força o redirecionamento
      window.location.href = "/login";
    }
  };
  
  // 🔥 Iniciais do usuário
  const getUserInitials = () => {
    if (!user?.email) return "?";
    return user.email.charAt(0).toUpperCase();
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 h-full bg-white shadow-lg z-50 transition-transform duration-300
          w-64 p-4 overflow-y-auto
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0 md:static md:w-64 md:shadow-none md:border-r md:border-gray-200
          md:h-screen
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

        {/* 🔥 PERFIL DO USUÁRIO */}
        <div className="flex items-center gap-3 mb-6 p-3 bg-gray-50 rounded-lg">
          <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-lg">
            {getUserInitials()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user?.email || "Usuário"}
            </p>
            <button
              onClick={() => handleLogout()}
              className="text-xs text-red-600 hover:text-red-800 font-medium"
            >
              Sair
            </button>
          </div>
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