'use client';

import React, { useState } from 'react';
import { MessageCircle, Send, Clock, DollarSign, UserPlus, X } from 'lucide-react';
import type { Teacher } from '@/types/teacher';

interface TeacherWhatsAppAlertsProps {
  teacher: Teacher;
  isOpen: boolean;
  onClose: () => void;
}

export default function TeacherWhatsAppAlerts({ teacher, isOpen, onClose }: TeacherWhatsAppAlertsProps) {
  if (!isOpen) return null;

  const phone = teacher.telefone?.replace(/\D/g, '');
  const baseUrl = `https://wa.me/${phone}`;

  const sendAlert = (message: string) => {
    const encodedMessage = encodeURIComponent(message);
    window.open(`${baseUrl}?text=${encodedMessage}`, '_blank');
    onClose();
  };

  const messages = {
    agenda: `Olá Prof. ${teacher.nome_completo}! 🍎 Passando para confirmar sua agenda de aulas para os próximos dias. Podemos confirmar os horários? 📚`,
    financial: `Olá Prof. ${teacher.nome_completo}! 💸 Seu relatório de repasses das aulas deste período já está disponível para conferência. Qualquer dúvida, estou à disposição! 🚀`,
    newStudent: `Olá Prof. ${teacher.nome_completo}! 🎓 Temos um novo aluno interessado no seu horário de especialidade (${teacher.especialidade}). Gostaria de agendar uma aula experimental? 🌟`,
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-[2.5rem] w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-emerald-50/30">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
              <MessageCircle size={20} />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-800 tracking-tight">Alertas Rápidos</h3>
              <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mt-0.5">WhatsApp Business</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white rounded-xl transition-all text-slate-400">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-3">
          {/* Confirmação de Agenda */}
          <button 
            onClick={() => sendAlert(messages.agenda)}
            className="group w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-blue-50 border border-slate-100 hover:border-blue-100 rounded-2xl transition-all text-left"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-400 group-hover:text-blue-500 transition-all shadow-sm">
                <Clock size={20} />
              </div>
              <div>
                <p className="font-bold text-slate-900 group-hover:text-blue-900 transition-colors">Confirmar Agenda</p>
                <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Aulas e horários</p>
              </div>
            </div>
            <Send size={18} className="text-slate-200 group-hover:text-blue-500 transition-all" />
          </button>

          {/* Repasses Financeiros */}
          <button 
            onClick={() => sendAlert(messages.financial)}
            className="group w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-emerald-50 border border-slate-100 hover:border-emerald-100 rounded-2xl transition-all text-left"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-400 group-hover:text-emerald-500 transition-all shadow-sm">
                <DollarSign size={20} />
              </div>
              <div>
                <p className="font-bold text-slate-900 group-hover:text-emerald-900 transition-colors">Relatório Financeiro</p>
                <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Repasses e fechamento</p>
              </div>
            </div>
            <Send size={18} className="text-slate-200 group-hover:text-emerald-500 transition-all" />
          </button>

          {/* Novo Aluno */}
          <button 
            onClick={() => sendAlert(messages.newStudent)}
            className="group w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-purple-50 border border-slate-100 hover:border-purple-100 rounded-2xl transition-all text-left"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-400 group-hover:text-purple-500 transition-all shadow-sm">
                <UserPlus size={20} />
              </div>
              <div>
                <p className="font-bold text-slate-900 group-hover:text-purple-900 transition-colors">Novo Aluno</p>
                <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Interesse em horário</p>
              </div>
            </div>
            <Send size={18} className="text-slate-200 group-hover:text-purple-500 transition-all" />
          </button>
        </div>

        <div className="p-6 bg-slate-50 border-t border-slate-100 flex items-center gap-3">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Conectado com Prof. {teacher.nome_completo.split(' ')[0]}
          </p>
        </div>
      </div>
    </div>
  );
}
