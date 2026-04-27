'use client';

import React, { useState } from 'react';
import { CreditCard, CheckCircle2, AlertCircle, Clock, ChevronDown } from 'lucide-react';
import { updateFinancialStatus } from '@/app/(dashboard)/alunos/actions';

export default function FinancialManager({ student, currentStatus }) {
  const [data, setData] = useState({
    status: currentStatus || 'paid',
    dueDay: student?.due_day || 10,
    monthlyFee: student?.monthly_fee || 0
  });
  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdate = async (updates) => {
    const newData = { ...data, ...updates };
    setIsUpdating(true);
    const res = await updateFinancialStatus(student.id, newData);
    if (res.success) {
      setData(newData);
    }
    setIsUpdating(false);
  };

  return (
    <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-slate-900 text-white rounded-lg">
            <CreditCard size={20} />
          </div>
          <h3 className="text-xl font-black text-slate-800 tracking-tight">Gestão Financeira</h3>
        </div>
        <div className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
          data.status === 'overdue' ? 'bg-rose-50 text-rose-600 border-rose-100' :
          data.status === 'pending' ? 'bg-amber-50 text-amber-600 border-amber-100' :
          'bg-emerald-50 text-emerald-600 border-emerald-100'
        }`}>
          {data.status === 'overdue' ? 'Em Atraso' : data.status === 'pending' ? 'Pendente' : 'Em Dia'}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <div>
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Dia de Vencimento</label>
          <input 
            type="number" 
            value={data.dueDay}
            onChange={(e) => handleUpdate({ dueDay: parseInt(e.target.value) })}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold focus:bg-white transition-all outline-none"
            placeholder="Ex: 10"
          />
        </div>
        <div>
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Valor Mensalidade</label>
          <input 
            type="number" 
            value={data.monthlyFee}
            onChange={(e) => handleUpdate({ monthlyFee: parseFloat(e.target.value) })}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold focus:bg-white transition-all outline-none"
            placeholder="Ex: 150.00"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Alterar Status</p>
        
        <button 
          onClick={() => handleUpdate({ status: 'paid' })}
          disabled={isUpdating}
          className={`flex items-center justify-between p-4 rounded-2xl transition-all border ${
            data.status === 'paid' ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-slate-50 border-slate-100 text-slate-400 hover:bg-slate-100'
          }`}
        >
          <div className="flex items-center gap-3">
            <CheckCircle2 size={18} />
            <span className="font-bold text-sm">Mensalidade Paga</span>
          </div>
          {data.status === 'paid' && <div className="w-2 h-2 bg-emerald-500 rounded-full" />}
        </button>

        <button 
          onClick={() => handleUpdate({ status: 'pending' })}
          disabled={isUpdating}
          className={`flex items-center justify-between p-4 rounded-2xl transition-all border ${
            data.status === 'pending' ? 'bg-amber-50 border-amber-200 text-amber-900' : 'bg-slate-50 border-slate-100 text-slate-400 hover:bg-slate-100'
          }`}
        >
          <div className="flex items-center gap-3">
            <Clock size={18} />
            <span className="font-bold text-sm">Pendente</span>
          </div>
          {data.status === 'pending' && <div className="w-2 h-2 bg-amber-500 rounded-full" />}
        </button>

        <button 
          onClick={() => handleUpdate({ status: 'overdue' })}
          disabled={isUpdating}
          className={`flex items-center justify-between p-4 rounded-2xl transition-all border ${
            data.status === 'overdue' ? 'bg-rose-50 border-rose-200 text-rose-900' : 'bg-slate-50 border-slate-100 text-slate-400 hover:bg-slate-100'
          }`}
        >
          <div className="flex items-center gap-3">
            <AlertCircle size={18} />
            <span className="font-bold text-sm">Em Atraso</span>
          </div>
          {data.status === 'overdue' && <div className="w-2 h-2 bg-rose-500 rounded-full" />}
        </button>
      </div>
      
      <p className="mt-6 text-[10px] text-slate-400 font-medium text-center italic">
        Alterações aqui refletem imediatamente no Dashboard e na lista geral de alunos.
      </p>
    </div>
  );
}
