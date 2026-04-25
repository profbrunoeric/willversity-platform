'use client';

import React, { useState, useEffect } from 'react';
import { Search, Filter, Archive } from 'lucide-react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';

export default function StudentFilters() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();
  const [searchTerm, setSearchTerm] = useState(searchParams.get('query') || '');

  // Debounce manual para busca
  useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams);
      if (searchTerm) {
        params.set('query', searchTerm);
      } else {
        params.delete('query');
      }
      replace(`${pathname}?${params.toString()}`);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleFilter = (key, value) => {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    replace(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex flex-col md:flex-row items-center gap-4 mb-8">
      {/* Busca por Nome */}
      <div className="relative flex-1 w-full">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input 
          type="text"
          placeholder="Buscar aluno por nome ou e-mail..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-6 py-4 bg-white border border-slate-100 rounded-[1.5rem] shadow-sm outline-none focus:ring-4 focus:ring-primary/5 transition-all font-medium text-slate-600"
        />
      </div>

      <div className="flex items-center gap-3 w-full md:w-auto">
        {/* Filtro por Nível */}
        <div className="relative flex-1 md:flex-none">
          <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <select 
            value={searchParams.get('level') || ''}
            onChange={(e) => handleFilter('level', e.target.value)}
            className="w-full pl-10 pr-8 py-4 bg-white border border-slate-100 rounded-2xl shadow-sm outline-none cursor-pointer font-bold text-xs text-slate-600 appearance-none"
          >
            <option value="">Todos os Níveis</option>
            {['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].map(lvl => (
              <option key={lvl} value={lvl}>{lvl}</option>
            ))}
          </select>
        </div>

        {/* Filtro por Status (Arquivados) */}
        <button 
          onClick={() => {
            const current = searchParams.get('status');
            handleFilter('status', current === 'archived' ? 'active' : 'archived');
          }}
          className={`flex items-center gap-2 px-6 py-4 rounded-2xl font-bold text-xs transition-all border ${
            searchParams.get('status') === 'archived'
              ? 'bg-rose-50 text-rose-600 border-rose-100 shadow-inner'
              : 'bg-white text-slate-400 border-slate-100 shadow-sm hover:bg-slate-50'
          }`}
        >
          <Archive size={16} />
          {searchParams.get('status') === 'archived' ? 'Ver Ativos' : 'Ver Arquivados'}
        </button>
      </div>
    </div>
  );
}
