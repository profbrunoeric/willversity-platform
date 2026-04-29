'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Ticket, Copy, Check, Loader2, Sparkles } from 'lucide-react';
import { generateRegistrationCode } from '@/app/(dashboard)/alunos/actions';

export default function InviteTeacherModal({ isOpen, onClose }) {
  const [loading, setLoading] = useState(false);
  const [inviteCode, setInviteCode] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await generateRegistrationCode('teacher');
      if (result.success) {
        setInviteCode(result.code);
      } else {
        alert(result.error || 'Erro ao gerar código.');
      }
    } catch (err) {
      alert('Erro crítico: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    const url = `${window.location.origin}/register?code=${inviteCode}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setInviteCode(null);
    setCopied(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          />

          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl overflow-hidden"
          >
            <div className="p-8 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                  <Ticket size={20} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Convidar Professor</h3>
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Geração de acesso exclusivo</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-full transition-all text-slate-400">
                <X size={20} />
              </button>
            </div>

            <div className="p-8">
              {!inviteCode ? (
                <div className="space-y-6 text-center">
                  <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto text-slate-300">
                    <Mail size={40} />
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-lg font-bold text-slate-800">Pronto para expandir o time?</h4>
                    <p className="text-sm text-slate-500 leading-relaxed">
                      Ao clicar no botão abaixo, geraremos uma chave única. Você poderá copiar o link de cadastro e enviar para o novo professor.
                    </p>
                  </div>
                  <button 
                    onClick={handleGenerate}
                    disabled={loading}
                    className="w-full py-5 bg-primary text-white rounded-2xl font-black text-sm shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {loading ? <Loader2 className="animate-spin" size={20} /> : <Sparkles size={20} />}
                    GERAR LINK DE CONVITE
                  </button>
                </div>
              ) : (
                <div className="space-y-8">
                  <div className="p-8 bg-emerald-50 border-2 border-dashed border-emerald-200 rounded-[2rem] text-center space-y-4">
                    <div className="w-12 h-12 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto shadow-lg shadow-emerald-200">
                      <Check size={24} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">Link de Acesso Gerado</p>
                      <p className="text-sm text-emerald-800 font-medium">O professor poderá completar o perfil sozinho.</p>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-emerald-100 font-mono text-xs text-emerald-600 break-all">
                      {window.location.origin}/register?code={inviteCode}
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button 
                      onClick={copyToClipboard}
                      className="flex-[2] py-5 bg-slate-900 text-white rounded-2xl font-black text-sm shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                    >
                      {copied ? <Check size={20} /> : <Copy size={20} />}
                      {copied ? 'COPIADO!' : 'COPIAR LINK'}
                    </button>
                    <button 
                      onClick={handleReset}
                      className="flex-1 py-5 bg-slate-50 text-slate-400 rounded-2xl font-bold text-sm hover:bg-slate-100 transition-all"
                    >
                      Novo
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
