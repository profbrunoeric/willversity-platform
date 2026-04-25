import React from 'react';
import { Search, Bell, UserCircle } from 'lucide-react';

export default function Header() {
  return (
    <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 fixed top-0 right-0 left-64 z-40 px-8 flex items-center justify-between">
      <div className="flex-1 max-w-xl">
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Busca global (Alunos, Turmas, Financeiro...)" 
            className="w-full pl-10 pr-4 py-2 bg-slate-100 border-transparent focus:bg-white focus:border-primary/30 rounded-xl text-sm transition-all outline-none"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-xl transition-all">
          <Bell size={20} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>
        
        <div className="h-8 w-px bg-slate-200 mx-2"></div>

        <div className="flex items-center gap-3 pl-2">
          <div className="text-right">
            <p className="text-sm font-semibold text-slate-800">Admin Willversity</p>
            <p className="text-[10px] text-slate-500 font-medium font-outfit uppercase">Coordenador Geral</p>
          </div>
          <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center text-slate-400 border-2 border-white shadow-sm">
            <UserCircle size={28} />
          </div>
        </div>
      </div>
    </header>
  );
}
