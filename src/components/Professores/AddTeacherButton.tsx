'use client'

import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import TeacherFormModal from './TeacherFormModal';

export default function AddTeacherButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-6 py-4 bg-primary text-white rounded-2xl font-black text-sm shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
      >
        <Plus size={20} /> ADICIONAR PROFESSOR
      </button>

      <TeacherFormModal 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)} 
      />
    </>
  );
}
