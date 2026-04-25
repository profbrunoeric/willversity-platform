'use client';

import React, { useState, useEffect } from 'react';
import { Hash, ArrowRight, LogOut, Loader2 } from 'lucide-react';
import { redeemCode, signOut } from '../actions';
import { createClient } from '@/lib/supabase/client';

export default function OnboardingPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);
  
  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      console.log('--- DEBUG ONBOARDING ---');
      console.log('Usuário identificado:', data.user);
      setUser(data.user);
      setInitializing(false);
    };
    getUser();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user) {
      setError('Erro: Sessão não encontrada. Por favor, faça login novamente.');
      return;
    }
    
    setLoading(true);
    setError('');
    
    const formData = new FormData(e.target);
    formData.append('userId', user.id);
    
    console.log('Enviando código para o servidor...');
    const result = await redeemCode(formData);
    
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  };

  if (initializing) {
    return (
      <div className="flex flex-col items-center justify-center p-12">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <p className="mt-4 text-slate-500 font-medium tracking-tight">Identificando sua conta...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
          Quase lá, {user?.user_metadata?.full_name?.split(' ')[0] || 'Estudante'}!
        </h2>
        <p className="mt-2 text-sm text-slate-500 font-medium">
          Sua conta foi criada. Agora insira seu código de aluno para ativar o acesso à plataforma.
        </p>
      </div>

      <div className="bg-white py-8 px-6 shadow-xl shadow-slate-200/50 rounded-3xl border border-slate-100">
        <form className="space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-rose-50 border border-rose-100 text-rose-600 px-4 py-3 rounded-xl text-sm font-medium">
              {error}
            </div>
          )}
          
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Código de Aluno</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Hash className="h-5 w-5 text-primary/40" />
              </div>
              <input
                name="studentCode"
                type="text"
                required
                className="appearance-none block w-full pl-11 pr-4 py-3 border-2 border-slate-50 rounded-2xl shadow-sm placeholder-slate-400 focus:outline-none focus:border-primary transition-all bg-slate-50 focus:bg-white font-medium"
                placeholder="WILL-XXXX-XXXX"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center items-center gap-2 py-4 px-4 rounded-2xl shadow-lg shadow-primary/20 text-sm font-bold text-white bg-primary hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 transition-all"
          >
            {loading ? 'Validando...' : 'Ativar Minha Conta'}
            {!loading && <ArrowRight size={18} />}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-slate-50">
          <button
            onClick={() => signOut()}
            className="w-full flex justify-center items-center gap-2 text-sm text-slate-400 hover:text-rose-500 transition-colors font-medium"
          >
            <LogOut size={16} />
            Sair e entrar com outra conta
          </button>
        </div>
      </div>
    </div>
  );
}
