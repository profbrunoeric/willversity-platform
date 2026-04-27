'use client';

import React, { useState } from 'react';
import { UserCheck, UserMinus, Loader2 } from 'lucide-react';
import { recordAttendance } from '@/app/(dashboard)/alunos/actions';

export default function AttendanceQuickActions({ studentId, currentStatus, appointmentId }) {
  const [status, setStatus] = useState(currentStatus || null);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleAction = async (newStatus) => {
    setIsUpdating(true);
    const res = await recordAttendance(studentId, newStatus, appointmentId);
    if (res.success) {
      setStatus(newStatus === 'present' ? 'completed' : 'missed');
    }
    setIsUpdating(false);
  };

  return (
    <div className="flex items-center justify-center gap-2">
      <button
        onClick={() => handleAction('present')}
        disabled={isUpdating || status === 'completed'}
        className={`p-2.5 rounded-xl transition-all border ${
          status === 'completed' 
            ? 'bg-emerald-500 text-white border-emerald-500 shadow-lg shadow-emerald-200' 
            : 'bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-600 hover:text-white'
        }`}
        title="Marcar Presença"
      >
        {isUpdating && status === 'present' ? <Loader2 size={18} className="animate-spin" /> : <UserCheck size={18} />}
      </button>

      <button
        onClick={() => handleAction('absent')}
        disabled={isUpdating || status === 'missed'}
        className={`p-2.5 rounded-xl transition-all border ${
          status === 'missed' 
            ? 'bg-rose-500 text-white border-rose-500 shadow-lg shadow-rose-200' 
            : 'bg-rose-50 text-rose-600 border-rose-100 hover:bg-rose-600 hover:text-white'
        }`}
        title="Marcar Falta"
      >
        {isUpdating && status === 'absent' ? <Loader2 size={18} className="animate-spin" /> : <UserMinus size={18} />}
      </button>
    </div>
  );
}
