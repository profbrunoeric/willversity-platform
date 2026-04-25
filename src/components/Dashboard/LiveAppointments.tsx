'use client'

import React, { useState, useEffect } from 'react';
import { BookOpen, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { getAppointments } from '@/app/(dashboard)/agenda/actions';
import { createClient } from '@/lib/supabase/client';
import type { Appointment } from '@/types/agenda';

interface LiveAppointmentsProps {
  initialAppointments: Appointment[];
}

export default function LiveAppointments({ initialAppointments }: LiveAppointmentsProps) {
  const [appointments, setAppointments] = useState<Appointment[]>(initialAppointments);

  useEffect(() => {
    const supabase = createClient();
    
    const channel = supabase
      .channel('dashboard-agenda')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'agenda' },
        async () => {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const tonight = new Date();
          tonight.setHours(23, 59, 59, 999);
          
          const result = await getAppointments({
            startDate: today.toISOString(),
            endDate: tonight.toISOString()
          });
          
          if (result.success) {
            setAppointments(result.data || []);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="glass-card overflow-hidden h-full">
      <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-white/30">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-primary/10 text-primary rounded-2xl">
            <BookOpen size={24} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900">Próximas Sessões</h3>
            <p className="text-xs text-slate-500 font-medium">Cronograma de hoje</p>
          </div>
        </div>
        <Link 
          href="/agenda" 
          className="text-sm font-bold text-primary hover:bg-primary/5 px-4 py-2 rounded-xl transition-all"
        >
          Explorar Agenda
        </Link>
      </div>
      
      <div className="p-6">
        <div className="space-y-4">
          {!appointments || appointments.length === 0 ? (
            <div className="text-center py-12 text-slate-400 italic text-sm">
              Nenhuma sessão agendada para hoje.
            </div>
          ) : (
            appointments.map((app) => (
              <div key={app.id} className="flex items-center justify-between p-5 hover:bg-white rounded-[2rem] transition-all border border-transparent hover:border-slate-100 hover:shadow-sm group">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 bg-slate-50 rounded-2xl flex flex-col items-center justify-center border border-slate-100 group-hover:bg-primary group-hover:border-primary transition-all">
                    <span className="text-lg font-black text-slate-900 group-hover:text-white leading-none">
                      {format(new Date(app.start_time), 'HH:mm')}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-lg">{app.profiles?.full_name || 'Slot Livre'}</h4>
                    <p className="text-sm text-slate-500 font-medium truncate max-w-[200px]">
                      {app.title} • Prof. {app.professores?.nome_completo}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`px-4 py-2 text-[10px] font-black rounded-full uppercase tracking-wider ${
                    app.status === 'confirmado' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100/50 text-amber-700'
                  }`}>
                    {app.status}
                  </span>
                  <Link href={`/agenda`} className="p-3 bg-slate-50 text-slate-400 rounded-full hover:bg-primary hover:text-white transition-all">
                    <ArrowUpRight size={20} />
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
