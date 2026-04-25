'use client';

import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import EnrollStudentModal from './EnrollStudentModal';

export default function EnrollButton() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <button 
        onClick={() => setIsModalOpen(true)}
        className="flex items-center gap-2 px-8 py-4 bg-primary text-white rounded-full font-bold text-sm hover:scale-105 active:scale-95 transition-all shadow-xl shadow-primary/30"
      >
        <Plus size={20} />
        Matricular Novo Aluno
      </button>

      <EnrollStudentModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </>
  );
}
