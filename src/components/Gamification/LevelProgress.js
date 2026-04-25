'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Zap, Star, Target } from 'lucide-react';
import { getStudentXPDetails } from '@/app/(dashboard)/alunos/gamification-actions';

export default function LevelProgress({ studentId }) {
  const [xpData, setXpData] = useState({ total: 0, history: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadXP() {
      const data = await getStudentXPDetails(studentId);
      setXpData(data);
      setLoading(false);
    }
    loadXP();
  }, [studentId]);

  if (loading) return null;

  // Lógica de Nível: Cada 200 XP = 1 Nível
  const xpPerLevel = 200;
  const currentLevel = Math.floor(xpData.total / xpPerLevel) + 1;
  const currentLevelXP = xpData.total % xpPerLevel;
  const progressPercent = (currentLevelXP / xpPerLevel) * 100;

  const getRankName = (level) => {
    if (level < 3) return 'Voyager Starter';
    if (level < 6) return 'Fluent Explorer';
    if (level < 10) return 'Academic Elite';
    return 'English Legend';
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass-card p-8 relative overflow-hidden group mb-10"
    >
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-primary/10 transition-all duration-700" />
      
      <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
        {/* Nível Badge */}
        <div className="relative">
          <div className="w-24 h-24 bg-slate-900 rounded-[2rem] flex flex-col items-center justify-center border-4 border-white shadow-2xl rotate-3 group-hover:rotate-0 transition-transform duration-500">
            <span className="text-[10px] font-black text-primary uppercase tracking-widest">LEVEL</span>
            <span className="text-4xl font-black text-white">{currentLevel}</span>
          </div>
          <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white shadow-lg border-2 border-white animate-bounce">
            <Star size={18} fill="currentColor" />
          </div>
        </div>

        {/* Info & Progress */}
        <div className="flex-1 w-full space-y-4">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-2">
            <div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                {getRankName(currentLevel)}
                <span className="px-3 py-1 bg-primary/10 text-primary text-[10px] rounded-lg uppercase tracking-widest">Rank Atual</span>
              </h3>
              <p className="text-slate-500 font-medium text-sm">Você acumulou <span className="text-primary font-bold">{xpData.total} XP</span> na sua jornada acadêmica.</p>
            </div>
            <div className="text-right">
              <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Próximo Nível: {xpPerLevel - currentLevelXP} XP</span>
            </div>
          </div>

          {/* Progress Bar Container */}
          <div className="relative h-4 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200/50 p-0.5">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className="h-full bg-gradient-to-r from-primary to-indigo-600 rounded-full relative"
            >
              <div className="absolute top-0 right-0 h-full w-4 bg-white/20 skew-x-12 animate-pulse" />
            </motion.div>
          </div>

          {/* Mini Stats Categorias */}
          <div className="flex flex-wrap gap-4 pt-2">
            <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-tighter bg-slate-50 px-3 py-2 rounded-xl border border-slate-100">
              <Zap size={14} className="text-amber-500" /> +50% Speaking
            </div>
            <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-tighter bg-slate-50 px-3 py-2 rounded-xl border border-slate-100">
              <Target size={14} className="text-emerald-500" /> 80% Foco
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
