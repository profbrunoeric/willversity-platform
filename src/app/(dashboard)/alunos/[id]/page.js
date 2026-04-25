import React from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, 
  MessageCircle, 
  History, 
  BookOpen, 
  Clock, 
  Calendar,
  Zap,
  Save,
  GraduationCap,
  BrainCircuit,
  Flag,
  MessageSquare
} from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { saveEvolution } from '../actions';
import EvolutionTimeline from '@/components/Alunos/EvolutionTimeline';
import ProgressionTracker from '@/components/Alunos/ProgressionTracker';
import EditStudentTrigger from '@/components/Alunos/EditStudentTrigger';
import StudentAppointments from '@/components/Alunos/StudentAppointments';

// Busca os dados do aluno e seu histórico de evolução
async function getStudentData(id) {
  const supabase = createClient();
  
  const { data: student } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .single();

  const { data: evolutions } = await supabase
    .from('lesson_evolutions')
    .select('*')
    .eq('student_id', id)
    .order('class_date', { ascending: false });

  // Buscar próximos agendamentos
  const { data: appointments } = await supabase
    .from('agenda')
    .select('*, professores(nome_completo, avatar_url)')
    .eq('student_id', id)
    .gte('start_time', new Date().toISOString())
    .order('start_time', { ascending: true })
    .limit(5);

  return { student, evolutions, appointments: appointments || [] };
}

export default async function StudentDetailPage({ params }) {
  const { student, evolutions, appointments } = await getStudentData(params.id);

  if (!student) return <div className="p-8 text-center text-slate-500">Aluno não encontrado.</div>;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Back Button & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <Link href="/alunos" className="p-2 hover:bg-slate-100 rounded-xl transition-all text-slate-500">
            <ArrowLeft size={20} />
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary text-white rounded-2xl flex items-center justify-center font-bold text-xl shadow-lg shadow-primary/20">
              {student.full_name?.charAt(0)}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-800">{student.full_name}</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-bold rounded-full uppercase tracking-widest">
                  Level {student.level}
                </span>
                <span className="text-slate-400 text-xs">•</span>
                <span className="text-slate-500 text-xs font-medium">{student.email}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <EditStudentTrigger student={student} />
          {student.phone && (
            <a 
              href={`https://wa.me/${student.phone.replace(/\D/g, '')}`} 
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-6 py-3 bg-emerald-500 text-white rounded-xl font-bold text-sm hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-200"
            >
              <MessageCircle size={18} />
              Enviar WhatsApp
            </a>
          )}
        </div>
      </div>

      {/* NOVO: Progression Tracker */}
      <ProgressionTracker currentLevel={student.level} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: New Evolution Form */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-[2.5rem] p-8 md:p-12 border border-slate-100 shadow-sm">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
                <BookOpen size={20} />
              </div>
              <h3 className="text-2xl font-black text-slate-800 tracking-tight">Registrar Evolução</h3>
            </div>

            <form action={saveEvolution} className="space-y-8">
              <input type="hidden" name="studentId" value={student.id} />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-black text-slate-400 mb-2 uppercase tracking-widest">
                    Data da Aula
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      type="date" 
                      name="classDate" 
                      defaultValue={new Date().toISOString().split('T')[0]}
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-primary/5 outline-none transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* As 5 Etapas Pedagógicas */}
              <div className="grid grid-cols-1 gap-6">
                {[
                  { name: 'warm_up', label: '1. WARM-UP', icon: Clock, placeholder: 'Como a aula começou? Quebra-gelo, revisão rápida...' },
                  { name: 'comprehensible_input', label: '2. COMPREHENSIBLE INPUT', icon: BrainCircuit, placeholder: 'Novos conceitos apresentados, vocabulário, gramática no contexto...' },
                  { name: 'guided_practice', label: '3. GUIDED PRACTICE', icon: BookOpen, placeholder: 'Exercícios controlados, correção imediata...' },
                  { name: 'meaningful_output', label: '4. MEANINGFUL OUTPUT', icon: MessageSquare, placeholder: 'Uso livre do idioma, conversação real, aplicação prática...' },
                  { name: 'consolidation', label: '5. CONSOLIDATION', icon: Flag, placeholder: 'Resumo da aula, dever de casa, pontos de melhoria...' },
                ].map((step) => (
                  <div key={step.name} className="group">
                    <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 mb-3 tracking-[0.2em] uppercase group-focus-within:text-primary transition-colors">
                      <step.icon size={14} /> {step.label}
                    </label>
                    <textarea 
                      name={step.name}
                      rows={3}
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-3xl focus:bg-white focus:border-primary/30 focus:ring-8 focus:ring-primary/5 outline-none transition-all text-sm resize-none placeholder:text-slate-300"
                      placeholder={step.placeholder}
                    ></textarea>
                  </div>
                ))}
              </div>

              <div className="pt-4">
                <button 
                  type="submit"
                  className="w-full flex items-center justify-center gap-3 py-5 bg-primary text-white rounded-3xl font-black text-base shadow-2xl shadow-primary/30 hover:scale-[1.01] active:scale-[0.99] transition-all"
                >
                  <Save size={20} />
                  SALVAR REGISTRO PEDAGÓGICO
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: Appointments & History */}
        <div className="space-y-6">
          <StudentAppointments appointments={appointments} studentId={student.id} />
          
          <EvolutionTimeline evolutions={evolutions} />

          {/* Quick Stats Card - Refined */}
          <div className="bg-slate-900 text-white rounded-[2.5rem] p-10 relative overflow-hidden shadow-2xl">
            <GraduationCap className="absolute -right-4 -bottom-4 text-white/5 w-32 h-32 rotate-12" />
            <div className="relative z-10">
              <h4 className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] mb-6">Performance</h4>
              <div className="flex items-end gap-3 mb-2">
                <span className="text-5xl font-black">92%</span>
                <span className="text-emerald-400 text-sm font-bold pb-2 flex items-center gap-1">
                  <Zap size={14} fill="currentColor" /> +4%
                </span>
              </div>
              <p className="text-white/40 text-xs font-medium leading-relaxed">Taxa de presença e engajamento nas últimas 10 sessões.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
