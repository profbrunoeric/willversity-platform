'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, Plus, Target, MessageSquare, BookOpen, Monitor, Zap } from 'lucide-react';
import { addXP } from '@/app/(dashboard)/alunos/gamification-actions';
import { getXPCategories } from '@/app/(dashboard)/configuracoes/xp-categories-actions';

const iconMap = {
  Monitor,
  MessageSquare,
  Target,
  BookOpen,
  Sparkles,
  Zap
};

export default function XPLauncher({ studentId, studentName }) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [xpData, setXpData] = useState({
    amount: 50,
    category: '',
    reason: ''
  });

  useEffect(() => {
    if (isOpen) {
      const loadCats = async () => {
        const data = await getXPCategories();
        setCategories(data);
        if (data.length > 0) {
          setXpData(prev => ({ ...prev, category: data[0].id, amount: data[0].default_xp }));
        }
      }
      loadCats();
    }
  }, [isOpen]);

  const handleLaunch = async () => {
    setLoading(true);
    try {
      await addXP(studentId, xpData.amount, xpData.category, xpData.reason);
      setIsOpen(false);
      alert(`XP creditado com sucesso para ${studentName}!`);
    } catch (err) {
      alert('Erro ao creditar XP.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button 
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(true);
        }}
        className="p-3 bg-white border border-slate-100 text-primary hover:bg-primary hover:text-white hover:shadow-md rounded-xl transition-all flex items-center gap-2 group"
      >
        <Sparkles size={18} className="group-hover:animate-pulse" />
        <span className="text-[10px] font-black uppercase">Lançar XP</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
              onClick={() => setIsOpen(false)} 
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" 
            />
            
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} 
              className="relative w-full max-w-md bg-white rounded-[2.5rem] p-8 shadow-2xl overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-8">
                <button onClick={() => setIsOpen(false)} className="text-slate-300 hover:text-slate-900 transition-colors">
                  <X size={24} />
                </button>
              </div>

              <div className="flex flex-col items-center text-center mb-8">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-4">
                  <Zap size={32} />
                </div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight">Meritocracia Acadêmica</h3>
                <p className="text-sm text-slate-500 font-medium">Lançar pontos para <span className="text-primary font-bold">{studentName}</span></p>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 text-center block">Pontos de XP</label>
                  <div className="flex items-center justify-center gap-4">
                    <button onClick={() => setXpData({...xpData, amount: Math.max(0, xpData.amount - 10)})} className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 hover:bg-slate-100 transition-all font-black text-xl">-</button>
                    <input 
                      type="number" value={xpData.amount}
                      onChange={(e) => setXpData({...xpData, amount: parseInt(e.target.value) || 0})}
                      className="w-24 text-center text-4xl font-black text-slate-900 bg-transparent outline-none"
                    />
                    <button onClick={() => setXpData({...xpData, amount: xpData.amount + 10})} className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 hover:bg-slate-100 transition-all font-black text-xl">+</button>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {categories.map((cat) => {
                    const Icon = iconMap[cat.icon_name] || Sparkles;
                    return (
                      <button 
                        key={cat.id}
                        onClick={() => setXpData({...xpData, category: cat.id, amount: cat.default_xp})}
                        className={`p-4 rounded-2xl flex flex-col items-center justify-center gap-2 border-2 transition-all
                          ${xpData.category === cat.id ? `border-primary bg-primary/5` : 'border-slate-50 bg-slate-50 text-slate-400'}`}
                      >
                        <Icon size={20} style={{ color: xpData.category === cat.id ? undefined : cat.color }} className={xpData.category === cat.id ? 'text-primary' : ''} />
                        <span className="text-[9px] font-black uppercase tracking-tighter text-center">{cat.label}</span>
                      </button>
                    );
                  })}
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Motivo / Observação</label>
                  <textarea 
                    placeholder="Ex: Ótima desenvoltura no debate..."
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none text-sm font-medium"
                    rows={2} value={xpData.reason} onChange={(e) => setXpData({...xpData, reason: e.target.value})}
                  />
                </div>

                <button 
                  onClick={handleLaunch} disabled={loading}
                  className="w-full py-5 bg-primary text-white rounded-[1.5rem] font-black text-lg shadow-xl shadow-primary/30 flex items-center justify-center gap-3 disabled:opacity-50 transition-all"
                >
                  {loading ? 'Creditando...' : 'CONFIRMAR RECOMPENSA'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
