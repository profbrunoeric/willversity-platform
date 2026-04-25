'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Bell, Zap, Star, MessageSquare, Clock, BookOpen } from 'lucide-react';
import { getGlobalActivity } from '@/app/(dashboard)/activity-actions';
import { createClient } from '@/lib/supabase/client';

export default function ActivityFeed() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);
  const supabase = createClient();

  useEffect(() => {
    async function init() {
      // 1. Detectar cargo do usuário para filtrar o Realtime
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();
        setUserRole(profile?.role);
      }

      // 2. Carga inicial de dados
      const data = await getGlobalActivity();
      setActivities(data);
      setLoading(false);
    }
    
    init();

    // 3. [REALTIME] Inscrição ativa no Supabase
    const channel = supabase.channel('global-activity-feed')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'xp_transactions' },
        () => refresh()
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'announcements' },
        () => refresh()
      );

    // Somente Admin/Teacher escuta evoluções pedagógicas (o RLS já bloqueia, mas aqui otimizamos o tráfego)
    if (userRole === 'admin' || userRole === 'teacher') {
      channel.on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'lesson_evolutions' },
        () => refresh()
      );
    }

    channel.subscribe();

    async function refresh() {
      const data = await getGlobalActivity();
      setActivities(data);
    }

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userRole]);

  if (loading) return (
    <div className="glass-card p-8 space-y-4">
      <div className="h-6 w-32 bg-slate-100 rounded-full animate-pulse" />
      {[1,2,3].map(i => (
        <div key={i} className="flex gap-4">
          <div className="w-10 h-10 bg-slate-100 rounded-full animate-pulse" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-full bg-slate-100 rounded-full animate-pulse" />
            <div className="h-3 w-1/2 bg-slate-100 rounded-full animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="glass-card overflow-hidden flex flex-col h-full">
      <div className="p-8 border-b border-slate-100 bg-white/30 backdrop-blur-md flex items-center justify-between">
        <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <Clock size={20} className="text-primary" />
          Atividade Global
        </h3>
        <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest bg-emerald-50 px-2 py-1 rounded-lg">Ao Vivo</span>
      </div>

      <div className="p-6 space-y-6 overflow-y-auto max-h-[500px] scrollbar-hide">
        <AnimatePresence mode="popLayout">
          {activities.map((act, idx) => (
            <motion.div 
              key={act.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="flex gap-4 group"
            >
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-lg ${
                act.type === 'xp' ? 'bg-amber-100 text-amber-600' : 
                act.type === 'lesson' ? 'bg-blue-100 text-blue-600' :
                'bg-primary/10 text-primary'
              }`}>
                {act.type === 'xp' ? <Zap size={20} /> : 
                 act.type === 'lesson' ? <BookOpen size={20} /> :
                 <Bell size={20} />}
              </div>

              <div className="flex-1 space-y-1">
                <p className="text-sm text-slate-600 leading-snug">
                  <span className="font-bold text-slate-900">{act.user}</span> 
                  {act.type === 'xp' ? (
                    <> ganhou <span className="text-emerald-500 font-bold">+{act.amount} XP</span> em <span className="font-bold text-slate-800">{act.category}</span></>
                  ) : act.type === 'lesson' ? (
                    <> registrou uma nova <span className="font-bold text-blue-600">evolução de aula</span></>
                  ) : (
                    <> publicou um novo <span className="font-bold text-primary">aviso importante</span></>
                  )}
                </p>
                
                {act.content && (
                  <p className="text-xs text-slate-400 font-medium italic line-clamp-1 group-hover:line-clamp-none transition-all">
                    "{act.content}"
                  </p>
                )}

                <div className="flex items-center gap-2 pt-1">
                  <div className="w-1 h-1 bg-slate-300 rounded-full" />
                  <span className="text-[10px] font-bold text-slate-300 uppercase">
                    {new Date(act.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {activities.length === 0 && (
          <div className="text-center py-10">
            <p className="text-slate-400 text-sm italic">Nenhuma atividade recente.</p>
          </div>
        )}
      </div>

      <div className="p-6 mt-auto bg-slate-50/50 border-t border-slate-100">
        <button className="w-full py-3 bg-white border border-slate-200 text-slate-500 rounded-xl font-bold text-xs hover:bg-primary hover:text-white transition-all shadow-sm">
          Ver Histórico Completo
        </button>
      </div>
    </div>
  );
}
