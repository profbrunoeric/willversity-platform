'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Users, LayoutDashboard, BookOpen, Calendar, UserSquare2, Settings, ArrowRight, Command, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { quickSearchStudents } from '@/app/(dashboard)/alunos/actions';

const navigationShortcuts = [
  { icon: LayoutDashboard, label: 'Ir para Dashboard', href: '/', category: 'Navegação' },
  { icon: Users, label: 'Ver todos os Alunos', href: '/alunos', category: 'Navegação' },
  { icon: BookOpen, label: 'Ir para Sala de Aula', href: '/sala-de-aula', category: 'Navegação' },
  { icon: Calendar, label: 'Abrir Agenda', href: '/agenda', category: 'Navegação' },
  { icon: UserSquare2, label: 'Lista de Professores', href: '/professores', category: 'Navegação' },
  { icon: Settings, label: 'Command Center', href: '/configuracoes', category: 'Navegação' },
];

export default function CommandPalette({ isOpen, onClose }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const router = useRouter();
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      setQuery('');
      setResults([]);
    }
  }, [isOpen]);

  useEffect(() => {
    const handler = setTimeout(async () => {
      if (query.length >= 2) {
        setIsSearching(true);
        const searchResults = await quickSearchStudents(query);
        setResults(searchResults);
        setIsSearching(false);
      } else {
        setResults([]);
      }
    }, 300);

    return () => clearTimeout(handler);
  }, [query]);

  const handleNavigate = (href) => {
    router.push(href);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-start justify-center pt-[15vh] px-4">
      {/* Backdrop */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
      />

      {/* Palette */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: -20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -20 }}
        className="bg-white w-full max-w-xl rounded-[2.5rem] shadow-[0_40px_100px_-15px_rgba(0,0,0,0.5)] border border-slate-200 overflow-hidden relative z-[10001]"
      >
        {/* Search Bar */}
        <div className="p-6 border-b border-slate-100 flex items-center gap-4 bg-slate-50/50">
          <Search className="text-slate-400" size={24} />
          <input 
            ref={inputRef}
            type="text" 
            placeholder="O que você está procurando hoje?" 
            className="flex-1 bg-transparent border-none outline-none text-lg font-bold text-slate-900 placeholder:text-slate-400"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') onClose();
            }}
          />
          <div className="flex items-center gap-1 px-2 py-1 bg-white border border-slate-200 rounded-lg shadow-sm text-[10px] font-black text-slate-400">
            <Command size={10} />
            <span>K</span>
          </div>
          <button onClick={onClose} className="p-2 text-slate-300 hover:text-slate-900 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Results */}
        <div className="max-h-[60vh] overflow-y-auto p-4 custom-scrollbar">
          {/* Alunos Encontrados */}
          {results.length > 0 && (
            <div className="mb-6">
              <h3 className="px-4 mb-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Alunos Encontrados</h3>
              <div className="space-y-1">
                {results.map((student) => (
                  <button 
                    key={student.id}
                    onClick={() => handleNavigate(`/alunos/${student.id}`)}
                    className="w-full flex items-center justify-between p-4 rounded-2xl hover:bg-primary/5 group transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-slate-50 text-primary rounded-xl flex items-center justify-center font-black group-hover:bg-primary group-hover:text-white transition-all">
                        {student.full_name?.charAt(0)}
                      </div>
                      <div className="text-left">
                        <p className="font-bold text-slate-900">{student.full_name}</p>
                        <p className="text-xs text-slate-400 font-medium">{student.email}</p>
                      </div>
                    </div>
                    <ArrowRight size={18} className="text-slate-200 group-hover:text-primary transition-all translate-x-[-10px] opacity-0 group-hover:translate-x-0 group-hover:opacity-100" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Navegação Rápida */}
          <div className="mb-2">
            <h3 className="px-4 mb-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Navegação Rápida</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
              {(query.length < 2 ? navigationShortcuts : navigationShortcuts.filter(s => s.label.toLowerCase().includes(query.toLowerCase()))).map((nav) => (
                <button 
                  key={nav.href}
                  onClick={() => handleNavigate(nav.href)}
                  className="flex items-center gap-3 p-4 rounded-2xl hover:bg-slate-50 group transition-all text-left"
                >
                  <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center group-hover:bg-primary/10 group-hover:text-primary transition-all">
                    <nav.icon size={18} />
                  </div>
                  <span className="font-bold text-sm text-slate-700 group-hover:text-slate-900">{nav.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* No Results State */}
          {query.length >= 2 && results.length === 0 && !isSearching && navigationShortcuts.filter(s => s.label.toLowerCase().includes(query.toLowerCase())).length === 0 && (
            <div className="py-12 text-center">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mx-auto mb-4">
                <Search size={32} />
              </div>
              <p className="text-slate-900 font-bold">Nenhum resultado para "{query}"</p>
              <p className="text-slate-400 text-sm">Tente buscar por outro nome ou navegação.</p>
            </div>
          )}

          {/* Loading State */}
          {isSearching && (
            <div className="py-12 text-center">
              <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin mx-auto" />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-center gap-8">
          <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
            <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-slate-500">ESC</kbd>
            <span>para fechar</span>
          </div>
          <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
            <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-slate-500">↵</kbd>
            <span>para selecionar</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
