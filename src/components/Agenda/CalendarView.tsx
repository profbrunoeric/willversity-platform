'use client'

import React, { useState } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon,
  Clock,
  User,
  MoreVertical,
  Plus,
  Filter
} from 'lucide-react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { Appointment } from '@/types/agenda';
import type { Teacher } from '@/types/teacher';

interface CalendarViewProps {
  appointments: Appointment[];
  teachers: Teacher[];
}

export default function CalendarView({ appointments, teachers }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedTeacher, setSelectedTeacher] = useState<string>('all');

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const calendarDays = eachDayOfInterval({
    start: startDate,
    end: endDate,
  });

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  const filteredAppointments = appointments.filter(app => 
    selectedTeacher === 'all' || app.teacher_id === selectedTeacher
  );

  return (
    <div className="space-y-6">
      {/* Calendar Toolbar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex items-center bg-slate-50 p-1 rounded-2xl border border-slate-100">
            <button onClick={prevMonth} className="p-3 hover:bg-white hover:shadow-sm rounded-xl transition-all text-slate-500">
              <ChevronLeft size={20} />
            </button>
            <div className="px-6 py-2 min-w-[180px] text-center">
              <h3 className="font-black text-slate-900 capitalize">
                {format(currentDate, 'MMMM yyyy', { locale: ptBR })}
              </h3>
            </div>
            <button onClick={nextMonth} className="p-3 hover:bg-white hover:shadow-sm rounded-xl transition-all text-slate-500">
              <ChevronRight size={20} />
            </button>
          </div>
          <button 
            onClick={() => setCurrentDate(new Date())}
            className="px-6 py-4 bg-slate-50 text-slate-600 rounded-2xl font-bold text-xs hover:bg-slate-100 transition-all border border-slate-100"
          >
            HOJE
          </button>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <select 
              value={selectedTeacher}
              onChange={(e) => setSelectedTeacher(e.target.value)}
              className="pl-12 pr-10 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-xs text-slate-600 appearance-none focus:bg-white transition-all outline-none"
            >
              <option value="all">Todos os Professores</option>
              {teachers.map(t => (
                <option key={t.id} value={t.id}>{t.nome_completo}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white rounded-[3rem] border border-slate-100 shadow-xl overflow-hidden">
        {/* Days Header */}
        <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50/50">
          {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
            <div key={day} className="py-4 text-center">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{day}</span>
            </div>
          ))}
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7">
          {calendarDays.map((day, idx) => {
            const dayAppointments = filteredAppointments.filter(app => isSameDay(new Date(app.start_time), day));
            const isToday = isSameDay(day, new Date());
            const isCurrentMonth = isSameMonth(day, monthStart);

            return (
              <div 
                key={day.toString()} 
                className={`min-h-[140px] p-2 border-r border-b border-slate-100 transition-all group hover:bg-slate-50/50
                  ${!isCurrentMonth ? 'bg-slate-50/30' : ''}
                  ${idx % 7 === 6 ? 'border-r-0' : ''}
                `}
              >
                <div className="flex justify-between items-start mb-2 p-2">
                  <span className={`
                    w-8 h-8 flex items-center justify-center rounded-xl text-sm font-black transition-all
                    ${isToday ? 'bg-primary text-white shadow-lg shadow-primary/30' : isCurrentMonth ? 'text-slate-900' : 'text-slate-300'}
                  `}>
                    {format(day, 'd')}
                  </span>
                  {isToday && <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />}
                </div>

                <div className="space-y-1.5 overflow-y-auto max-h-[100px] custom-scrollbar px-1">
                  {dayAppointments.slice(0, 3).map(app => (
                    <div 
                      key={app.id}
                      className={`
                        p-2 rounded-xl border text-[9px] font-bold truncate transition-all cursor-pointer hover:scale-105
                        ${app.tipo === 'reposicao' ? 'bg-amber-50 text-amber-600 border-amber-100' : 
                          app.tipo === 'mentoria' ? 'bg-purple-50 text-purple-600 border-purple-100' :
                          'bg-blue-50 text-blue-600 border-blue-100'}
                      `}
                    >
                      {format(new Date(app.start_time), 'HH:mm')} • {app.title}
                    </div>
                  ))}
                  {dayAppointments.length > 3 && (
                    <div className="text-[9px] font-black text-slate-400 text-center uppercase tracking-widest pt-1">
                      + {dayAppointments.length - 3} mais
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
