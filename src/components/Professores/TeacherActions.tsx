'use client'

import React, { useState } from 'react';
import { Edit3, Trash2, Loader2, MessageCircle } from 'lucide-react';
import type { Teacher } from '@/types/teacher';
import { deleteTeacher } from '@/app/(dashboard)/professores/actions';
import TeacherFormModal from './TeacherFormModal';
import TeacherWhatsAppAlerts from './TeacherWhatsAppAlerts';

interface TeacherActionsProps {
  teacher: Teacher;
}

export default function TeacherActions({ teacher }: TeacherActionsProps) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isWhatsAppOpen, setIsWhatsAppOpen] = useState(false);

  const handleDelete = async () => {
    if (!confirm(`Tem certeza que deseja remover o professor ${teacher.nome_completo}?`)) return;

    setIsDeleting(true);
    try {
      const result = await deleteTeacher(teacher.id);
      if (!result.success) {
        alert(`Erro ao excluir: ${result.error}`);
      }
      // Não resetamos setIsDeleting(false) aqui se for sucesso 
      // para evitar o "flicker" antes da página revalidar, 
      // MAS vamos adicionar um safety timeout ou permitir reset se a página não atualizar.
    } catch (err) {
      alert('Ocorreu um erro inesperado ao tentar excluir.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex items-center justify-end gap-3">
      {/* WhatsApp Button */}
      {teacher.telefone && (
        <button 
          onClick={() => setIsWhatsAppOpen(true)}
          className="p-3 bg-emerald-50 text-emerald-600 border border-emerald-100 hover:bg-emerald-100 hover:shadow-md rounded-xl transition-all"
          title="Enviar WhatsApp"
        >
          <MessageCircle size={20} />
        </button>
      )}

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

      {/* WhatsApp Modal */}
      <TeacherWhatsAppAlerts 
        teacher={teacher}
        isOpen={isWhatsAppOpen}
        onClose={() => setIsWhatsAppOpen(false)}
      />

      {/* Edit Modal */}
      <TeacherFormModal 
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        teacher={teacher}
      />
    </div>
  );
}
