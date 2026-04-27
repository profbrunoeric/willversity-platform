'use client';

import React, { useState } from 'react';
import { MinusCircle, Plus, DollarSign, Tag, Calendar as CalendarIcon, Loader2, Check, Trash2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function ExpensesManager() {
  const [isAdding, setIsAdding] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    description: '',
    amount: 0,
    category: 'Geral',
    status: 'paid'
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const supabase = createClient();
    const { error } = await supabase
      .from('expenses')
      .insert([formData]);

    if (!error) {
      alert('Despesa registrada!');
      setIsAdding(false);
      window.location.reload(); // Simplificado para atualizar o relatório
    } else {
      alert('Erro: ' + error.message);
    }
    setIsSubmitting(false);
  };

  return (
    <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
      <div className="p-8 border-b border-slate-50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-rose-100 text-rose-600 rounded-lg">
            <MinusCircle size={20} />
          </div>
          <h4 className="font-black text-slate-800 uppercase tracking-widest text-sm">Gestão de Saídas (Despesas)</h4>
        </div>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs transition-all ${isAdding ? 'bg-rose-50 text-rose-500' : 'bg-slate-900 text-white'}`}
        >
          {isAdding ? 'Cancelar' : <><Plus size={16} /> Nova Despesa</>}
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleSubmit} className="p-8 bg-slate-50 border-b border-slate-100 animate-in slide-in-from-top-2 duration-300">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Descrição</label>
              <input 
                type="text" 
                required
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full px-4 py-3 bg-white border border-slate-100 rounded-xl text-sm font-bold outline-none focus:ring-4 focus:ring-primary/5 transition-all"
                placeholder="Ex: Aluguel, Internet, Salário..."
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
                className="w-full px-4 py-3 bg-white border border-slate-100 rounded-xl text-sm font-bold outline-none focus:ring-4 focus:ring-primary/5 transition-all"
              />
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Categoria</label>
              <select 
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                className="w-full px-4 py-3 bg-white border border-slate-100 rounded-xl text-sm font-bold outline-none focus:ring-4 focus:ring-primary/5 transition-all appearance-none"
              >
                <option>Geral</option>
                <option>Infraestrutura</option>
                <option>Salários</option>
                <option>Marketing</option>
                <option>Impostos</option>
              </select>
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <button 
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-3 bg-primary text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
            >
              {isSubmitting ? <Loader2 className="animate-spin" size={16} /> : <Check size={16} />}
              Salvar Despesa
            </button>
          </div>
        </form>
      )}

      <div className="p-12 text-center text-slate-300">
        <p className="text-xs font-medium uppercase tracking-widest">Registre suas despesas para ver o saldo real.</p>
      </div>
    </div>
  );
}
