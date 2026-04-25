'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ChevronRight, Edit3, Archive, Loader2, RotateCcw } from 'lucide-react';
import XPLauncher from '@/components/Gamification/XPLauncher';
import EditStudentModal from './EditStudentModal';
import { archiveStudent } from '@/app/(dashboard)/alunos/actions';

export default function StudentActions({ student }) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);

  const isArchived = student.status === 'archived';

  const handleArchive = async () => {
    const actionLabel = isArchived ? 'restaurar' : 'arquivar';
    if (confirm(`Deseja ${actionLabel} ${student.full_name}?`)) {
      setIsArchiving(true);
      const result = await archiveStudent(student.id);
      if (!result.success) {
        alert(result.error);
        setIsArchiving(false);
      }
    }
  };

  return (
    <div className="flex items-center justify-end gap-3">
      {/* Lançador de XP */}
      <XPLauncher studentId={student.id} studentName={student.full_name} />

      {/* Botão de Editar */}
      {!isArchived && (
        <button 
          onClick={() => setIsEditOpen(true)}
          className="p-3 bg-white border border-slate-100 text-slate-400 hover:text-primary hover:shadow-md rounded-xl transition-all"
          title="Editar Aluno"
        >
          <Edit3 size={20} />
        </button>
      )}

      {/* Link para Detalhes */}
      <Link 
        href={`/alunos/${student.id}`}
        className="p-3 bg-white border border-slate-100 text-slate-400 hover:text-primary hover:shadow-md rounded-xl transition-all"
        title="Ver Evolução"
      >
        <ChevronRight size={20} />
      </Link>

      {/* Botão de Arquivar / Restaurar */}
      <button 
        onClick={handleArchive}
        disabled={isArchiving}
        className={`p-3 bg-white border border-slate-100 rounded-xl transition-all disabled:opacity-50 hover:shadow-md ${
          isArchived 
            ? 'text-emerald-500 hover:border-emerald-100' 
            : 'text-slate-400 hover:text-rose-500 hover:border-rose-100'
        }`}
        title={isArchived ? "Restaurar Aluno" : "Arquivar Aluno"}
      >
        {isArchiving ? (
          <Loader2 size={20} className="animate-spin" />
        ) : isArchived ? (
          <RotateCcw size={20} />
        ) : (
          <Archive size={20} />
        )}
      </button>

      {/* Modal de Edição */}
      <EditStudentModal 
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        student={student}
      />
    </div>
  );
}
