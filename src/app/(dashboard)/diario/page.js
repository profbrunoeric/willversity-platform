import React from 'react';
import { ClipboardList, Calendar, CheckCircle2, XCircle, Search, Clock, Users } from 'lucide-react';
import { getAppointments } from '@/app/(dashboard)/agenda/actions';
import { createClient } from '@/lib/supabase/server';
import AttendanceQuickActions from '@/components/Alunos/AttendanceQuickActions';

export default async function DiarioPage() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tonight = new Date();
  tonight.setHours(23, 59, 59, 999);

  // Buscar agendamentos de hoje
  const result = await getAppointments({
    startDate: today.toISOString(),
    endDate: tonight.toISOString()
  });

  const appointments = result.success ? result.data : [];

  const presentCount = appointments?.filter(a => a.status === 'completed').length || 0;
  const absentCount = appointments?.filter(a => a.status === 'missed').length || 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
            <ClipboardList className="text-primary" size={32} />
            Diário de Classe Digital
          </h2>
          <p className="text-slate-500 font-medium mt-1">
            {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>
        
        <div className="flex items-center gap-4 bg-white p-2 rounded-2xl border border-slate-100 shadow-sm">
          <div className="px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl text-xs font-black uppercase tracking-widest">
            {presentCount} Presentes
          </div>
          <div className="px-4 py-2 bg-rose-50 text-rose-600 rounded-xl text-xs font-black uppercase tracking-widest">
            {absentCount} Faltas
          </div>
        </div>
      </div>

      {/* Agenda Table */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-50 flex items-center justify-between">
          <h4 className="font-black text-slate-800 uppercase tracking-widest text-sm">Agendamentos do Dia</h4>
          <div className="flex items-center gap-2 text-slate-400 text-xs font-bold">
            <Clock size={16} />
            Atualizado em tempo real
          </div>
        </div>

        {!appointments || appointments.length === 0 ? (
          <div className="p-20 text-center flex flex-col items-center gap-4">
            <div className="w-20 h-20 bg-slate-50 text-slate-200 rounded-full flex items-center justify-center">
              <Calendar size={40} />
            </div>
            <div>
              <p className="font-bold text-slate-800">Nenhuma aula agendada para hoje.</p>
              <p className="text-sm text-slate-400">Verifique a agenda completa para outros dias.</p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Horário</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Aluno</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Professor</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Diário</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {appointments.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2 font-black text-slate-900 text-sm">
                        <Clock size={16} className="text-primary" />
                        {new Date(app.start_time).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-slate-100 rounded-lg flex items-center justify-center font-bold text-xs text-slate-400 group-hover:bg-primary group-hover:text-white transition-all">
                          {app.profiles?.full_name?.charAt(0)}
                        </div>
                        <span className="font-bold text-slate-800 text-sm">{app.profiles?.full_name}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                        <Users size={14} />
                        {app.professores?.nome_completo}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <AttendanceQuickActions 
                        studentId={app.student_id} 
                        currentStatus={app.status}
                        appointmentId={app.id}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
