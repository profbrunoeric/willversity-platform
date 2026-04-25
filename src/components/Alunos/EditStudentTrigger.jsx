'use client';

import React, { useState } from 'react';
import { Settings } from 'lucide-react';
import EditStudentModal from './EditStudentModal';

export default function EditStudentTrigger({ student }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-50 transition-all shadow-sm"
      >
        <Settings size={18} />
        Editar Perfil
      </button>

      <EditStudentModal 
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        student={student}
      />
    </>
  );
}
