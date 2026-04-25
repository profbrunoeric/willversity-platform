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
  Flag 
} from 'lucide-react';

const StageDetail = ({ label, content, icon: Icon, colorClass }) => {
  if (!content) return null;
  return (
    <div className="flex gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100/50">
      <div className={`p-2 rounded-lg h-fit ${colorClass}`}>
        <Icon size={16} />
      </div>
      <div>
        <h5 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{label}</h5>
        <p className="text-sm text-slate-600 leading-relaxed">{content}</p>
      </div>
    </div>
  );
};

const EvolutionItem = ({ evolution }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const date = new Date(evolution.class_date);
  const formattedDate = date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
  const formattedTime = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

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
        <div 
          className="flex items-center justify-between cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center gap-4">
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-base font-black text-slate-900">{formattedDate}</span>
                <span className="text-[10px] px-2 py-0.5 bg-slate-100 text-slate-500 rounded-full font-bold">
                  {formattedTime}
                </span>
              </div>
              {!isExpanded && (
                <p className="text-xs text-slate-400 mt-1 line-clamp-1 italic">
                  {evolution.consolidation || 'Resumo pedagógico registrado...'}
                </p>
              )}
            </div>
          </div>
          <div className={`p-2 rounded-full transition-all ${isExpanded ? 'bg-primary/10 text-primary rotate-180' : 'text-slate-300'}`}>
            <ChevronDown size={20} />
          </div>
        </div>

        <AnimatePresence>
          {isExpanded && (
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
                  />
                  <StageDetail 
                    label="2. Comprehensible Input" 
                    content={evolution.comprehensible_input} 
                    icon={BrainCircuit} 
                    colorClass="bg-blue-50 text-blue-600" 
                  />
                  <StageDetail 
                    label="3. Guided Practice" 
                    content={evolution.guided_practice} 
                    icon={BookOpen} 
                    colorClass="bg-purple-50 text-purple-600" 
                  />
                  <StageDetail 
                    label="4. Meaningful Output" 
                    content={evolution.meaningful_output} 
                    icon={MessageSquare} 
                    colorClass="bg-emerald-50 text-emerald-600" 
                  />
                  <StageDetail 
                    label="5. Consolidation" 
                    content={evolution.consolidation} 
                    icon={Flag} 
                    colorClass="bg-rose-50 text-rose-600" 
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
