'use client';

import React, { useState, Suspense } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Lock, Sparkles, ArrowRight, Ticket, CheckCircle2, MessageCircle, Calendar } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { signUp } from '../actions';
import Link from 'next/link';

function RegisterForm() {
  const searchParams = useSearchParams();
  const inviteCode = searchParams.get('code');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setAvatarPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!inviteCode) {
      setError("Convite obrigatório para cadastro.");
      return;
    }

    setLoading(true);
    setError(null);
    
    const formData = new FormData(e.target);
    if (avatarFile) {
      formData.append('avatar', avatarFile);
    }
    const result = await signUp(formData);
    
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  };

  return (
    <div className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[3rem] p-10 md:p-14 shadow-2xl">
      <div className="flex flex-col items-center text-center mb-10">
        <div className={`w-16 h-16 ${inviteCode ? 'bg-primary' : 'bg-slate-800'} rounded-2xl flex items-center justify-center shadow-2xl shadow-primary/20 mb-6 transition-colors`}>
          <Sparkles className="text-white" size={32} />
        </div>
        <h1 className="text-4xl font-black text-white tracking-tight mb-3">
          {inviteCode ? 'Crie sua Conta' : 'Acesso Restrito'}
        </h1>
        <p className="text-slate-400 font-medium">
          {inviteCode ? 'Junte-se à elite da Willversity.' : 'Você precisa de um convite oficial para entrar.'}
        </p>
      </div>

      {!inviteCode ? (
        <div className="space-y-8 text-center animate-in fade-in zoom-in duration-500">
          <div className="p-8 bg-white/5 border border-white/10 rounded-[2rem] space-y-4">
            <Ticket className="text-primary mx-auto opacity-50" size={48} />
            <p className="text-slate-300 text-sm leading-relaxed">
              A Willversity é uma plataforma exclusiva. Para garantir a qualidade pedagógica, o acesso é liberado apenas através de links de convite enviados pela coordenação.
            </p>
          </div>
          <a 
            href="https://wa.me/SEU_NUMERO_AQUI" 
            target="_blank"
            className="block w-full bg-white text-slate-900 rounded-2xl py-5 font-black text-lg hover:bg-slate-100 transition-all shadow-xl"
          >
            SOLICITAR ACESSO
          </a>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
          {error && (
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-500 text-sm font-bold rounded-2xl text-center"
            >
              {error}
            </motion.div>
          )}

          <div className="space-y-6">
            {/* Foto de Perfil (Opcional) */}
            <div className="flex flex-col items-center gap-4 mb-8">
              <div className="relative group">
                <div className="w-24 h-24 bg-white/10 rounded-[2rem] border-2 border-dashed border-white/20 flex items-center justify-center overflow-hidden transition-all group-hover:border-primary/50">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <User className="text-slate-500" size={32} />
                  )}
                </div>
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              </div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Foto de Perfil (Opcional)</p>
            </div>

            {/* Nome Completo */}
            <div className="relative group">
              <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors">
                <User size={20} />
              </div>
              <input 
                name="fullName"
                type="text" 
                required
                placeholder="Seu nome completo"
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 pl-16 pr-6 text-white placeholder:text-slate-500 outline-none focus:ring-4 ring-primary/20 focus:border-primary/50 transition-all font-medium"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* WhatsApp */}
              <div className="relative group">
                <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-500 transition-colors">
                  <MessageCircle size={20} />
                </div>
                <input 
                  name="phone"
                  type="text" 
                  placeholder="WhatsApp (00) 00000-0000"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 pl-16 pr-6 text-white placeholder:text-slate-500 outline-none focus:ring-4 ring-primary/20 focus:border-primary/50 transition-all font-medium"
                />
              </div>

              {/* Data de Nascimento */}
              <div className="relative group">
                <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors">
                  <Calendar size={20} />
                </div>
                <input 
                  name="birthDate"
                  type="date" 
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 pl-16 pr-6 text-white placeholder:text-slate-500 outline-none focus:ring-4 ring-primary/20 focus:border-primary/50 transition-all font-medium appearance-none"
                />
              </div>
            </div>

            {/* Campo: E-mail */}
            <div className="relative group">
              <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors">
                <Mail size={20} />
              </div>
              <input 
                name="email"
                type="email" 
                required
                placeholder="Seu melhor e-mail"
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 pl-16 pr-6 text-white placeholder:text-slate-500 outline-none focus:ring-4 ring-primary/20 focus:border-primary/50 transition-all font-medium"
              />
            </div>

            {/* Campo: Senha */}
            <div className="relative group">
              <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors">
                <Lock size={20} />
              </div>
              <input 
                name="password"
                type="password" 
                required
                placeholder="Crie uma senha forte"
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 pl-16 pr-6 text-white placeholder:text-slate-500 outline-none focus:ring-4 ring-primary/20 focus:border-primary/50 transition-all font-medium"
              />
            </div>

            <div className="h-px bg-white/10 my-8" />

            {/* Campo: CÓDIGO DE MATRÍCULA (AUTO-PREENCHIDO) */}
            <div className="relative group opacity-80">
              <div className="absolute left-6 top-1/2 -translate-y-1/2 text-primary">
                <Ticket size={20} />
              </div>
              <input 
                name="studentCode"
                type="text" 
                readOnly
                value={inviteCode || ''}
                className="w-full bg-primary/5 border-2 border-primary/20 rounded-2xl py-6 pl-16 pr-6 text-white outline-none font-black tracking-widest text-lg cursor-not-allowed"
              />
              <div className="absolute right-6 top-1/2 -translate-y-1/2 text-[10px] font-black text-primary uppercase tracking-widest bg-primary/20 px-2 py-1 rounded-lg">
                Validado
              </div>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-primary text-white rounded-2xl py-5 font-black text-lg shadow-2xl shadow-primary/40 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {loading ? (
              <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                ATIVAR MINHA CONTA <ArrowRight size={22} />
              </>
            )}
          </button>
        </form>
      )}

      <div className="mt-10 pt-8 border-t border-white/5 flex flex-col items-center gap-4">
        <p className="text-slate-500 font-medium">Já possui uma conta ativa?</p>
        <Link href="/login" className="text-white font-bold hover:text-primary transition-colors flex items-center gap-2">
          Acessar Plataforma <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background dynamic elements */}
      <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-900 rounded-full blur-[120px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-xl relative z-10"
      >
        <Suspense fallback={<div className="text-white">Carregando convite...</div>}>
          <RegisterForm />
        </Suspense>

        {/* Footer info */}
        <div className="mt-8 flex items-center justify-center gap-8 text-[10px] font-black text-slate-600 uppercase tracking-widest">
          <div className="flex items-center gap-2"><CheckCircle2 size={12} /> Criptografia Ponta-a-Ponta</div>
          <div className="flex items-center gap-2"><CheckCircle2 size={12} /> Acesso Restrito</div>
        </div>
      </motion.div>
    </div>
  );
}
