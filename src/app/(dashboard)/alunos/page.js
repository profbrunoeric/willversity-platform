import React from 'react';
import Link from 'next/link';
import { 
  Users, 
  Search, 
  Plus, 
  MessageCircle, 
  ChevronRight,
  Filter,
  MoreVertical
} from 'lucide-react';
import { getStudents, getStudentStats } from './actions';
import StudentActions from '@/components/Alunos/StudentActions';
import EnrollButton from '@/components/Alunos/EnrollButton';
import StudentFilters from '@/components/Alunos/StudentFilters';
import StudentStats from '@/components/Alunos/StudentStats';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function AlunosPage({ searchParams }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role === 'student') {
    redirect('/');
  }

  const students = await getStudents(searchParams);
  const stats = await getStudentStats();

  return (
    <div className="space-y-10 pb-20">
      {/* Header - Clean SaaS Style */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-100">
        <div>
          <span className="text-primary font-bold text-xs uppercase tracking-[0.2em] mb-2 block">Gestão Acadêmica</span>
          <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight">Alunos <span className="text-primary">&</span> Matrículas</h2>
          <p className="text-slate-500 mt-2 font-medium">Controle pedagógico e administrativo centralizado.</p>
        </div>
        <EnrollButton />
      </div>

      {/* Overview Stats */}
      <StudentStats stats={stats} />

      {/* Search & Filters */}
      <StudentFilters />

      {/* Table Container */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Identificação</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Nível Acadêmico</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Financeiro</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Comunicação</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {students.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300">
                        <Users size={32} />
                      </div>
                      <p className="text-slate-400 font-medium italic">Nenhum aluno registrado na base Willversity.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                students.map((student) => (
                  <tr key={student.id} className="hover:bg-slate-50/50 transition-all group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-slate-50 border border-slate-100 text-primary rounded-2xl flex items-center justify-center font-black text-lg group-hover:bg-primary group-hover:text-white transition-all">
                          {student.full_name?.charAt(0) || 'U'}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 text-base">{student.full_name || 'Usuário Sem Nome'}</p>
                          <p className="text-xs text-slate-400 font-medium">{student.email || 'Email não disponível'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col gap-1">
                        <span className={`w-fit px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border ${
                          student.level?.startsWith('A') ? 'bg-blue-50 text-blue-600 border-blue-100' :
                          student.level?.startsWith('B') ? 'bg-amber-50 text-amber-600 border-amber-100' :
                          'bg-emerald-50 text-emerald-600 border-emerald-100'
                        }`}>
                          {student.level || 'A1'} • {
                            student.level === 'A1' ? 'Basic' :
                            student.level === 'A2' ? 'Pre-Intermediate' :
                            student.level === 'B1' ? 'Intermediate' :
                            student.level === 'B2' ? 'Upper-Intermediate' :
                            student.level === 'C1' ? 'Advanced' :
                            student.level === 'C2' ? 'Proficient' : 'Basic'
                          }
                        </span>
                        <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full transition-all duration-1000 ${
                            student.level === 'A1' ? 'bg-blue-400 w-[15%]' :
                            student.level === 'A2' ? 'bg-blue-500 w-[30%]' :
                            student.level === 'B1' ? 'bg-amber-400 w-[50%]' :
                            student.level === 'B2' ? 'bg-amber-500 w-[70%]' :
                            student.level === 'C1' ? 'bg-emerald-400 w-[85%]' :
                            student.level === 'C2' ? 'bg-emerald-600 w-full' : 'bg-slate-300 w-[10%]'
                          }`} />
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col gap-1">
                        <span className={`w-fit px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 ${
                          student.payment_status === 'overdue' ? 'bg-rose-50 text-rose-600 border border-rose-100' :
                          student.payment_status === 'pending' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                          'bg-emerald-50 text-emerald-600 border border-emerald-100'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            student.payment_status === 'overdue' ? 'bg-rose-500' :
                            student.payment_status === 'pending' ? 'bg-amber-500' :
                            'bg-emerald-500'
                          }`} />
                          {
                            student.payment_status === 'overdue' ? 'Atrasado' :
                            student.payment_status === 'pending' ? 'Pendente' : 'Em Dia'
                          }
                        </span>
                        <p className="text-[10px] text-slate-400 font-bold ml-1 uppercase tracking-tighter">Mensalidade Maio</p>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      {student.phone ? (
                        <a 
                          href={`https://wa.me/${student.phone.replace(/\D/g, '')}`} 
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl font-bold text-xs hover:bg-emerald-600 hover:text-white transition-all"
                        >
                          <MessageCircle size={16} />
                          WhatsApp
                        </a>
                      ) : (
                        <span className="text-[10px] text-slate-300 font-bold uppercase tracking-widest">Sem Contato</span>
                      )}
                    </td>
                    <td className="px-8 py-6 text-right">
                      <StudentActions student={student} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
