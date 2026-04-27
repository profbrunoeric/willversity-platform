'use client';

import React from 'react';
import { MessageCircle, Bell, Clock, Star, Send } from 'lucide-react';

export default function WhatsAppQuickAlerts({ student, nextAppointment }) {
  if (!student?.phone) return null;

  const phone = student.phone.replace(/\D/g, '');
  const baseUrl = `https://wa.me/${phone}`;

  const sendAlert = (message) => {
    const encodedMessage = encodeURIComponent(message);
    window.open(`${baseUrl}?text=${encodedMessage}`, '_blank');
  };

  // Modelos de mensagens
  const messages = {
    reminder: nextAppointment 
      ? `Olá ${student.full_name}! 🎓 Passando para lembrar da nossa aula de hoje às ${new Date(nextAppointment.start_time).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}. Te espero lá! 🚀`
      : `Olá ${student.full_name}! 🎓 Passando para lembrar da nossa próxima aula. Não esqueça de verificar seu horário no portal! 🚀`,
    praise: `Parabéns ${student.full_name}! 🌟 Fiquei muito impressionado com sua evolução na aula de hoje. Seu progresso está sendo excelente! Continue assim. 🔥`,
    missing: `Olá ${student.full_name}! 📚 Sentimos sua falta na aula hoje. Está tudo bem? Quando puder, entre em contato para remarcarmos. Até breve! 👋`,
  };

  return (
    <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
            <MessageCircle size={20} />
          </div>
          <h3 className="text-xl font-black text-slate-800 tracking-tight">Alertas Rápidos</h3>
        </div>
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-3 py-1 rounded-full">WhatsApp Business</span>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {/* Lembrete de Aula */}
        <button 
          onClick={() => sendAlert(messages.reminder)}
          className="group flex items-center justify-between p-4 bg-slate-50 hover:bg-emerald-50 border border-slate-100 hover:border-emerald-100 rounded-2xl transition-all text-left"
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-400 group-hover:text-emerald-500 transition-all shadow-sm">
              <Clock size={20} />
            </div>
            <div>
              <p className="font-bold text-slate-900 group-hover:text-emerald-900 transition-colors">Lembrete de Aula</p>
              <p className="text-xs text-slate-400 font-medium">Lembrar aluno do horário de hoje</p>
            </div>
          </div>
          <Send size={18} className="text-slate-200 group-hover:text-emerald-500 transition-all" />
        </button>

        {/* Elogio e Motivação */}
        <button 
          onClick={() => sendAlert(messages.praise)}
          className="group flex items-center justify-between p-4 bg-slate-50 hover:bg-amber-50 border border-slate-100 hover:border-amber-100 rounded-2xl transition-all text-left"
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-400 group-hover:text-amber-500 transition-all shadow-sm">
              <Star size={20} />
            </div>
            <div>
              <p className="font-bold text-slate-900 group-hover:text-amber-900 transition-colors">Elogiar Evolução</p>
              <p className="text-xs text-slate-400 font-medium">Motivar aluno pelo desempenho</p>
            </div>
          </div>
          <Send size={18} className="text-slate-200 group-hover:text-amber-500 transition-all" />
        </button>

        {/* Alerta de Falta */}
        <button 
          onClick={() => sendAlert(messages.missing)}
          className="group flex items-center justify-between p-4 bg-slate-50 hover:bg-rose-50 border border-slate-100 hover:border-rose-100 rounded-2xl transition-all text-left"
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-400 group-hover:text-rose-500 transition-all shadow-sm">
              <Bell size={20} />
            </div>
            <div>
              <p className="font-bold text-slate-900 group-hover:text-rose-900 transition-colors">Aviso de Falta</p>
              <p className="text-xs text-slate-400 font-medium">Notificar sobre ausência na aula</p>
            </div>
          </div>
          <Send size={18} className="text-slate-200 group-hover:text-rose-500 transition-all" />
        </button>
      </div>
    </div>
  );
}
