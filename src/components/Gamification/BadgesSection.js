'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Award, Zap, BookOpen, Star, ShieldCheck, Target } from 'lucide-react';

export default function BadgesSection({ xp, progress, level }) {
  // Lógica de cálculo das medalhas
  const badges = [
    {
      id: 'welcome',
      icon: Star,
      label: 'Explorador',
      description: 'Iniciou sua jornada na Willversity.',
      unlocked: true, // Todos ganham ao entrar
      color: 'bg-blue-500'
    },
    {
      id: 'warrior',
      icon: Zap,
      label: 'Guerreiro',
      description: 'Alcançou os primeiros 500 XP.',
      unlocked: xp >= 500,
      color: 'bg-amber-500'
    },
    {
      id: 'scholar',
      icon: BookOpen,
      label: 'Estudioso',
      description: 'Concluiu pelo menos 5 aulas.',
      unlocked: progress?.completed >= 5,
      color: 'bg-emerald-500'
    },
    {
      id: 'legend',
      icon: ShieldCheck,
      label: 'Legendário',
      description: 'Atingiu o nível de elite na plataforma.',
      unlocked: xp >= 2000,
      color: 'bg-indigo-600'
    },
    {
      id: 'master',
      icon: Target,
      label: 'Finalizador',
      description: 'Completou 100% de todo o conteúdo.',
      unlocked: progress?.percentage === 100,
      color: 'bg-rose-500'
    }
  ];

  return (
    <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-sm">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
          <Award size={20} />
        </div>
        <div>
          <h3 className="text-xl font-black text-slate-800 tracking-tight">Suas Conquistas</h3>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Galeria de Medalhas</p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
        {badges.map((badge) => (
          <div 
            key={badge.id}
            className={`relative flex flex-col items-center gap-3 p-4 rounded-3xl border transition-all ${
              badge.unlocked 
                ? 'bg-slate-50 border-slate-100 opacity-100 grayscale-0' 
                : 'bg-white border-dashed border-slate-200 opacity-40 grayscale pointer-events-none'
            }`}
          >
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg ${badge.unlocked ? badge.color : 'bg-slate-200'}`}>
              <badge.icon size={24} />
            </div>
            <div className="text-center">
              <p className="text-xs font-black text-slate-900 leading-tight">{badge.label}</p>
              {badge.unlocked && (
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center text-[10px] text-white border-2 border-white"
                >
                  ✓
                </motion.div>
              )}
            </div>
            
            {/* Tooltip-like description on hover */}
            <div className="absolute inset-0 bg-slate-900/90 text-white p-4 rounded-3xl opacity-0 hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-center">
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/50 mb-1">{badge.label}</p>
              <p className="text-[10px] font-medium leading-tight">{badge.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
