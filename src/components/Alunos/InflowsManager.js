'use client';

import React, { useState } from 'react';
import { PlusCircle, Plus, DollarSign, Tag, Calendar as CalendarIcon, Loader2, Check } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function InflowsManager() {
  const [isAdding, setIsAdding] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    description: '',
    amount: 0,
    category: 'Geral'
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const supabase = createClient();
    const { error } = await supabase
      .from('inflows')
      .insert([formData]);

    if (!error) {
      alert('Entrada registrada com sucesso!');
      setIsAdding(false);
      window.location.reload();
    } else {
      alert('Erro: ' + error.message);
    }
    setIsSubmitting(false);
  };

  return (
    <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
      <div className="p-8 border-b border-slate-50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
            <PlusCircle size={20} />
          </div>
          <h4 className="font-black text-slate-800 uppercase tracking-widest text-sm">Gestão de Entradas (Receitas Avulsas)</h4>
        </div>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs transition-all ${isAdding ? 'bg-rose-50 text-rose-500' : 'bg-emerald-600 text-white shadow-lg shadow-emerald-200'}`}
        >
          {isAdding ? 'Cancelar' : <><Plus size={16} /> Nova Entrada</>}
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleSubmit} className="p-8 bg-emerald-50/30 border-b border-emerald-50 animate-in slide-in-from-top-2 duration-300">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Descrição da Receita</label>
              <input 
                type="text" 
                required
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full px-4 py-3 bg-white border border-slate-100 rounded-xl text-sm font-bold outline-none focus:ring-4 focus:ring-emerald-500/5 transition-all"
                placeholder="Ex: Venda de Apostila, Workshop, Consultoria..."
              />
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Valor (R$)</label>
              <input 
                type="number" 
                step="0.01"
                required
                value={formData.amount}
                onChange={(e) => setFormData({...formData, amount: parseFloat(e.target.value)})}
                className="w-full px-4 py-3 bg-white border border-slate-100 rounded-xl text-sm font-bold outline-none focus:ring-4 focus:ring-emerald-500/5 transition-all"
              />
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Categoria</label>
              <select 
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                className="w-full px-4 py-3 bg-white border border-slate-100 rounded-xl text-sm font-bold outline-none focus:ring-4 focus:ring-emerald-500/5 transition-all appearance-none"
              >
                <option>Geral</option>
                <option>Material Didático</option>
                <option>Eventos</option>
                <option>Serviços Extra</option>
              </select>
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <button 
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-3 bg-emerald-600 text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-emerald-200 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
            >
              {isSubmitting ? <Loader2 className="animate-spin" size={16} /> : <Check size={16} />}
              Confirmar Entrada
            </button>
          </div>
        </form>
      )}

      <div className="p-12 text-center text-slate-300">
        <p className="text-xs font-medium uppercase tracking-widest">Registre outras fontes de lucro além das mensalidades.</p>
      </div>
    </div>
  );
}
