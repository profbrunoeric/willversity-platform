import React from 'react';
import { 
  Users, 
  Plus, 
  GraduationCap
} from 'lucide-react';
import { getTeachers } from './actions';
import TeacherList from '@/components/Professores/TeacherList';
import AddTeacherButton from '@/components/Professores/AddTeacherButton';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function ProfessoresPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  // Professores e Alunos não acessam a gestão de professores
  if (profile?.role === 'student' || profile?.role === 'teacher') {
    redirect('/');
  }

  const { data: teachers = [], error } = await getTeachers();

  if (error) {
    return (
      <div className="p-10 text-center bg-red-50 text-red-600 rounded-2xl border border-red-100">
        <h3 className="font-bold text-lg">Erro ao carregar professores</h3>
        <p className="text-sm opacity-80">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-20">
      {/* Header - Clean SaaS Style */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-100">
        <div>
          <span className="text-primary font-bold text-xs uppercase tracking-[0.2em] mb-2 block">Administrativo</span>
          <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight">Corpo <span className="text-primary">Docente</span></h2>
          <p className="text-slate-500 mt-2 font-medium">Gestão de professores e especialistas da plataforma.</p>
        </div>
        <AddTeacherButton />
      </div>

      {/* Stats Summary (Mini) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center">
            <Users size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total</p>
            <p className="text-2xl font-black text-slate-900">{teachers.length}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
            <GraduationCap size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Ativos</p>
            <p className="text-2xl font-black text-slate-900">
              {teachers.filter(t => t.status === 'ativo').length}
            </p>
          </div>
        </div>
      </div>

      {/* Teachers List */}
      <TeacherList teachers={teachers} />
    </div>
  );
}
