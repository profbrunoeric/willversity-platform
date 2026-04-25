'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Copy, Check, Ticket, ArrowRight, ShieldCheck, MessageCircle } from 'lucide-react';
import { generateRegistrationCode } from '@/app/(dashboard)/alunos/actions';

export default function EnrollStudentModal({ isOpen, onClose }) {
  const [loading, setLoading] = useState(false);
  const [generatedCode, setGeneratedCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await generateRegistrationCode();
      if (result && result.code) {
        setGeneratedCode(result.code);
      } else {
        setError('Não foi possível gerar o código. Verifique suas permissões.');
      }
    } catch (err) {
      setError('Erro ao gerar código de matrícula.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 md:p-6">
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          />

          {/* Modal Content */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl overflow-hidden"
          >
            {/* Header / Top bar */}
            <div className="bg-slate-900 p-8 text-white relative">
              <button 
                onClick={onClose}
                className="absolute top-6 right-6 p-2 hover:bg-white/10 rounded-full transition-all"
              >
                <X size={20} />
              </button>
              
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20">
                  <Ticket className="text-white" size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Matrícula Willversity</h3>
                  <p className="text-slate-400 text-xs font-medium uppercase tracking-widest">Geração de Acesso Seguro</p>
                </div>
              </div>
            </div>

            <div className="p-8 space-y-6">
              {!generatedCode ? (
                <div className="space-y-6">
                  <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                    <div className="flex gap-4">
                      <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg h-fit">
                        <ShieldCheck size={20} />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800 mb-1">Como funciona?</h4>
                        <p className="text-sm text-slate-500 leading-relaxed">
                          Ao clicar no botão abaixo, um código único será gerado. Você deve enviá-lo ao aluno para que ele complete o cadastro na plataforma.
                        </p>
                      </div>
                    </div>
                  </div>

                  {error && (
                    <div className="p-4 bg-rose-50 border border-rose-100 text-rose-600 text-sm font-bold rounded-2xl text-center">
                      {error}
                    </div>
                  )}

                  <button 
                    onClick={handleGenerate}
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-3 py-5 bg-primary text-white rounded-2xl font-black text-sm shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        GERAR NOVO CÓDIGO <ArrowRight size={18} />
                      </>
                    )}
                  </button>
                </div>
              ) : (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6 text-center"
                >
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mb-2 animate-bounce">
                      <Sparkles size={32} />
                    </div>
                    <h4 className="text-2xl font-black text-slate-900">Código Gerado!</h4>
                    <p className="text-slate-500 text-sm font-medium">Envie o link de convite direto para o aluno.</p>
                  </div>

                  <div className="space-y-4">
                    <div className="relative group">
                      <div className="w-full bg-slate-900 text-primary py-8 rounded-3xl text-4xl font-black tracking-[0.3em] font-mono shadow-inner">
                        {generatedCode}
                      </div>
                      <button 
                        onClick={copyToClipboard}
                        className="absolute -bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-full shadow-lg hover:shadow-xl transition-all group active:scale-95"
                      >
                        {copied ? (
                          <>
                            <Check size={16} className="text-emerald-500" />
                            <span className="text-xs font-bold text-emerald-500 uppercase">Copiado!</span>
                          </>
                        ) : (
                          <>
                            <Copy size={16} className="text-slate-400 group-hover:text-primary" />
                            <span className="text-xs font-bold text-slate-600 uppercase">Copiar Código</span>
                          </>
                        )}
                      </button>
                    </div>

                    <div className="pt-6 space-y-3 text-left">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Link de Convite Direto</p>
                      <div className="flex gap-2">
                        <input 
                          readOnly
                          value={`${typeof window !== 'undefined' ? window.location.origin : ''}/register?code=${generatedCode}`}
                          className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-4 text-xs font-mono text-slate-500"
                        />
                        <button 
                          onClick={() => {
                            const link = `${window.location.origin}/register?code=${generatedCode}`;
                            navigator.clipboard.writeText(link);
                            alert('Link de convite copiado!');
                          }}
                          className="p-4 bg-white border border-slate-200 text-slate-400 hover:text-primary rounded-2xl transition-all"
                          title="Copiar Link"
                        >
                          <Copy size={20} />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-3 pt-2">
                      <button 
                        onClick={() => {
                          const link = `${window.location.origin}/register?code=${generatedCode}`;
                          const message = encodeURIComponent(`Olá! Sua vaga na Willversity está pronta. Finalize sua matrícula através deste link exclusivo: ${link}`);
                          window.open(`https://wa.me/?text=${message}`, '_blank');
                        }}
                        className="w-full flex items-center justify-center gap-3 py-5 bg-emerald-500 text-white rounded-2xl font-black text-sm shadow-xl shadow-emerald-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                      >
                        <MessageCircle size={20} /> ENVIAR VIA WHATSAPP
                      </button>
                    </div>
                  </div>

                  <div className="pt-6">
                    <button 
                      onClick={onClose}
                      className="text-slate-400 font-bold text-xs uppercase tracking-widest hover:text-slate-600 transition-colors"
                    >
                      Fechar Janela
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
