'use client'

import React from 'react';
import { 
  Users, 
  Mail, 
  Phone, 
  Calendar, 
  GraduationCap,
  MoreVertical,
  MessageCircle
} from 'lucide-react';
import type { Teacher } from '@/types/teacher';
import TeacherActions from './TeacherActions';

interface TeacherListProps {
  teachers: Teacher[];
}

export default function TeacherList({ teachers }: TeacherListProps) {
  if (teachers.length === 0) {
    return (
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-20 text-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-300">
            <Users size={40} />
          </div>
          <h3 className="text-xl font-bold text-slate-900">Nenhum professor cadastrado</h3>
          <p className="text-slate-500 max-w-xs mx-auto">Comece adicionando seu primeiro professor para gerenciar o corpo docente.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-100">
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Identificação</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Especialidade & Status</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Contato</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {teachers.map((teacher) => (
              <tr key={teacher.id} className="hover:bg-slate-50/50 transition-all group">
                <td className="px-8 py-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-50 border border-slate-100 text-primary overflow-hidden rounded-2xl flex items-center justify-center font-black text-lg group-hover:border-primary transition-all">
                      {teacher.avatar_url ? (
                        <img src={teacher.avatar_url} alt={teacher.nome_completo} className="w-full h-full object-cover" />
                      ) : (
                        teacher.nome_completo.charAt(0)
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 text-base">{teacher.nome_completo}</p>
                      <p className="text-xs text-slate-400 font-medium flex items-center gap-1">
                        <Mail size={12} /> {teacher.email}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <div className="flex flex-col gap-1.5">
                    <span className="text-sm font-bold text-slate-700">{teacher.especialidade}</span>
                    <span className={`w-fit px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider border ${
                      teacher.status === 'ativo' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                      teacher.status === 'inativo' ? 'bg-red-50 text-red-600 border-red-100' :
                      'bg-amber-50 text-amber-600 border-amber-100'
                    }`}>
                      {teacher.status}
                    </span>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <div className="flex flex-col gap-2">
                    {teacher.telefone && (
                      <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                        <Phone size={14} className="text-slate-400" />
                        {teacher.telefone}
                      </div>
                    )}
                    {teacher.data_nascimento && (
                      <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                        <Calendar size={14} className="text-slate-400" />
                        {new Date(teacher.data_nascimento).toLocaleDateString('pt-BR')}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-8 py-6 text-right">
                  <TeacherActions teacher={teacher} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
