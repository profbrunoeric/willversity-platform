'use client';

import React, { useState } from 'react';
import { CreditCard, CheckCircle2, AlertCircle, Clock, ChevronDown } from 'lucide-react';
import { updateFinancialStatus } from '@/app/(dashboard)/alunos/actions';

export default function FinancialManager({ studentId, currentStatus }) {
  const [status, setStatus] = useState(currentStatus || 'paid');
  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdate = async (newStatus) => {
    setIsUpdating(true);
    const res = await updateFinancialStatus(studentId, newStatus);
    if (res.success) {
      setStatus(newStatus);
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
          status === 'overdue' ? 'bg-rose-50 text-rose-600 border-rose-100' :
          status === 'pending' ? 'bg-amber-50 text-amber-600 border-amber-100' :
          'bg-emerald-50 text-emerald-600 border-emerald-100'
        }`}>
          {status === 'overdue' ? 'Em Atraso' : status === 'pending' ? 'Pendente' : 'Em Dia'}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Alterar Status de Mensalidade</p>
        
        <button 
          onClick={() => handleUpdate('paid')}
          disabled={isUpdating}
          className={`flex items-center justify-between p-4 rounded-2xl transition-all border ${
            status === 'paid' ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-slate-50 border-slate-100 text-slate-400 hover:bg-slate-100'
          }`}
        >
          <div className="flex items-center gap-3">
            <CheckCircle2 size={18} />
            <span className="font-bold text-sm">Mensalidade Paga (Em Dia)</span>
          </div>
          {status === 'paid' && <div className="w-2 h-2 bg-emerald-500 rounded-full" />}
        </button>

        <button 
          onClick={() => handleUpdate('pending')}
          disabled={isUpdating}
          className={`flex items-center justify-between p-4 rounded-2xl transition-all border ${
            status === 'pending' ? 'bg-amber-50 border-amber-200 text-amber-900' : 'bg-slate-50 border-slate-100 text-slate-400 hover:bg-slate-100'
          }`}
        >
          <div className="flex items-center gap-3">
            <Clock size={18} />
            <span className="font-bold text-sm">Pendente / Aguardando</span>
          </div>
          {status === 'pending' && <div className="w-2 h-2 bg-amber-500 rounded-full" />}
        </button>

        <button 
          onClick={() => handleUpdate('overdue')}
          disabled={isUpdating}
          className={`flex items-center justify-between p-4 rounded-2xl transition-all border ${
            status === 'overdue' ? 'bg-rose-50 border-rose-200 text-rose-900' : 'bg-slate-50 border-slate-100 text-slate-400 hover:bg-slate-100'
          }`}
        >
          <div className="flex items-center gap-3">
            <AlertCircle size={18} />
            <span className="font-bold text-sm">Atrasado / Inadimplente</span>
          </div>
          {status === 'overdue' && <div className="w-2 h-2 bg-rose-500 rounded-full" />}
        </button>
      </div>
      
      <p className="mt-6 text-[10px] text-slate-400 font-medium text-center italic">
        Alterações aqui refletem imediatamente no Dashboard e na lista geral de alunos.
      </p>
    </div>
  );
}
