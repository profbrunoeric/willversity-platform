'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, Lock, Chrome, ArrowRight } from 'lucide-react';
import { signIn, signInWithGoogle } from '../actions';

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    const formData = new FormData(e.target);
    const result = await signIn(formData);
    
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
          Bem-vindo de volta!
        </h2>
        <p className="mt-2 text-sm text-slate-500 font-medium">
          Acesse sua conta para continuar seus estudos.
        </p>
      </div>

      <div className="bg-white py-8 px-6 shadow-xl shadow-slate-200/50 rounded-3xl border border-slate-100">
        <form className="space-y-5" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-rose-50 border border-rose-100 text-rose-600 px-4 py-3 rounded-xl text-sm font-medium">
              {error}
            </div>
          )}
          
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">E-mail</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-slate-400" />
              </div>
              <input
                name="email"
                type="email"
                required
                className="appearance-none block w-full pl-11 pr-4 py-3 border-2 border-slate-50 rounded-2xl shadow-sm placeholder-slate-400 focus:outline-none focus:border-primary transition-all bg-slate-50 focus:bg-white"
                placeholder="seu@email.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Senha</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-slate-400" />
              </div>
              <input
                name="password"
                type="password"
                required
                className="appearance-none block w-full pl-11 pr-4 py-3 border-2 border-slate-50 rounded-2xl shadow-sm placeholder-slate-400 focus:outline-none focus:border-primary transition-all bg-slate-50 focus:bg-white"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center items-center gap-2 py-4 px-4 rounded-2xl shadow-lg shadow-primary/20 text-sm font-bold text-white bg-primary hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 transition-all"
          >
            {loading ? 'Entrando...' : 'Entrar'}
            {!loading && <ArrowRight size={18} />}
          </button>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-100" />
            </div>
            <div className="relative flex justify-center text-xs font-bold uppercase tracking-widest">
              <span className="px-3 bg-white text-slate-400">Ou</span>
            </div>
          </div>

          <div className="mt-6">
            <button
              onClick={() => signInWithGoogle()}
              className="w-full inline-flex justify-center py-4 px-4 rounded-2xl border-2 border-slate-50 bg-white text-sm font-bold text-slate-700 shadow-sm hover:bg-slate-50 transition-all items-center gap-3"
            >
              <Chrome className="h-5 w-5 text-blue-600" />
              <span>Entrar com Google</span>
            </button>
          </div>
        </div>

        <div className="mt-8 text-center pt-6 border-t border-slate-50">
          <p className="text-sm text-slate-500 font-medium">
            Novo aluno?{' '}
            <Link href="/register" className="font-bold text-primary hover:underline transition-all">
              Cadastre-se aqui
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
