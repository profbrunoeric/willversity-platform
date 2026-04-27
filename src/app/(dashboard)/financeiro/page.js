import React from 'react';
import { Wallet, Search, Filter, ArrowUpRight, TrendingUp, CreditCard, AlertCircle } from 'lucide-react';
import { getStudents } from '@/app/(dashboard)/alunos/actions';
import { createClient } from '@/lib/supabase/server';
import FinancialManager from '@/components/Alunos/FinancialManager';

export default async function FinanceiroPage() {
  const students = await getStudents();
  
  // Stats
  const paidCount = students.filter(s => s.payment_status === 'paid' || !s.payment_status).length;
  const pendingCount = students.filter(s => s.payment_status === 'pending').length;
  const overdueCount = students.filter(s => s.payment_status === 'overdue').length;

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
            <Wallet className="text-primary" size={32} />
            Módulo Financeiro
          </h2>
          <p className="text-slate-500 font-medium mt-1">Gestão de mensalidades e saúde financeira da escola.</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-8 border-emerald-100 bg-emerald-50/30">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-emerald-500 text-white rounded-2xl">
              <TrendingUp size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Em Dia</p>
              <h3 className="text-3xl font-black text-slate-900">{paidCount}</h3>
            </div>
          </div>
          <p className="text-xs text-emerald-600/70 font-medium">Alunos com acesso liberado.</p>
        </div>

        <div className="glass-card p-8 border-amber-100 bg-amber-50/30">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-amber-500 text-white rounded-2xl">
              <CreditCard size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest">Pendentes</p>
              <h3 className="text-3xl font-black text-slate-900">{pendingCount}</h3>
            </div>
          </div>
          <p className="text-xs text-amber-600/70 font-medium">Aguardando confirmação de pagamento.</p>
        </div>

        <div className="glass-card p-8 border-rose-100 bg-rose-50/30">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-rose-500 text-white rounded-2xl">
              <AlertCircle size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black text-rose-600 uppercase tracking-widest">Em Atraso</p>
              <h3 className="text-3xl font-black text-slate-900">{overdueCount}</h3>
            </div>
          </div>
          <p className="text-xs text-rose-600/70 font-medium">Alunos com mensalidade vencida.</p>
        </div>
      </div>

      {/* Main Content: Management List */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h4 className="font-black text-slate-800 uppercase tracking-widest text-sm">Lista de Gestão Rápida</h4>
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Buscar aluno..." 
              className="pl-12 pr-6 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-primary/5 outline-none transition-all text-sm w-full sm:w-64"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Aluno</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Status Atual</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Ações de Gestão</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {students.map((student) => (
                <tr key={student.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center font-bold text-slate-500 group-hover:bg-primary group-hover:text-white transition-all">
                        {student.full_name?.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 text-sm">{student.full_name}</p>
                        <p className="text-xs text-slate-400">{student.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                      student.payment_status === 'overdue' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                      student.payment_status === 'pending' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                      'bg-emerald-50 text-emerald-600 border-emerald-100'
                    }`}>
                      {student.payment_status === 'overdue' ? 'Em Atraso' : student.payment_status === 'pending' ? 'Pendente' : 'Em Dia'}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {/* Componente Client para troca rápida */}
                      <FinancialManager student={student} currentStatus={student.payment_status} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
