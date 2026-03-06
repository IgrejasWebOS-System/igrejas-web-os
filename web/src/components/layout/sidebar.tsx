"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Home, 
  Users, 
  FileText, 
  BookOpen, 
  Calendar, 
  DollarSign, 
  Building, 
  LayoutDashboard, 
  Settings, 
  LogOut,
  ChevronDown
} from "lucide-react";
import { cn } from "@/utils/cn";
import { logout } from "@/app/actions"; // Injeção Funcional: Motor de Saída Segura

// Tipagem estrita para suportar menus com e sem sub-itens
type MenuItem = {
  icon: React.ElementType;
  label: string;
  href: string;
  subItems?: { label: string; href: string; icon: React.ElementType }[];
};

// Matriz de Navegação Refatorada (Fusão Estrita - Apenas os 8 itens validados)
const menuItems: MenuItem[] = [
  { icon: Home, label: "Visão Geral", href: "/dashboard" },
  { icon: Users, label: "Membros", href: "/dashboard/membros" },
  { icon: FileText, label: "Secretaria", href: "/dashboard/secretaria" },
  { icon: BookOpen, label: "EBD", href: "/dashboard/ebd" },
  { icon: Calendar, label: "Eventos", href: "/dashboard/eventos" },
  { 
    icon: DollarSign, 
    label: "Financeiro", 
    href: "/dashboard/financeiro",
    subItems: [
      { label: "Painel Financeiro", href: "/dashboard/financeiro", icon: LayoutDashboard },
      { label: "Patrimônio", href: "/dashboard/financeiro/patrimonio", icon: Building }
    ]
  },
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard/analytics" },
  { icon: Settings, label: "Configurações", href: "/dashboard/configuracoes" },
];

export function Sidebar() {
  const pathname = usePathname();
  
  // Controle de estado para menus colapsáveis (Dropdown)
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});

  const toggleMenu = (menuLabel: string) => {
    setOpenMenus((prev) => ({ ...prev, [menuLabel]: !prev[menuLabel] }));
  };

  return (
    <aside className="w-64 bg-neutral-900 border-r border-neutral-800 hidden md:flex flex-col h-screen fixed left-0 top-0 z-40 overflow-y-auto custom-scrollbar">
      {/* LOGO AREA - MANTIDO INTACTO DO ARQUIVO ORIGINAL */}
      <div className="h-16 flex-shrink-0 flex items-center px-6 border-b border-neutral-800 sticky top-0 bg-neutral-900 z-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
             <div className="w-3 h-3 bg-emerald-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
          </div>
          <span className="font-bold text-neutral-100 tracking-tight">
            IgrejasWeb <span className="text-emerald-500">OS</span>
          </span>
        </div>
      </div>

      {/* NAVIGATION - LÓGICA MISTA MANTENDO ESTÉTICA ORIGINAL */}
      <nav className="flex-1 py-6 px-3 space-y-1">
        {menuItems.map((item) => {
          // Lógica de Ativação
          const isExactActive = item.href === '/dashboard' 
               ? pathname === item.href 
               : pathname.startsWith(item.href);
          
          const isChildActive = item.subItems?.some(sub => pathname === sub.href) || false;
          const isActive = isExactActive || isChildActive;
          const hasSubItems = item.subItems && item.subItems.length > 0;
          const isOpen = openMenus[item.label] || isChildActive;

          return (
            <div key={item.label} className="space-y-1">
              {hasSubItems ? (
                // Renderização de Dropdown
                <button
                  onClick={() => toggleMenu(item.label)}
                  className={cn(
                    "w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group cursor-pointer",
                    isActive || isOpen
                      ? "bg-emerald-500/5 text-emerald-400" 
                      : "text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800/50"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <item.icon className={cn("w-5 h-5", (isActive || isOpen) ? "text-emerald-500" : "text-neutral-500 group-hover:text-neutral-300")} />
                    {item.label}
                  </div>
                  <ChevronDown className={cn("w-4 h-4 transition-transform duration-200", isOpen && "rotate-180")} />
                </button>
              ) : (
                // Renderização Simples Original (Links Diretos)
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group",
                    isExactActive 
                      ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" 
                      : "text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800/50"
                  )}
                >
                  <item.icon className={cn("w-5 h-5", isExactActive ? "text-emerald-500" : "text-neutral-500 group-hover:text-neutral-300")} />
                  {item.label}
                </Link>
              )}

              {/* Renderização de Sub-Itens */}
              {hasSubItems && isOpen && (
                <div className="pl-9 space-y-1 pb-1">
                  {item.subItems!.map((subItem) => {
                    const isSubActive = pathname === subItem.href;
                    return (
                      <Link
                        key={subItem.href}
                        href={subItem.href}
                        className={cn(
                          "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 group",
                          isSubActive
                            ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                            : "text-neutral-500 hover:text-neutral-200 hover:bg-neutral-800/30"
                        )}
                      >
                        <subItem.icon className={cn("w-4 h-4", isSubActive ? "text-emerald-500" : "text-neutral-600 group-hover:text-neutral-400")} />
                        {subItem.label}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* FOOTER / USER - MOTOR DE SAÍDA SEGURA (INJEÇÃO) */}
      <div className="p-4 border-t border-neutral-800 flex-shrink-0 bg-neutral-900 sticky bottom-0 z-10">
        <form action={logout} className="w-full">
          <button 
            type="submit"
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors cursor-pointer"
          >
            <LogOut className="w-5 h-5" />
            Sair do Sistema
          </button>
        </form>
      </div>
    </aside>
  );
}