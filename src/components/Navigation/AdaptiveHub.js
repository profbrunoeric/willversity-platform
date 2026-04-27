'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  Calendar, 
  UserSquare2, 
  Search,
  Bell,
  Menu,
  X,
  LogOut,
  Settings,
  Trophy
} from 'lucide-react';
import { signOut } from '@/app/(auth)/actions';
import { getSettings } from '@/app/(dashboard)/configuracoes/actions';
import UserLevelBadge from '@/components/Gamification/UserLevelBadge';
import { createClient } from '@/lib/supabase/client';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/' },
  { icon: Users, label: 'Alunos', href: '/alunos' },
  { icon: BookOpen, label: 'Sala de Aula', href: '/sala-de-aula' },
  { icon: Calendar, label: 'Agenda', href: '/agenda' },
  { icon: Trophy, label: 'Ranking', href: '/ranking' },
  { icon: UserSquare2, label: 'Professores', href: '/professores' },
  { icon: Settings, label: 'Command Center', href: '/configuracoes' },
];
import CommandPalette from './CommandPalette';

export default function AdaptiveHub() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [userId, setUserId] = useState(null);
  const [userRole, setUserRole] = useState('admin'); // Alterado para admin por padrão para evitar bloqueio do dono
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [platformName, setPlatformName] = useState('Willversity');

  useEffect(() => {
    // Atalho de Teclado (Ctrl+K ou Cmd+K)
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    setIsMounted(true);
    const supabase = createClient();
    
    async function loadUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();
        if (profile?.role) {
          setUserRole(profile.role);
        } else {
          // Se não tiver perfil mas estiver logado, mantemos admin para o dono não perder acesso
          setUserRole('admin');
        }
      }
    }

    loadUser();
    
    getSettings().then(data => {
      if (data?.platform_name) setPlatformName(data.platform_name);
    });
  }, []);

  // Filtro de Menu baseado em Cargos (RBAC)
  const filteredMenuItems = menuItems.filter(item => {
    if (userRole === 'admin') return true; // Admin vê tudo
    
    if (userRole === 'coordinator') {
      return ['/', '/alunos', '/sala-de-aula', '/agenda', '/professores', '/configuracoes'].includes(item.href);
    }
    
    if (userRole === 'teacher') {
      return ['/', '/alunos', '/sala-de-aula', '/agenda', '/ranking'].includes(item.href);
    }
    
    if (userRole === 'student') {
      return ['/', '/sala-de-aula', '/agenda', '/ranking'].includes(item.href);
    }
    
    return false;
  });

  if (!isMounted) return null;

  return (
    <>
      {/* Backdrop Overlay: Melhora o contraste e o foco no menu (Estilo Mobile) */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[9989] pointer-events-auto"
          />
        )}
      </AnimatePresence>

      <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[9990] flex flex-col items-center gap-6 pointer-events-none w-full max-w-[95vw] sm:max-w-fit">
        {/* Menu Bento / Radial */}
        <AnimatePresence>
          {isOpen && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 40 }}
              className="bg-white p-8 mb-6 shadow-[0_40px_100px_-15px_rgba(0,0,0,0.5)] rounded-[3rem] pointer-events-auto border border-slate-200 w-full sm:w-[500px] max-h-[70vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-8 px-2">
                <div className="flex flex-col gap-1">
                  <img src="/logo.png" alt="Willversity" className="h-10 w-auto object-contain" />
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">Navegação Inteligente</p>
                </div>
                <button 
                  onClick={() => signOut()}
                  className="flex items-center gap-2 p-3 bg-rose-50 text-rose-500 rounded-2xl hover:bg-rose-500 hover:text-white transition-all font-bold text-xs"
                >
                  <LogOut size={20} />
                  Sair
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {filteredMenuItems.map((item) => (
                  <Link 
                    key={item.href} 
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                  >
                    <motion.div 
                      whileHover={{ scale: 1.02, backgroundColor: 'rgba(0,0,0,0.02)' }}
                      whileTap={{ scale: 0.98 }}
                      className={`
                        p-6 rounded-[2rem] flex flex-col items-center justify-center gap-3 transition-all text-center border group
                        ${pathname === item.href ? 'bg-primary text-white shadow-xl shadow-primary/20 border-primary' : 'bg-slate-50 border-slate-100 text-slate-400 hover:text-slate-900'}
                      `}
                    >
                      <item.icon size={28} className={pathname === item.href ? 'text-white' : 'group-hover:text-primary transition-colors'} />
                      <span className="font-bold text-xs tracking-tight">{item.label}</span>
                    </motion.div>
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Floating Hub Pill */}
        <motion.nav 
          layout
          className="flex items-center gap-3 p-2.5 bg-white border border-slate-200 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.3)] rounded-full pointer-events-auto transition-all"
        >
          {/* Orbe de Perfil */}
          <div className="pl-1">
            <UserLevelBadge userId={userId} />
          </div>

          <div className="h-10 w-px bg-slate-100 mx-1 hidden sm:block" />

          <div className="flex items-center gap-1.5">
            {/* Busca */}
            <button 
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className={`p-3.5 rounded-full transition-all ${isSearchOpen ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-400 hover:bg-slate-100'}`}
            >
              <Search size={22} />
            </button>

            {/* Menu Central */}
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsOpen(!isOpen)}
              className={`
                flex items-center justify-center w-14 h-14 rounded-full shadow-xl transition-all duration-300
                ${isOpen ? 'bg-slate-900 text-white rotate-90' : 'bg-primary text-white shadow-primary/40'}
              `}
            >
              {isOpen ? <X size={28} /> : <Menu size={28} />}
            </motion.button>

            {/* Notificações */}
            <Link 
              href="/configuracoes?tab=announcements"
              onClick={() => setIsOpen(false)}
              className="p-3.5 text-slate-400 hover:text-primary transition-all relative group"
            >
              <Bell size={22} />
              <div className="absolute top-3.5 right-3.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white" />
            </Link>
          </div>
        </motion.nav>
      </div>

      <CommandPalette 
        isOpen={isSearchOpen} 
        onClose={() => setIsSearchOpen(false)} 
      />
    </>
  );
}
