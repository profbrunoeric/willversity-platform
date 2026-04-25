'use client'

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Clock, User, FileText, Save, Loader2, BookOpen, AlertCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { agendaSchema } from '@/lib/validations/agenda.schema';
import type { AgendaInput } from '@/lib/validations/agenda.schema';
import { createAppointment } from '@/app/(dashboard)/agenda/actions';
import type { Teacher } from '@/types/teacher';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  teachers: Teacher[];
  students: { id: string, full_name: string }[];
}

export default function BookingModal({ isOpen, onClose, teachers, students }: BookingModalProps) {
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<AgendaInput>({
    resolver: zodResolver(agendaSchema),
    defaultValues: {
      status: 'pendente',
      tipo: 'aula',
      metadata: {}
    }
  });

  const onSubmit = async (data: AgendaInput) => {
    setLoading(true);
    setServerError(null);
    try {
      const result = await createAppointment(data);
      if (result.success) {
        onClose();
        reset();
      } else {
        setServerError(result.error || 'Erro ao agendar.');
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
            className="relative w-full max-w-xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col"
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
                  <Calendar className="text-white" size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Novo Agendamento</h3>
                  <p className="text-slate-400 text-xs font-medium uppercase tracking-widest">Sincronização Escola & Professor</p>
                </div>
              </div>
            </div>

            <div className="p-8 overflow-y-auto max-h-[70vh] custom-scrollbar">
              <form id="booking-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                
                {/* Título */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Título do Compromisso</label>
                  <div className="relative">
                    <BookOpen className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                    <input 
                      {...register('title')}
                      placeholder="Ex: Reposição de Inglês - Aula 04"
                      className={`w-full bg-slate-50 border ${errors.title ? 'border-red-300' : 'border-slate-200'} rounded-2xl pl-12 pr-4 py-4 text-sm font-bold text-slate-700 focus:bg-white focus:border-primary outline-none transition-all`}
                    />
                  </div>
                  {errors.title && <p className="text-red-500 text-[10px] font-bold uppercase ml-1">{errors.title.message}</p>}
                </div>

                <div className="grid grid-cols-2 gap-6">
                  {/* Professor */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Professor</label>
                    <select 
                      {...register('teacher_id')}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-4 text-sm font-bold text-slate-700 outline-none focus:bg-white focus:border-primary transition-all appearance-none"
                    >
                      <option value="">Selecionar...</option>
                      {teachers.map(t => (
                        <option key={t.id} value={t.id}>{t.nome_completo}</option>
                      ))}
                    </select>
                    {errors.teacher_id && <p className="text-red-500 text-[10px] font-bold uppercase ml-1">{errors.teacher_id.message}</p>}
                  </div>

                  {/* Aluno */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Aluno (Opcional)</label>
                    <select 
                      {...register('student_id')}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-4 text-sm font-bold text-slate-700 outline-none focus:bg-white focus:border-primary transition-all appearance-none"
                    >
                      <option value="">Slot Livre (Sem aluno)</option>
                      {students.map(s => (
                        <option key={s.id} value={s.id}>{s.full_name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  {/* Início */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Início</label>
                    <input 
                      {...register('start_time')}
                      type="datetime-local"
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-4 text-sm font-bold text-slate-700 outline-none focus:bg-white focus:border-primary transition-all"
                    />
                  </div>

                  {/* Fim */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Término</label>
                    <input 
                      {...register('end_time')}
                      type="datetime-local"
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-4 text-sm font-bold text-slate-700 outline-none focus:bg-white focus:border-primary transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  {/* Tipo */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tipo</label>
                    <select 
                      {...register('tipo')}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-4 text-sm font-bold text-slate-700 outline-none appearance-none"
                    >
                      <option value="aula">Aula Regular</option>
                      <option value="reposicao">Reposição</option>
                      <option value="mentoria">Mentoria</option>
                      <option value="outro">Outro</option>
                    </select>
                  </div>

                  {/* Status */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Status Inicial</label>
                    <select 
                      {...register('status')}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-4 text-sm font-bold text-slate-700 outline-none appearance-none"
                    >
                      <option value="pendente">Pendente</option>
                      <option value="confirmado">Confirmado</option>
                    </select>
                  </div>
                </div>

                {serverError && (
                  <div className="p-4 bg-rose-50 border border-rose-100 text-rose-600 text-xs font-bold rounded-2xl flex items-center gap-2">
                    <AlertCircle size={16} /> {serverError}
                  </div>
                )}
              </form>
            </div>

            {/* Footer */}
            <div className="p-8 bg-slate-50 flex-shrink-0">
              <button 
                form="booking-form"
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 py-5 bg-primary text-white rounded-2xl font-black text-sm shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <>
                    <Save size={18} /> CONFIRMAR AGENDAMENTO
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
