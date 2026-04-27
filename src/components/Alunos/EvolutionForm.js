'use client';

import React, { useState } from 'react';
import { BookOpen, Calendar, Clock, BrainCircuit, MessageSquare, Flag, Save, Loader2 } from 'lucide-react';
import { saveEvolution, recordAttendance } from '@/app/(dashboard)/alunos/actions';
import EvolutionTemplates from './EvolutionTemplates';
import { UserCheck, UserMinus } from 'lucide-react';

export default function EvolutionForm({ studentId }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    warm_up: '',
    comprehensible_input: '',
    guided_practice: '',
    meaningful_output: '',
    consolidation: '',
    classDate: new Date().toISOString().split('T')[0]
  });

  const handleTemplateSelect = (field, text) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field] ? prev[field] + ' ' + text : text
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const data = new FormData(e.target);
    const res = await saveEvolution(data);
    
    if (res.success) {
      alert('Evolução registrada com sucesso!');
      setFormData({
        warm_up: '',
        comprehensible_input: '',
        guided_practice: '',
        meaningful_output: '',
        consolidation: '',
        classDate: new Date().toISOString().split('T')[0]
      });
    } else {
      alert(res.error || 'Erro ao salvar.');
    }
    setIsSubmitting(false);
  };

  const handleAttendance = async (status) => {
    setIsSubmitting(true);
    const res = await recordAttendance(studentId, status);
    if (res.success) {
      alert(status === 'present' ? 'Presença confirmada!' : 'Falta registrada.');
    }
    setIsSubmitting(false);
  };

  const steps = [
    { name: 'warm_up', label: '1. WARM-UP', icon: Clock, placeholder: 'Como a aula começou? Quebra-gelo, revisão rápida...' },
    { name: 'comprehensible_input', label: '2. COMPREHENSIBLE INPUT', icon: BrainCircuit, placeholder: 'Novos conceitos apresentados, vocabulário, gramática no contexto...' },
    { name: 'guided_practice', label: '3. GUIDED PRACTICE', icon: BookOpen, placeholder: 'Exercícios controlados, correção imediata...' },
    { name: 'meaningful_output', label: '4. MEANINGFUL OUTPUT', icon: MessageSquare, placeholder: 'Uso livre do idioma, conversação real, aplicação prática...' },
    { name: 'consolidation', label: '5. CONSOLIDATION', icon: Flag, placeholder: 'Resumo da aula, dever de casa, pontos de melhoria...' },
  ];

  return (
    <div className="bg-white rounded-[2.5rem] p-8 md:p-12 border border-slate-100 shadow-sm">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
          <BookOpen size={20} />
        </div>
        <h3 className="text-2xl font-black text-slate-800 tracking-tight">Registrar Evolução</h3>
      </div>

      {/* Diário Digital - Presença/Falta */}
      <div className="flex items-center gap-4 mb-8 p-6 bg-slate-50/50 rounded-[2rem] border border-slate-100">
        <button
          type="button"
          onClick={() => handleAttendance('present')}
          disabled={isSubmitting}
          className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-emerald-50 text-emerald-600 rounded-2xl font-black text-xs hover:bg-emerald-600 hover:text-white transition-all border border-emerald-100 shadow-sm"
        >
          <UserCheck size={18} />
          MARCAR PRESENÇA
        </button>
        <button
          type="button"
          onClick={() => handleAttendance('absent')}
          disabled={isSubmitting}
          className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-rose-50 text-rose-600 rounded-2xl font-black text-xs hover:bg-rose-600 hover:text-white transition-all border border-rose-100 shadow-sm"
        >
          <UserMinus size={18} />
          MARCAR FALTA
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <input type="hidden" name="studentId" value={studentId} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-black text-slate-400 mb-2 uppercase tracking-widest">
              Data da Aula
            </label>
            <div className="relative">
              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="date" 
                name="classDate" 
                value={formData.classDate}
                onChange={(e) => setFormData({...formData, classDate: e.target.value})}
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-primary/5 outline-none transition-all"
              />
            </div>
          </div>
        </div>

        {/* As 5 Etapas Pedagógicas */}
        <div className="grid grid-cols-1 gap-8">
          {steps.map((step) => (
            <div key={step.name} className="group">
              <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 mb-3 tracking-[0.2em] uppercase group-focus-within:text-primary transition-colors">
                <step.icon size={14} /> {step.label}
              </label>
              <textarea 
                name={step.name}
                rows={3}
                value={formData[step.name]}
                onChange={(e) => setFormData({...formData, [step.name]: e.target.value})}
                className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-3xl focus:bg-white focus:border-primary/30 focus:ring-8 focus:ring-primary/5 outline-none transition-all text-sm resize-none placeholder:text-slate-300"
                placeholder={step.placeholder}
              ></textarea>
              
              <EvolutionTemplates 
                field={step.name} 
                onSelect={(text) => handleTemplateSelect(step.name, text)} 
              />
            </div>
          ))}
        </div>

        <div className="pt-4">
          <button 
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-3 py-5 bg-primary text-white rounded-3xl font-black text-base shadow-2xl shadow-primary/30 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 disabled:pointer-events-none"
          >
            {isSubmitting ? <Loader2 className="animate-spin" /> : <Save size={20} />}
            SALVAR REGISTRO PEDAGÓGICO
          </button>
        </div>
      </form>
    </div>
  );
}
