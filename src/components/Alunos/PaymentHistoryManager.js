'use client';

import React, { useState } from 'react';
import { History, Plus, DollarSign, Calendar as CalendarIcon, Loader2, Check } from 'lucide-react';
import { registerPayment } from '@/app/(dashboard)/alunos/actions';

export default function PaymentHistoryManager({ studentId, monthlyFee }) {
  const [isAdding, setIsAdding] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    amount: monthlyFee || 0,
    referenceMonth: new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }),
    paymentMethod: 'Pix'
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const res = await registerPayment({
      studentId,
      ...formData
    });
    if (res.success) {
      alert('Pagamento registrado com sucesso!');
      setIsAdding(false);
    } else {
      alert('Erro: ' + res.error);
    }
    setIsSubmitting(false);
  };

  return (
    <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm mt-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-600 text-white rounded-lg">
            <History size={20} />
          </div>
          <h3 className="text-xl font-black text-slate-800 tracking-tight">Histórico de Recebimentos</h3>
        </div>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className={`p-2 rounded-xl transition-all ${isAdding ? 'bg-rose-50 text-rose-500 rotate-45' : 'bg-primary text-white shadow-lg shadow-primary/20'}`}
        >
          <Plus size={20} />
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleSubmit} className="mb-8 p-6 bg-slate-50 rounded-3xl space-y-4 border border-slate-100 animate-in zoom-in-95 duration-300">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Valor Recebido (R$)</label>
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
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Mês de Referência</label>
              <input 
                type="text" 
                required
                value={formData.referenceMonth}
                onChange={(e) => setFormData({...formData, referenceMonth: e.target.value})}
                className="w-full px-4 py-3 bg-white border border-slate-100 rounded-xl text-sm font-bold outline-none focus:ring-4 focus:ring-primary/5 transition-all"
                placeholder="Ex: Maio/2024"
              />
            </div>
          </div>
          
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Forma de Pagamento</label>
            <select 
              value={formData.paymentMethod}
              onChange={(e) => setFormData({...formData, paymentMethod: e.target.value})}
              className="w-full px-4 py-3 bg-white border border-slate-100 rounded-xl text-sm font-bold outline-none focus:ring-4 focus:ring-primary/5 transition-all appearance-none"
            >
              <option>Pix</option>
              <option>Cartão de Crédito</option>
              <option>Dinheiro</option>
              <option>Transferência</option>
              <option>Boleto</option>
            </select>
          </div>

          <button 
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-black transition-all flex items-center justify-center gap-2"
          >
            {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <Check size={18} />}
            CONFIRMAR RECEBIMENTO
          </button>
        </form>
      )}

      <div className="text-center py-10 text-slate-300">
        <p className="text-xs font-medium uppercase tracking-widest">Nenhum pagamento registrado ainda.</p>
      </div>
    </div>
  );
}
