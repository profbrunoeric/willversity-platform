'use client'

import React, { useState } from 'react';
import { Edit3, Trash2, Loader2, MoreVertical } from 'lucide-react';
import type { Teacher } from '@/types/teacher';
import { deleteTeacher } from '@/app/(dashboard)/professores/actions';
import TeacherFormModal from './TeacherFormModal';

interface TeacherActionsProps {
  teacher: Teacher;
}

export default function TeacherActions({ teacher }: TeacherActionsProps) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (confirm(`Tem certeza que deseja remover o professor ${teacher.nome_completo}?`)) {
      setIsDeleting(true);
      const result = await deleteTeacher(teacher.id);
      if (!result.success) {
        alert(result.error);
        setIsDeleting(false);
      }
    }
  };

  return (
    <div className="flex items-center justify-end gap-3">
      {/* Edit Button */}
      <button 
        onClick={() => setIsEditOpen(true)}
        className="p-3 bg-white border border-slate-100 text-slate-400 hover:text-primary hover:shadow-md rounded-xl transition-all"
        title="Editar Professor"
      >
        <Edit3 size={20} />
      </button>

      {/* Delete Button */}
      <button 
        onClick={handleDelete}
        disabled={isDeleting}
        className="p-3 bg-white border border-slate-100 text-slate-400 hover:text-rose-500 hover:border-rose-100 hover:shadow-md rounded-xl transition-all disabled:opacity-50"
        title="Remover Professor"
      >
        {isDeleting ? (
          <Loader2 size={20} className="animate-spin" />
        ) : (
          <Trash2 size={20} />
        )}
      </button>

      {/* Edit Modal */}
      <TeacherFormModal 
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        teacher={teacher}
      />
    </div>
  );
}
