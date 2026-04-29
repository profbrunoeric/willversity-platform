'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Zap, 
  ChevronDown, 
  ChevronUp, 
  Calendar, 
  Clock, 
  BookOpen, 
  MessageSquare, 
  BrainCircuit, 
  Target, 
  Flag,
  Edit3,
  Trash2,
  Save,
  X,
  Loader2
} from 'lucide-react';
import { updateEvolution, deleteEvolution } from '@/app/(dashboard)/alunos/actions';

const StageDetail = ({ label, content, icon: Icon, colorClass, isEditing, value, onChange }) => {
  if (!content && !isEditing) return null;
  return (
    <div className={`flex gap-4 p-4 rounded-2xl border transition-all ${isEditing ? 'bg-white border-primary/20 ring-4 ring-primary/5' : 'bg-slate-50 border-slate-100/50'}`}>
      <div className={`p-2 rounded-lg h-fit ${colorClass}`}>
        <Icon size={16} />
      </div>
      <div className="flex-1">
        <h5 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{label}</h5>
        {isEditing ? (
          <textarea 
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full bg-transparent text-sm text-slate-600 outline-none border-none resize-none focus:ring-0 p-0"
            rows={3}
          />
        ) : (
          <p className="text-sm text-slate-600 leading-relaxed">{content}</p>
        )}
      </div>
    </div>
  );
};

const EvolutionItem = ({ evolution }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editData, setEditData] = useState({
    warm_up: evolution.warm_up || '',
    comprehensible_input: evolution.comprehensible_input || '',
    guided_practice: evolution.guided_practice || '',
    meaningful_output: evolution.meaningful_output || '',
    consolidation: evolution.consolidation || '',
    class_date: evolution.class_date?.split('T')[0] || ''
  });

  const date = new Date(evolution.class_date);
  const formattedDate = date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
  const formattedTime = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  const handleUpdate = async () => {
    setIsSubmitting(true);
    const res = await updateEvolution(evolution.id, evolution.student_id, editData);
    if (res.success) {
      setIsEditing(false);
      setIsExpanded(true);
    } else {
      alert(res.error || 'Erro ao atualizar.');
    }
    setIsSubmitting(false);
  };

  const handleDelete = async () => {
    if (!window.confirm('Tem certeza que deseja excluir este registro permanente?')) return;
    setIsSubmitting(true);
    const res = await deleteEvolution(evolution.id, evolution.student_id);
    if (!res.success) {
      alert(res.error || 'Erro ao excluir.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative pl-12 pb-10 last:pb-0">
      {/* Timeline line connector */}
      <div className="absolute left-[19px] top-10 bottom-0 w-px bg-slate-100 last:hidden" />
      
      {/* Icon Node */}
      <div className={`absolute left-0 top-0 w-10 h-10 rounded-2xl flex items-center justify-center transition-all shadow-sm z-10 ${
        isExpanded ? 'bg-primary text-white shadow-primary/20 scale-110' : 'bg-white border-2 border-slate-100 text-slate-400'
      }`}>
        <Zap size={18} />
      </div>

      {/* Content Card */}
        <div className={`bg-white rounded-[2rem] border transition-all duration-300 ${
          isExpanded ? 'border-primary/20 shadow-xl shadow-primary/5 p-6' : 'border-slate-100 p-5 hover:border-primary/30'
        }`}>
          <div className="flex items-center justify-between">
            <div 
              className="flex items-center gap-4 cursor-pointer flex-1"
              onClick={() => {
                if (!isEditing) setIsExpanded(!isExpanded);
              }}
            >
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  {isEditing ? (
                    <input 
                      type="date"
                      value={editData.class_date}
                      onChange={(e) => setEditData({...editData, class_date: e.target.value})}
                      className="text-sm font-black text-slate-900 border-none bg-slate-50 rounded-lg px-2 py-1 outline-none"
                    />
                  ) : (
                    <span className="text-base font-black text-slate-900">{formattedDate}</span>
                  )}
                  {!isEditing && (
                    <span className="text-[10px] px-2 py-0.5 bg-slate-100 text-slate-500 rounded-full font-bold">
                      {formattedTime}
                    </span>
                  )}
                </div>
                {!isExpanded && !isEditing && (
                  <p className="text-xs text-slate-400 mt-1 line-clamp-1 italic">
                    {evolution.consolidation || 'Resumo pedagógico registrado...'}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {isExpanded && !isEditing && (
                <div className="flex items-center gap-1 mr-2 animate-in fade-in slide-in-from-right-2">
                  <button 
                    onClick={() => setIsEditing(true)}
                    className="p-2 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-xl transition-all"
                  >
                    <Edit3 size={18} />
                  </button>
                  <button 
                    onClick={handleDelete}
                    disabled={isSubmitting}
                    className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              )}

              {isEditing ? (
                <div className="flex items-center gap-2 animate-in zoom-in-95">
                  <button 
                    onClick={() => setIsEditing(false)}
                    className="p-2 text-slate-400 hover:bg-slate-100 rounded-xl transition-all"
                  >
                    <X size={18} />
                  </button>
                  <button 
                    onClick={handleUpdate}
                    disabled={isSubmitting}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl font-bold text-xs shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
                  >
                    {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                    SALVAR
                  </button>
                </div>
              ) : (
                <div 
                  className={`p-2 rounded-full transition-all cursor-pointer ${isExpanded ? 'bg-primary/10 text-primary rotate-180' : 'text-slate-300'}`}
                  onClick={() => setIsExpanded(!isExpanded)}
                >
                  <ChevronDown size={20} />
                </div>
              )}
            </div>
          </div>
  
          <AnimatePresence>
            {(isExpanded || isEditing) && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="pt-6 space-y-4">
                  <div className="h-px bg-slate-100 w-full mb-6" />
                  
                  <div className="grid grid-cols-1 gap-3">
                    <StageDetail 
                      label="1. Warm-up" 
                      content={evolution.warm_up} 
                      icon={Clock} 
                      colorClass="bg-amber-50 text-amber-600"
                      isEditing={isEditing}
                      value={editData.warm_up}
                      onChange={(val) => setEditData({...editData, warm_up: val})}
                    />
                    <StageDetail 
                      label="2. Comprehensible Input" 
                      content={evolution.comprehensible_input} 
                      icon={BrainCircuit} 
                      colorClass="bg-blue-50 text-blue-600"
                      isEditing={isEditing}
                      value={editData.comprehensible_input}
                      onChange={(val) => setEditData({...editData, comprehensible_input: val})}
                    />
                    <StageDetail 
                      label="3. Guided Practice" 
                      content={evolution.guided_practice} 
                      icon={BookOpen} 
                      colorClass="bg-purple-50 text-purple-600"
                      isEditing={isEditing}
                      value={editData.guided_practice}
                      onChange={(val) => setEditData({...editData, guided_practice: val})}
                    />
                    <StageDetail 
                      label="4. Meaningful Output" 
                      content={evolution.meaningful_output} 
                      icon={MessageSquare} 
                      colorClass="bg-emerald-50 text-emerald-600"
                      isEditing={isEditing}
                      value={editData.meaningful_output}
                      onChange={(val) => setEditData({...editData, meaningful_output: val})}
                    />
                    <StageDetail 
                      label="5. Consolidation" 
                      content={evolution.consolidation} 
                      icon={Flag} 
                      colorClass="bg-rose-50 text-rose-600"
                      isEditing={isEditing}
                      value={editData.consolidation}
                      onChange={(val) => setEditData({...editData, consolidation: val})}
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
    </div>
  );
};

export default function EvolutionTimeline({ evolutions }) {
  if (!evolutions || evolutions.length === 0) {
    return (
      <div className="bg-white rounded-[2.5rem] p-12 border border-slate-100 text-center flex flex-col items-center gap-4">
        <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center">
          <Calendar size={32} />
        </div>
        <div>
          <h4 className="text-lg font-bold text-slate-800">Nenhum registro ainda</h4>
          <p className="text-sm text-slate-400">As aulas do aluno aparecerão aqui em formato de linha do tempo.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3 mb-8 ml-2">
        <div className="p-2 bg-primary/10 text-primary rounded-xl">
          <Target size={20} />
        </div>
        <h3 className="text-xl font-black text-slate-900 tracking-tight">Jornada Pedagógica</h3>
      </div>
      
      <div className="relative">
        {evolutions.map((evo) => (
          <EvolutionItem key={evo.id} evolution={evo} />
        ))}
      </div>
    </div>
  );
}
