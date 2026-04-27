'use client'

import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import BookingModal from '@/components/Agenda/BookingModal';
import type { Teacher } from '@/types/teacher';

interface DashboardHeaderProps {
  firstName: string;
  platformName: string;
  teachers: Teacher[];
  students: { id: string, full_name: string }[];
}

export default function DashboardHeader({ firstName, platformName, teachers, students }: DashboardHeaderProps) {
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  return (
    <>
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2 border-b border-slate-200/50">
        <div>
          <span className="text-primary font-bold text-xs uppercase tracking-[0.2em] mb-2 block">Área do Coordenador</span>
          <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight">
            Bem-vindo, <span className="text-primary">{firstName}</span>!
          </h2>
          <p className="text-slate-500 mt-2 font-medium text-lg">O pulso da <span className="text-primary font-bold">{platformName}</span> em tempo real.</p>
        </div>
        
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsBookingOpen(true)}
            className="flex items-center gap-2 px-6 py-4 bg-primary text-white rounded-full font-bold text-sm hover:scale-105 active:scale-95 transition-all shadow-xl shadow-primary/30"
          >
            <Plus size={20} />
            Nova Aula
          </button>
        </div>
      </div>

      <BookingModal 
        isOpen={isBookingOpen} 
        onClose={() => setIsBookingOpen(false)} 
        teachers={teachers}
        students={students}
      />
    </>
  );
}
