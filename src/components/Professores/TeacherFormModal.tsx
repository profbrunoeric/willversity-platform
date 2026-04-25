'use client'

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, GraduationCap, Save, Loader2, User, Mail, Phone, Calendar, BookOpen, FileText, Camera, Plus } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { teacherSchema } from '@/lib/validations/teacher.schema';
import type { TeacherInput } from '@/lib/validations/teacher.schema';
import { createTeacher, updateTeacher } from '@/app/(dashboard)/professores/actions';
import type { Teacher } from '@/types/teacher';

interface TeacherFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  teacher?: Teacher; // Se fornecido, modo edição
}

export default function TeacherFormModal({ isOpen, onClose, teacher }: TeacherFormModalProps) {
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<TeacherInput>({
    resolver: zodResolver(teacherSchema),
    defaultValues: teacher || {
      status: 'pendente',
      metadata: {}
    }
  });

  const onSubmit = async (data: TeacherInput) => {
    setLoading(true);
    setServerError(null);
    try {
      const result = teacher 
        ? await updateTeacher(teacher.id, data)
        : await createTeacher(data);

      if (result.success) {
        onClose();
        reset();
      } else {
        setServerError(result.error || 'Ocorreu um erro ao salvar os dados.');
      }
    } catch (err) {
      setServerError('Falha na comunicação com o servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 md:p-6">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          />

          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
          >
            {/* Header */}
            <div className="bg-slate-900 p-8 text-white relative flex-shrink-0">
              <button 
                onClick={onClose}
                className="absolute top-6 right-6 p-2 hover:bg-white/10 rounded-full transition-all"
              >
                <X size={20} />
              </button>
              
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20">
                  <GraduationCap className="text-white" size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold">{teacher ? 'Editar Professor' : 'Novo Professor'}</h3>
                  <p className="text-slate-400 text-xs font-medium uppercase tracking-widest">
                    {teacher ? 'Atualize as informações do docente' : 'Cadastre um novo especialista'}
                  </p>
                </div>
              </div>
            </div>

            {/* Form Content */}
            <div className="p-8 overflow-y-auto custom-scrollbar">
              <form id="teacher-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                
                {/* Photo Option (Placeholder for future no-code upload) */}
                <div className="flex flex-col items-center justify-center mb-8">
                  <div className="relative group">
                    <div className="w-24 h-24 bg-slate-100 rounded-[2rem] border-2 border-dashed border-slate-200 flex items-center justify-center text-slate-400 group-hover:border-primary group-hover:text-primary transition-all">
                      <Camera size={32} />
                    </div>
                    <div className="absolute -bottom-2 -right-2 bg-white p-2 rounded-xl shadow-md border border-slate-100 text-slate-400">
                      <Plus size={16} />
                    </div>
                  </div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-4">Foto de Perfil (Opcional)</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Nome */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nome Completo</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                      <input 
                        {...register('nome_completo')}
                        placeholder="Ex: Dr. William Silva"
                        className={`w-full bg-slate-50 border ${errors.nome_completo ? 'border-red-300' : 'border-slate-200'} rounded-2xl pl-12 pr-4 py-4 text-sm font-bold text-slate-700 focus:bg-white focus:border-primary outline-none transition-all`}
                      />
                    </div>
                    {errors.nome_completo && <p className="text-red-500 text-[10px] font-bold uppercase ml-1">{errors.nome_completo.message}</p>}
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">E-mail Profissional</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                      <input 
                        {...register('email')}
                        type="email"
                        placeholder="email@willversity.com"
                        className={`w-full bg-slate-50 border ${errors.email ? 'border-red-300' : 'border-slate-200'} rounded-2xl pl-12 pr-4 py-4 text-sm font-bold text-slate-700 focus:bg-white focus:border-primary outline-none transition-all`}
                      />
                    </div>
                    {errors.email && <p className="text-red-500 text-[10px] font-bold uppercase ml-1">{errors.email.message}</p>}
                  </div>

                  {/* Telefone */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Telefone / WhatsApp</label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                      <input 
                        {...register('telefone')}
                        placeholder="(11) 99999-9999"
                        className={`w-full bg-slate-50 border ${errors.telefone ? 'border-red-300' : 'border-slate-200'} rounded-2xl pl-12 pr-4 py-4 text-sm font-bold text-slate-700 focus:bg-white focus:border-primary outline-none transition-all`}
                      />
                    </div>
                    {errors.telefone && <p className="text-red-500 text-[10px] font-bold uppercase ml-1">{errors.telefone.message}</p>}
                  </div>

                  {/* Data Nascimento */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Data de Nascimento</label>
                    <div className="relative">
                      <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                      <input 
                        {...register('data_nascimento')}
                        type="date"
                        className={`w-full bg-slate-50 border ${errors.data_nascimento ? 'border-red-300' : 'border-slate-200'} rounded-2xl pl-12 pr-4 py-4 text-sm font-bold text-slate-700 focus:bg-white focus:border-primary outline-none transition-all`}
                      />
                    </div>
                  </div>

                  {/* Especialidade */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Especialidade / Cargo</label>
                    <div className="relative">
                      <BookOpen className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                      <input 
                        {...register('especialidade')}
                        placeholder="Ex: Engenharia de Prompt"
                        className={`w-full bg-slate-50 border ${errors.especialidade ? 'border-red-300' : 'border-slate-200'} rounded-2xl pl-12 pr-4 py-4 text-sm font-bold text-slate-700 focus:bg-white focus:border-primary outline-none transition-all`}
                      />
                    </div>
                    {errors.especialidade && <p className="text-red-500 text-[10px] font-bold uppercase ml-1">{errors.especialidade.message}</p>}
                  </div>

                  {/* Status */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Status na Plataforma</label>
                    <select 
                      {...register('status')}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-4 text-sm font-bold text-slate-700 focus:bg-white focus:border-primary outline-none transition-all appearance-none"
                    >
                      <option value="pendente">Pendente</option>
                      <option value="ativo">Ativo</option>
                      <option value="inativo">Inativo</option>
                    </select>
                  </div>
                </div>

                {/* Bio */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Biografia Acadêmica</label>
                  <div className="relative">
                    <FileText className="absolute left-4 top-5 text-slate-300" size={18} />
                    <textarea 
                      {...register('bio')}
                      rows={3}
                      placeholder="Conte um pouco sobre a trajetória do professor..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-4 py-4 text-sm font-bold text-slate-700 focus:bg-white focus:border-primary outline-none transition-all resize-none"
                    />
                  </div>
                </div>

                {serverError && (
                  <div className="p-4 bg-rose-50 border border-rose-100 text-rose-600 text-xs font-bold rounded-2xl text-center">
                    {serverError}
                  </div>
                )}
              </form>
            </div>

            {/* Footer */}
            <div className="p-8 bg-slate-50 flex-shrink-0">
              <button 
                form="teacher-form"
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 py-5 bg-primary text-white rounded-2xl font-black text-sm shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <>
                    <Save size={18} /> {teacher ? 'SALVAR ALTERAÇÕES' : 'CADASTRAR PROFESSOR'}
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
