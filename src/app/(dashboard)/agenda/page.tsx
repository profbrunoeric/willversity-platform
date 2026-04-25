'use client'

import React, { useState, useEffect } from 'react';
import { 
  Calendar as CalendarIcon, 
  Plus, 
  Search,
  Users,
  Clock,
  ArrowRight
} from 'lucide-react';
import { getAppointments } from './actions';
import { getTeachers } from '../professores/actions';
import { getStudents } from '../alunos/actions';
import CalendarView from '@/components/Agenda/CalendarView';
import BookingModal from '@/components/Agenda/BookingModal';
import type { Appointment } from '@/types/agenda';
import type { Teacher } from '@/types/teacher';
import { createClient } from '@/lib/supabase/client';

export default function AgendaPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    
    async function loadInitialData() {
      setLoading(true);
      try {
        const [appResult, teachersResult, studentsData] = await Promise.all([
          getAppointments(),
          getTeachers(),
          getStudents()
        ]);

        if (appResult.success) setAppointments(appResult.data || []);
        if (teachersResult.success) setTeachers(teachersResult.data || []);
        setStudents(studentsData || []);
      } catch (error) {
        console.error('Error loading agenda data:', error);
      } finally {
        setLoading(false);
      }
    }

    loadInitialData();

    // Sincronização Realtime
    const channel = supabase
      .channel('agenda-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'agenda'
        },
        async () => {
          console.log('Realtime change detected in agenda!');
          const result = await getAppointments();
          if (result.success) setAppointments(result.data || []);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Sincronizando Agenda...</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-100">
        <div>
          <span className="text-primary font-bold text-xs uppercase tracking-[0.2em] mb-2 block">Operacional</span>
          <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight">Agenda <span className="text-primary">Estratégica</span></h2>
          <p className="text-slate-500 mt-2 font-medium">Controle de aulas, mentorias e reposições em tempo real.</p>
        </div>
        <button 
          onClick={() => setIsBookingOpen(true)}
          className="flex items-center gap-2 px-8 py-5 bg-slate-900 text-white rounded-2xl font-black text-sm shadow-2xl shadow-slate-900/20 hover:scale-105 active:scale-95 transition-all"
        >
          <Plus size={20} /> NOVO AGENDAMENTO
        </button>
      </div>

      {/* Main Calendar View */}
      <CalendarView appointments={appointments} teachers={teachers} />

      {/* Booking Modal */}
      <BookingModal 
        isOpen={isBookingOpen} 
        onClose={() => setIsBookingOpen(false)} 
        teachers={teachers}
        students={students.map(s => ({ id: s.id, full_name: s.full_name }))}
      />
    </div>
  );
}
