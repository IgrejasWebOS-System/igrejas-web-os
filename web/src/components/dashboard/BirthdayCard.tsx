"use client";

import { useState } from "react";
import { Cake, Heart, Droplets, Calendar, MapPin, ChevronRight } from "lucide-react";

// MOCKS ATUALIZADOS PARA REFLETIR A NOVA ESTRUTURA
const MOCK_ANIVERSARIANTES = [
  { id: 1, nome: "Gabriel Batista", data: "12/02", tipo: "NASCIMENTO", igreja: "Vila Rezende", info: "28 anos" },
  { id: 2, nome: "Lucia Mendes", data: "15/02", tipo: "NASCIMENTO", igreja: "Sede", info: "45 anos" },
  { id: 3, nome: "João e Maria", data: "18/02", tipo: "CASAMENTO", igreja: "Vale do Sol", info: "10 anos de união" },
  { id: 4, nome: "Carlos e Ana", data: "25/02", tipo: "CASAMENTO", igreja: "Vila Rezende", info: "5 anos de união" },
  { id: 5, nome: "Pedro Rocha", data: "10/02", tipo: "BATISMO", igreja: "Jardim Elite", info: "2 anos de fé" },
  { id: 6, nome: "Lucas Pedroso", data: "20/02", tipo: "BATISMO", igreja: "Sede", info: "Batizado recente" },
];

export function BirthdayCard() {
  const [tab, setTab] = useState<"NASCIMENTO" | "CASAMENTO" | "BATISMO">("NASCIMENTO");

  const listaAtual = MOCK_ANIVERSARIANTES.filter(item => item.tipo === tab);

  return (
    <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl overflow-hidden flex flex-col h-full min-h-[350px]">
      
      <div className="p-5 border-b border-neutral-800">
        <h3 className="text-white font-bold flex items-center gap-2 mb-4">
            <Calendar className="w-4 h-4 text-emerald-500" /> Celebrações de Fevereiro
        </h3>
        
        {/* MENU DE ABAS */}
        <div className="flex bg-neutral-950 p-1 rounded-lg border border-neutral-800 gap-1">
            <button 
                onClick={() => setTab("NASCIMENTO")}
                className={`flex-1 flex items-center justify-center gap-2 py-1.5 rounded-md text-[10px] font-bold uppercase transition-all ${
                    tab === "NASCIMENTO" ? "bg-neutral-800 text-emerald-400 shadow-sm" : "text-neutral-500 hover:text-white"
                }`}
            >
                <Cake className="w-3 h-3" /> Nasc.
            </button>
            <button 
                onClick={() => setTab("CASAMENTO")}
                className={`flex-1 flex items-center justify-center gap-2 py-1.5 rounded-md text-[10px] font-bold uppercase transition-all ${
                    tab === "CASAMENTO" ? "bg-neutral-800 text-pink-400 shadow-sm" : "text-neutral-500 hover:text-white"
                }`}
            >
                <Heart className="w-3 h-3" /> Casam.
            </button>
            <button 
                onClick={() => setTab("BATISMO")}
                className={`flex-1 flex items-center justify-center gap-2 py-1.5 rounded-md text-[10px] font-bold uppercase transition-all ${
                    tab === "BATISMO" ? "bg-neutral-800 text-cyan-400 shadow-sm" : "text-neutral-500 hover:text-white"
                }`}
            >
                <Droplets className="w-3 h-3" /> Batismo
            </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-neutral-800">
        {listaAtual.length > 0 ? (
            <div className="space-y-1">
                {listaAtual.map((item) => (
                    <div key={item.id} className="group flex items-center justify-between p-3 hover:bg-neutral-800/50 rounded-lg transition-colors border border-transparent hover:border-neutral-800 cursor-default">
                        
                        <div className="flex items-center gap-3">
                            {/* ÍCONE DE DATA */}
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center border border-neutral-800 font-bold text-xs
                                ${item.tipo === 'NASCIMENTO' ? 'bg-emerald-500/10 text-emerald-500' : 
                                  item.tipo === 'CASAMENTO' ? 'bg-pink-500/10 text-pink-500' : 'bg-cyan-500/10 text-cyan-500'}`}>
                                {item.data}
                            </div>
                            
                            {/* TEXTOS */}
                            <div>
                                <p className="text-sm text-white font-medium group-hover:text-emerald-400 transition-colors">
                                    {item.nome}
                                </p>
                                <div className="flex items-center gap-2 text-[10px] text-neutral-500">
                                    <span className="flex items-center gap-1">
                                        <MapPin className="w-3 h-3" /> {item.igreja}
                                    </span>
                                    <span>•</span>
                                    <span>{item.info}</span>
                                </div>
                            </div>
                        </div>

                        {/* AÇÃO (SETA) */}
                        <button className="p-2 text-neutral-600 hover:text-white transition-colors opacity-0 group-hover:opacity-100">
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                ))}
            </div>
        ) : (
            <div className="h-full flex flex-col items-center justify-center text-neutral-500 gap-2 min-h-[150px]">
                <Calendar className="w-8 h-8 opacity-20" />
                <p className="text-xs">Nenhuma celebração encontrada.</p>
            </div>
        )}
      </div>
    </div>
  );
}