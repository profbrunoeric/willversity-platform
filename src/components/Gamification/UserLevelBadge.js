'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { UserCircle } from 'lucide-react';
import { getStudentXPDetails } from '@/app/(dashboard)/alunos/gamification-actions';

export default function UserLevelBadge({ userId }) {
  const [xp, setXp] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    async function load() {
      const data = await getStudentXPDetails(userId);
      setXp(data.total);
      setLoading(false);
    }
    load();
  }, [userId]);

  if (loading || !userId) return <div className="w-12 h-12 rounded-full bg-slate-100 animate-pulse" />;

  const xpPerLevel = 200;
  const level = Math.floor(xp / 200) + 1;
  const currentXP = xp % xpPerLevel;
  const percentage = (currentXP / xpPerLevel) * 100;
  
  // Cálculo do círculo (stroke-dasharray)
  const radius = 22;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative flex flex-col items-center group cursor-pointer">
      {/* Container da Orbe */}
      <div className="relative w-14 h-14 flex items-center justify-center">
        {/* Círculo de Progresso Background */}
        <svg className="absolute w-full h-full -rotate-90">
          <circle
            cx="28"
            cy="28"
            r={radius}
            fill="transparent"
            stroke="currentColor"
            strokeWidth="3"
            className="text-slate-100"
          />
          {/* Círculo de Progresso Ativo */}
          <motion.circle
            cx="28"
            cy="28"
            r={radius}
            fill="transparent"
            stroke="currentColor"
            strokeWidth="3"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="text-primary"
            strokeLinecap="round"
          />
        </svg>

        {/* Avatar/Ícone Central */}
        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-slate-400 shadow-inner overflow-hidden">
          <UserCircle size={28} className="group-hover:scale-110 transition-transform duration-500" />
        </div>

        {/* Glow de Nível (Efeito Inovador) */}
        <div className="absolute inset-0 bg-primary/5 rounded-full blur-md group-hover:bg-primary/20 transition-all" />
      </div>

      {/* Chip de Nível Acoplado */}
      <div className="absolute -bottom-1 bg-slate-900 text-white text-[9px] font-black px-2 py-0.5 rounded-full border-2 border-white shadow-xl flex items-center gap-1 group-hover:scale-110 transition-all">
        <span className="text-primary">LVL</span>
        {level}
      </div>

      {/* Tooltip de XP no Hover */}
      <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-all pointer-events-none bg-slate-900 text-white text-[10px] font-bold px-3 py-1.5 rounded-xl whitespace-nowrap shadow-2xl">
        {xp} XP Acumulados
      </div>
    </div>
  );
}
