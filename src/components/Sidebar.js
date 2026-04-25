'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  Calendar, 
  UserSquare2, 
  CircleDollarSign,
  LogOut,
  Sparkles
} from 'lucide-react';
import { signOut } from '@/app/(auth)/actions';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/' },
  { icon: Users, label: 'Alunos', href: '/alunos' },
  { icon: BookOpen, label: 'Sala de Aula', href: '/sala-de-aula' },
  { icon: Calendar, label: 'Agenda', href: '/agenda' },
  { icon: UserSquare2, label: 'Professores', href: '/professores' },
  { icon: CircleDollarSign, label: 'Financeiro', href: '/financeiro' },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-white border-r border-slate-100 flex flex-col h-screen sticky top-0">
      {/* Logo */}
      <div className="p-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
            <GraduationCapIcon className="text-white w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800 leading-tight">Willversity</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Univ. of English</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-2">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex items-center gap-3 px-4 py-3 rounded-2xl font-medium transition-all duration-200
                ${isActive 
                  ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                  : 'text-slate-500 hover:bg-slate-50 hover:text-primary'}
              `}
            >
              <item.icon size={20} className={isActive ? 'text-white' : 'text-slate-400'} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Upgrade Card / Support */}
      <div className="p-4">
        <div className="bg-slate-50 rounded-3xl p-5 border border-slate-100 relative overflow-hidden group">
          <Sparkles className="absolute -right-2 -top-2 w-12 h-12 text-primary/5 group-hover:scale-125 transition-transform" />
          <h4 className="text-xs font-bold text-slate-800 mb-1">Premium Plan</h4>
          <p className="text-[10px] text-slate-400 mb-3">Your school is growing! Check your analytics.</p>
          <div className="h-1 w-full bg-slate-200 rounded-full overflow-hidden">
            <div className="h-full bg-primary w-2/3"></div>
          </div>
        </div>
      </div>

      {/* Footer / Logout */}
      <div className="p-4 border-t border-slate-50">
        <button 
          onClick={() => signOut()}
          className="flex items-center gap-3 px-4 py-3 w-full text-slate-500 hover:text-rose-500 hover:bg-rose-50 rounded-2xl transition-all font-medium"
        >
          <LogOut size={20} />
          <span>Sair</span>
        </button>
      </div>
    </aside>
  );
}

function GraduationCapIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
      <path d="M6 12v5c3 3 9 3 12 0v-5" />
    </svg>
  );
}
