'use client'

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Clock, User, Check, Loader2, AlertCircle } from 'lucide-react';
import { getAppointments, updateAppointmentStatus } from '@/app/(dashboard)/agenda/actions';
import { getTeachers } from '@/app/(dashboard)/professores/actions';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface MakeUpBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentId: string;
}

export default function MakeUpBookingModal({ isOpen, onClose, studentId }: MakeUpBookingModalProps) {
  const [teachers, setTeachers] = useState<any[]>([]);
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>('');
  const [availableSlots, setAvailableSlots] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [claimingId, setClaimingId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      getTeachers().then(res => {
        if (res.success) setTeachers(res.data || []);
      });
    }
  }, [isOpen]);

  useEffect(() => {
    if (selectedTeacherId) {
      setLoading(true);
      getAppointments({ teacherId: selectedTeacherId }).then(res => {
        if (res.success) {
          // Filtrar apenas slots vazios (sem aluno) e futuros
          const empty = (res.data || []).filter((app: any) => 
            !app.student_id && new Date(app.start_time) > new Date()
          );
          setAvailableSlots(empty);
        }
        setLoading(false);
      });
    } else {
      setAvailableSlots([]);
    }
  }, [selectedTeacherId]);

  const handleClaimSlot = async (slotId: string) => {
    setClaimingId(slotId);
    try {
      // Usando uma server action para vincular o aluno ao slot
      // Vou precisar de uma nova action para isso ou usar createAppointment com ID (upsert)
      // Por simplicidade, vou usar a updateAppointmentStatus mas adaptada ou criar uma nova
      const supabase = (await import('@/lib/supabase/client')).createClient();
      const { error } = await supabase
        .from('agenda')
        .update({ 
          student_id: studentId,
          tipo: 'reposicao',
          status: 'pendente' 
        })
        .eq('id', slotId);

      if (!error) {
        onClose();
      } else {
        alert('Erro ao reservar horário.');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setClaimingId(null);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          />

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl overflow-hidden"
          >
            <div className="p-8">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-xl font-black text-slate-900">Solicitar Reposição</h3>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Escolha um horário livre</p>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-full transition-all">
                  <X size={20} className="text-slate-400" />
                </button>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Selecionar Professor</label>
                  <select 
                    value={selectedTeacherId}
                    onChange={(e) => setSelectedTeacherId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold text-slate-700 outline-none focus:bg-white focus:border-primary transition-all appearance-none"
                  >
                    <option value="">Escolha o professor...</option>
                    {teachers.map(t => (
                      <option key={t.id} value={t.id}>{t.nome_completo}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Horários Disponíveis</label>
                  
                  {loading ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="animate-spin text-primary" size={24} />
                    </div>
                  ) : selectedTeacherId && availableSlots.length === 0 ? (
                    <div className="text-center py-8 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                      <AlertCircle className="mx-auto text-slate-300 mb-2" size={24} />
                      <p className="text-slate-400 text-xs font-medium">Nenhum slot livre encontrado para este professor.</p>
                    </div>
                  ) : !selectedTeacherId ? (
                    <div className="text-center py-8 text-slate-300 text-xs font-medium italic">
                      Selecione um professor para ver os horários.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                      {availableSlots.map((slot) => (
                        <button
                          key={slot.id}
                          onClick={() => handleClaimSlot(slot.id)}
                          disabled={!!claimingId}
                          className="flex items-center justify-between p-4 bg-slate-50 hover:bg-primary hover:text-white rounded-2xl border border-slate-100 hover:border-primary transition-all group"
                        >
                          <div className="flex items-center gap-4 text-left">
                            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm group-hover:bg-white/20 transition-all">
                              <Clock size={18} className="text-primary group-hover:text-white" />
                            </div>
                            <div>
                              <p className="text-sm font-black capitalize">
                                {format(new Date(slot.start_time), "EEEE, dd 'de' MMMM", { locale: ptBR })}
                              </p>
                              <p className="text-[10px] font-bold opacity-60">
                                {format(new Date(slot.start_time), "HH:mm")}h às {format(new Date(slot.end_time), "HH:mm")}h
                              </p>
                            </div>
                          </div>
                          {claimingId === slot.id ? (
                            <Loader2 className="animate-spin" size={18} />
                          ) : (
                            <Check size={18} className="opacity-0 group-hover:opacity-100" />
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="p-6 bg-slate-50 text-center">
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">
                A solicitação passará por aprovação do professor.
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
