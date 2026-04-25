'use client'

import React from 'react';
import { Calendar, Clock, User, ArrowRight, CalendarDays } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import MakeUpBookingModal from '../Agenda/MakeUpBookingModal';

interface StudentAppointmentsProps {
  appointments: any[];
}

export default function StudentAppointments({ appointments, studentId }: { appointments: any[], studentId: string }) {
  const [isMakeUpOpen, setIsMakeUpOpen] = React.useState(false);

  if (!appointments || appointments.length === 0) {
    return (
      <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-slate-50 text-slate-400 rounded-lg">
            <Calendar size={20} />
          </div>
          <h3 className="text-xl font-black text-slate-800 tracking-tight">Próximas Aulas</h3>
        </div>
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <CalendarDays className="text-slate-200" size={32} />
          </div>
          <p className="text-slate-400 text-sm font-medium">Nenhuma aula agendada para os próximos dias.</p>
        </div>
        <button 
          onClick={() => setIsMakeUpOpen(true)}
          className="w-full mt-4 py-4 bg-primary/5 text-primary hover:bg-primary hover:text-white rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all"
        >
          Solicitar Reposição
        </button>

        <MakeUpBookingModal 
          isOpen={isMakeUpOpen} 
          onClose={() => setIsMakeUpOpen(false)} 
          studentId={studentId} 
        />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm h-full">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 text-primary rounded-lg">
            <Calendar size={20} />
          </div>
          <h3 className="text-xl font-black text-slate-800 tracking-tight">Próximas Aulas</h3>
        </div>
        <span className="px-3 py-1 bg-slate-100 text-slate-500 text-[10px] font-black rounded-full uppercase tracking-widest">
          {appointments.length} Agendada(s)
        </span>
      </div>

      <div className="space-y-4">
        {appointments.map((app) => {
          const startDate = new Date(app.start_time);
          
          return (
            <div key={app.id} className="group relative p-5 bg-slate-50 hover:bg-white rounded-3xl border border-transparent hover:border-slate-100 hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-500">
              <div className="flex items-start justify-between gap-4">
                <div className="flex gap-4">
                  {/* Date Badge */}
                  <div className="flex flex-col items-center justify-center min-w-[50px] h-[50px] bg-white rounded-2xl shadow-sm border border-slate-100 group-hover:bg-primary group-hover:border-primary transition-all duration-500">
                    <span className="text-[10px] font-black text-slate-400 group-hover:text-white/60 uppercase leading-none mb-1">
                      {format(startDate, 'MMM', { locale: ptBR })}
                    </span>
                    <span className="text-lg font-black text-slate-900 group-hover:text-white leading-none">
                      {format(startDate, 'dd')}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-bold text-slate-900 text-sm line-clamp-1">{app.title}</h4>
                    <div className="flex items-center gap-3 mt-1.5">
                      <div className="flex items-center gap-1 text-slate-400">
                        <Clock size={12} />
                        <span className="text-[10px] font-bold">{format(startDate, 'HH:mm')}h</span>
                      </div>
                      <div className="flex items-center gap-1 text-slate-400">
                        <User size={12} />
                        <span className="text-[10px] font-bold truncate max-w-[100px]">
                          {app.professores?.nome_completo || 'Professor'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className={`
                  px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest
                  ${app.status === 'confirmado' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}
                `}>
                  {app.status}
                </div>
              </div>
              
              <div className="absolute right-4 bottom-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all">
                <ArrowRight size={14} className="text-primary" />
              </div>
            </div>
          );
        })}
      </div>

      <button 
        onClick={() => setIsMakeUpOpen(true)}
        className="w-full mt-8 py-4 border-2 border-dashed border-slate-100 text-slate-400 hover:text-primary hover:border-primary/30 hover:bg-primary/5 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all"
      >
        Solicitar Reposição
      </button>

      <MakeUpBookingModal 
        isOpen={isMakeUpOpen} 
        onClose={() => setIsMakeUpOpen(false)} 
        studentId={studentId} 
      />
    </div>
  );
}
