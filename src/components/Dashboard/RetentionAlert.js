import React from 'react';
import { AlertCircle, ChevronRight, MessageCircle, UserX } from 'lucide-react';
import Link from 'next/link';

export default function RetentionAlert({ students }) {
  if (!students || students.length === 0) return null;

  return (
    <div className="bg-white border border-rose-100 rounded-[2.5rem] overflow-hidden shadow-sm shadow-rose-500/5">
      <div className="p-8 bg-rose-50/50 border-b border-rose-100 flex items-center justify-between">
        <div className="flex items-center gap-3 text-rose-600">
          <AlertCircle size={24} />
          <h3 className="text-lg font-black tracking-tight uppercase">Alerta de Retenção</h3>
        </div>
        <span className="px-3 py-1 bg-rose-600 text-white text-[10px] font-black rounded-full animate-pulse">
          {students.length} ALUNOS INATIVOS
        </span>
      </div>
      
      <div className="divide-y divide-rose-50">
        {students.map((student) => (
          <div key={student.id} className="p-6 px-8 flex items-center justify-between hover:bg-rose-50/30 transition-all group">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-white border border-rose-100 text-rose-500 rounded-xl flex items-center justify-center font-bold text-sm">
                {student.full_name?.charAt(0)}
              </div>
              <div>
                <p className="font-bold text-slate-900">{student.full_name}</p>
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Inativo há +15 dias</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Link 
                href={`/alunos/${student.id}`}
                className="p-2 text-slate-300 hover:text-rose-500 hover:bg-white rounded-lg transition-all"
              >
                <ChevronRight size={18} />
              </Link>
            </div>
          </div>
        ))}
      </div>
      
      <div className="p-6 px-8 bg-rose-50/20">
        <p className="text-[10px] text-rose-400 font-bold text-center uppercase tracking-[0.1em]">
          Estes alunos não possuem registros pedagógicos recentes.
        </p>
      </div>
    </div>
  );
}
