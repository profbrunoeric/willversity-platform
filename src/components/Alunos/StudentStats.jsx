import React from 'react';
import { Users, Zap, GraduationCap, TrendingUp } from 'lucide-react';

export default function StudentStats({ stats }) {
  // Calcular o nível mais comum
  const levelCounts = stats.levelDist.reduce((acc, curr) => {
    if (curr.level) {
      acc[curr.level] = (acc[curr.level] || 0) + 1;
    }
    return acc;
  }, {});
  
  const topLevel = Object.entries(levelCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || '---';

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
      {/* Total Students */}
      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center gap-6 relative overflow-hidden group hover:border-primary/20 transition-all">
        <div className="w-16 h-16 bg-primary/5 rounded-2xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
          <Users size={32} />
        </div>
        <div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total de Alunos</p>
          <h3 className="text-3xl font-black text-slate-900 tracking-tight">{stats.totalActive}</h3>
        </div>
        <div className="absolute -right-4 -top-4 text-slate-50 w-24 h-24 rotate-12 opacity-50">
          <Users size={96} />
        </div>
      </div>

      {/* Weekly Evolutions */}
      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center gap-6 relative overflow-hidden group hover:border-amber-200 transition-all">
        <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-500 group-hover:scale-110 transition-transform">
          <Zap size={32} />
        </div>
        <div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Evoluções (7 dias)</p>
          <h3 className="text-3xl font-black text-slate-900 tracking-tight">{stats.recentEvolutions}</h3>
        </div>
        <div className="absolute -right-4 -top-4 text-slate-50 w-24 h-24 rotate-12 opacity-50">
          <TrendingUp size={96} />
        </div>
      </div>

      {/* Most Common Level */}
      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center gap-6 relative overflow-hidden group hover:border-emerald-200 transition-all">
        <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform">
          <GraduationCap size={32} />
        </div>
        <div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Nível Predominante</p>
          <h3 className="text-3xl font-black text-slate-900 tracking-tight">{topLevel}</h3>
        </div>
        <div className="absolute -right-4 -top-4 text-slate-50 w-24 h-24 rotate-12 opacity-50">
          <GraduationCap size={96} />
        </div>
      </div>
    </div>
  );
}
