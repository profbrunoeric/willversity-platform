import React from 'react';
import { BookOpen, Trophy, ArrowRight, Zap } from 'lucide-react';
import Link from 'next/link';

export default function CourseProgress({ progress }) {
  if (!progress) return null;

  const { total, completed, percentage } = progress;

  // Frases dinâmicas baseadas no progresso
  const getMotivation = () => {
    if (percentage === 0) return 'Sua jornada começa agora! Vamos para a primeira aula?';
    if (percentage < 30) return 'Bom começo! Continue mantendo a consistência.';
    if (percentage < 60) return 'Você já passou de um terço do caminho! Mandando bem.';
    if (percentage < 90) return 'Quase lá! Falta muito pouco para o seu objetivo.';
    return 'Excelente! Você é um exemplo de dedicação na Willversity.';
  };

  return (
    <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-sm overflow-hidden relative group">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 p-8 text-primary/5 -translate-y-4 translate-x-4 group-hover:scale-110 transition-all">
        <Zap size={120} />
      </div>

      <div className="flex flex-col md:flex-row items-center gap-10 relative z-10">
        {/* Circle Progress (SVG) */}
        <div className="relative flex-shrink-0">
          <svg className="w-32 h-32 transform -rotate-90">
            <circle
              cx="64"
              cy="64"
              r="58"
              stroke="currentColor"
              strokeWidth="10"
              fill="transparent"
              className="text-slate-50"
            />
            <circle
              cx="64"
              cy="64"
              r="58"
              stroke="currentColor"
              strokeWidth="10"
              fill="transparent"
              strokeDasharray={364.4}
              strokeDashoffset={364.4 - (364.4 * percentage) / 100}
              className="text-primary transition-all duration-1000 ease-out"
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-black text-slate-900">{percentage}%</span>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Concluído</span>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 space-y-4 text-center md:text-left">
          <div>
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">Sua Jornada na Willversity</h3>
            <p className="text-slate-500 font-medium">{getMotivation()}</p>
          </div>

          <div className="flex flex-wrap items-center justify-center md:justify-start gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
                <BookOpen size={16} />
              </div>
              <div className="text-xs">
                <p className="font-black text-slate-900">{completed} / {total}</p>
                <p className="text-slate-400 font-bold uppercase tracking-tight">Aulas Assistidas</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-amber-50 text-amber-600 rounded-lg flex items-center justify-center">
                <Trophy size={16} />
              </div>
              <div className="text-xs">
                <p className="font-black text-slate-900">{total - completed}</p>
                <p className="text-slate-400 font-bold uppercase tracking-tight">Restantes</p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Button */}
        <Link 
          href="/sala-de-aula"
          className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-sm flex items-center gap-3 hover:bg-primary transition-all shadow-xl active:scale-95"
        >
          CONTINUAR ESTUDANDO
          <ArrowRight size={18} />
        </Link>
      </div>
    </div>
  );
}
