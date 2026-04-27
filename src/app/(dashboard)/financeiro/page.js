import React from 'react';
import { Wallet, Search, Filter, ArrowUpRight, TrendingUp, CreditCard, AlertCircle } from 'lucide-react';
import { getStudents } from '@/app/(dashboard)/alunos/actions';
import { createClient } from '@/lib/supabase/server';
import FinancialManager from '@/components/Alunos/FinancialManager';
import { getFinancialReport } from '@/app/(dashboard)/stats-actions';
import ExpensesManager from '@/components/Alunos/ExpensesManager';

export default async function FinanceiroPage() {
  const students = await getStudents();
  const report = await getFinancialReport();
  
  // Stats
  const paidCount = students.filter(s => s.payment_status === 'paid' || !s.payment_status).length;
  const pendingCount = students.filter(s => s.payment_status === 'pending').length;
  const overdueCount = students.filter(s => s.payment_status === 'overdue').length;

  const formatCurrency = (val) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
            <Wallet className="text-primary" size={32} />
            Fluxo de Caixa & Gestão
          </h2>
          <p className="text-slate-500 font-medium mt-1">Visão analítica de entradas, saídas e projeções futuras.</p>
        </div>
      </div>

      {/* Cash Flow Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="glass-card p-6 border-slate-100 bg-white">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Entradas (Mês)</p>
          <h3 className="text-2xl font-black text-emerald-600">{formatCurrency(report.inflow)}</h3>
          <p className="text-[10px] text-slate-400 mt-2 font-medium">Pagamentos recebidos</p>
        </div>

        <div className="glass-card p-6 border-slate-100 bg-white">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Saídas (Mês)</p>
          <h3 className="text-2xl font-black text-rose-600">{formatCurrency(report.outflow)}</h3>
          <p className="text-[10px] text-slate-400 mt-2 font-medium">Despesas pagas</p>
        </div>

        <div className="glass-card p-6 border-slate-900 bg-slate-900 text-white shadow-xl shadow-slate-200">
          <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-2">Saldo Atual</p>
          <h3 className="text-2xl font-black text-white">{formatCurrency(report.balance)}</h3>
          <div className="w-full bg-white/10 h-1 rounded-full mt-4 overflow-hidden">
             <div className="bg-emerald-400 h-full" style={{ width: report.balance > 0 ? '70%' : '0%' }} />
          </div>
        </div>

        <div className="glass-card p-6 border-primary/20 bg-primary/5 relative overflow-hidden group">
          <TrendingUp className="absolute -right-2 -bottom-2 text-primary/5 w-20 h-20 rotate-12 group-hover:scale-110 transition-transform" />
          <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-2">Projeção Futura</p>
          <h3 className="text-2xl font-black text-slate-900">{formatCurrency(report.projection)}</h3>
          <p className="text-[10px] text-primary/60 mt-2 font-medium">Soma de todas as mensalidades</p>
        </div>
      </div>

      {/* NOVO: Gestão de Despesas */}
      <ExpensesManager />

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
