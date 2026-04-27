'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Medal, Crown, Star, ChevronRight, Users, TrendingUp } from 'lucide-react';
import { getLeaderboard } from '../alunos/actions';
import { createClient } from '@/lib/supabase/client';

export default function RankingPage() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadRanking() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);

      const data = await getLeaderboard();
      setLeaderboard(data);
      setLoading(false);
    }
    loadRanking();
  }, []);

  const getPodiumColor = (index) => {
    switch(index) {
      case 0: return 'bg-amber-400 text-amber-950 shadow-amber-500/20'; // Gold
      case 1: return 'bg-slate-300 text-slate-800 shadow-slate-400/20'; // Silver
      case 2: return 'bg-amber-700 text-amber-50 shadow-amber-800/20'; // Bronze
      default: return 'bg-white text-slate-400';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  const top3 = leaderboard.slice(0, 3);
  const others = leaderboard.slice(3);

  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-20">
      {/* Header */}
      <div className="text-center space-y-4 pt-10">
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="inline-flex p-4 bg-amber-100 text-amber-600 rounded-3xl mb-4"
        >
          <Trophy size={48} />
        </motion.div>
        <h1 className="text-5xl font-black text-slate-900 tracking-tight">Hall da Fama <span className="text-primary">Willversity</span></h1>
        <p className="text-slate-500 font-medium text-lg max-w-xl mx-auto">
          Os alunos mais engajados da semana. Estude, complete aulas e suba no ranking!
        </p>
      </div>

      {/* Podium */}
      <div className="flex flex-col md:flex-row items-end justify-center gap-6 md:gap-4 px-4 pt-10">
        {/* Silver (2nd) */}
        {top3[1] && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="order-2 md:order-1 flex flex-col items-center group"
          >
            <div className="relative mb-4">
              <div className="w-20 h-20 bg-slate-100 rounded-full border-4 border-slate-300 flex items-center justify-center font-black text-2xl text-slate-400 overflow-hidden shadow-xl">
                {top3[1].full_name?.charAt(0)}
              </div>
              <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-slate-300 text-slate-700 rounded-full flex items-center justify-center font-black text-xs border-2 border-white">2º</div>
            </div>
            <div className="bg-white border border-slate-100 p-6 rounded-[2.5rem] shadow-xl w-48 text-center space-y-2 group-hover:border-slate-300 transition-all">
              <p className="font-black text-slate-900 truncate">{top3[1].full_name}</p>
              <div className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-black inline-block">
                {top3[1].xp} XP
              </div>
            </div>
            <div className="h-24 w-40 bg-slate-200/50 rounded-t-[2rem] mt-4" />
          </motion.div>
        )}

        {/* Gold (1st) */}
        {top3[0] && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            className="order-1 md:order-2 flex flex-col items-center group"
          >
            <div className="relative mb-6">
              <motion.div 
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ repeat: Infinity, duration: 4 }}
                className="absolute -top-10 left-1/2 -translate-x-1/2 text-amber-500"
              >
                <Crown size={48} />
              </motion.div>
              <div className="w-28 h-28 bg-amber-50 rounded-full border-4 border-amber-400 flex items-center justify-center font-black text-4xl text-amber-600 overflow-hidden shadow-2xl shadow-amber-200">
                {top3[0].full_name?.charAt(0)}
              </div>
              <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-amber-400 text-amber-950 rounded-full flex items-center justify-center font-black text-sm border-4 border-white">1º</div>
            </div>
            <div className="bg-white border-2 border-amber-200 p-8 rounded-[3rem] shadow-2xl w-56 text-center space-y-2 transform -translate-y-2">
              <p className="font-black text-slate-900 text-lg truncate">{top3[0].full_name}</p>
              <div className="bg-amber-400 text-amber-950 px-4 py-1.5 rounded-full text-sm font-black inline-block shadow-lg shadow-amber-400/20">
                {top3[0].xp} XP
              </div>
            </div>
            <div className="h-32 w-48 bg-amber-400/20 rounded-t-[2.5rem] mt-4" />
          </motion.div>
        )}

        {/* Bronze (3rd) */}
        {top3[2] && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="order-3 flex flex-col items-center group"
          >
            <div className="relative mb-4">
              <div className="w-20 h-20 bg-amber-50 rounded-full border-4 border-amber-700 flex items-center justify-center font-black text-2xl text-amber-700 overflow-hidden shadow-xl">
                {top3[2].full_name?.charAt(0)}
              </div>
              <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-amber-700 text-amber-50 rounded-full flex items-center justify-center font-black text-xs border-2 border-white">3º</div>
            </div>
            <div className="bg-white border border-slate-100 p-6 rounded-[2.5rem] shadow-xl w-48 text-center space-y-2 group-hover:border-amber-100 transition-all">
              <p className="font-black text-slate-900 truncate">{top3[2].full_name}</p>
              <div className="bg-amber-700/10 text-amber-800 px-3 py-1 rounded-full text-xs font-black inline-block">
                {top3[2].xp} XP
              </div>
            </div>
            <div className="h-16 w-40 bg-amber-700/10 rounded-t-[2rem] mt-4" />
          </motion.div>
        )}
      </div>

      {/* Others List */}
      <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden mx-4">
        <div className="px-10 py-6 border-b border-slate-50 flex items-center justify-between">
          <h3 className="font-black text-slate-900 uppercase tracking-widest text-xs">Posições Restantes</h3>
          <div className="flex items-center gap-2 text-slate-400 text-xs font-bold">
            <Users size={14} />
            Top 10 Alunos
          </div>
        </div>
        <div className="divide-y divide-slate-50">
          {others.map((student, idx) => {
            const position = idx + 4;
            const isMe = student.id === currentUser?.id;

            return (
              <motion.div 
                key={student.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * idx }}
                className={`flex items-center justify-between p-6 px-10 hover:bg-slate-50 transition-all ${isMe ? 'bg-primary/5' : ''}`}
              >
                <div className="flex items-center gap-6">
                  <span className="w-8 font-black text-slate-300 text-lg">{position}º</span>
                  <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center font-black text-slate-400 group-hover:bg-primary group-hover:text-white transition-all">
                    {student.full_name?.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">
                      {student.full_name}
                      {isMe && <span className="ml-2 text-[10px] bg-primary text-white px-2 py-0.5 rounded-full uppercase tracking-tighter">Você</span>}
                    </p>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-tight">{student.level || 'Sem Nível'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="font-black text-slate-900">{student.xp}</p>
                    <p className="text-[10px] text-slate-400 font-black uppercase">XP Total</p>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center">
                    <TrendingUp size={16} />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Incentivizer Card */}
      <div className="mx-4 p-10 bg-primary rounded-[3rem] text-white flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl shadow-primary/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="relative z-10 space-y-2 text-center md:text-left">
          <h3 className="text-3xl font-black tracking-tight">Quer subir no ranking?</h3>
          <p className="text-primary-foreground/80 font-medium max-w-md">
            Cada aula concluída te dá <span className="text-white font-bold">+50 XP</span>. Marque presença e torne-se o próximo número 1!
          </p>
        </div>
        <button className="relative z-10 px-8 py-4 bg-white text-primary rounded-2xl font-black text-sm hover:scale-105 active:scale-95 transition-all shadow-xl">
          COMEÇAR A ESTUDAR AGORA
        </button>
      </div>
    </div>
  );
}
