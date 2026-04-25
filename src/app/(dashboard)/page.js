import React from 'react';
import { 
  Users, 
  Calendar, 
  TrendingUp, 
  CheckCircle2, 
  Clock, 
  Plus,
  ArrowUpRight,
  BookOpen,
  Ticket,
  Library,
  Zap
} from 'lucide-react';
import Link from 'next/link';
import { getStudents } from '@/app/(dashboard)/alunos/actions';
import { getSettings } from './configuracoes/actions';
import AnnouncementBanner from '@/components/Announcements/AnnouncementBanner';
import { createClient } from '@/lib/supabase/server';
import LevelProgress from '@/components/Gamification/LevelProgress';
import ActivityFeed from '@/components/Activity/ActivityFeed';
import { getDashboardStats } from './stats-actions';
import { getAppointments } from './agenda/actions';
import { getTeachers } from './professores/actions';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import DashboardHeader from '@/components/Dashboard/DashboardHeader';
import LiveAppointments from '@/components/Dashboard/LiveAppointments';

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  // --- Busca de Dados Síncrona (Server Side) ---
  // Obtemos estatísticas gerais, configurações de branding e dados para agendamento
  const statsData = await getDashboardStats();
  const settings = await getSettings();
  const platformName = settings?.platform_name || 'Willversity';

  // Buscar professores e alunos para popular o modal de agendamento rápido
  const [teachersResult, studentsData] = await Promise.all([
    getTeachers(),
    getStudents()
  ]);

  const teachers = teachersResult.success ? teachersResult.data : [];
  const students = studentsData.map(s => ({ id: s.id, full_name: s.full_name }));

  // --- Filtro de Agendamentos de Hoje ---
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tonight = new Date();
  tonight.setHours(23, 59, 59, 999);

  const { data: todayAppointments } = await getAppointments({
    startDate: today.toISOString(),
    endDate: tonight.toISOString()
  });

  // --- Saudação Personalizada ---
  // Buscamos apenas o primeiro nome para uma interface mais amigável
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user?.id)
    .single();

  const firstName = profile?.full_name?.split(' ')[0] || 'Diretor';

  const stats = [
    { 
      label: 'Total de Alunos', 
      value: statsData.totalStudents, 
      change: '+12%', 
      icon: Users, 
      color: 'bg-blue-500',
      description: 'Alunos ativos na plataforma'
    },
    { 
      label: 'Chaves Disponíveis', 
      value: statsData.availableCodes, 
      change: 'Novo', 
      icon: Ticket, 
      color: 'bg-emerald-500',
      description: 'Chaves prontas para matrícula'
    },
    { 
      label: 'Materiais de Apoio', 
      value: statsData.totalResources, 
      change: '+5', 
      icon: Library, 
      color: 'bg-amber-500',
      description: 'Arquivos e links na biblioteca'
    },
    { 
      label: 'XP Global', 
      value: `${(statsData.globalXP / 1000).toFixed(1)}k`, 
      change: '+2.4k', 
      icon: Zap, 
      color: 'bg-indigo-500',
      description: 'Esforço total dos alunos'
    },
  ];

  return (
    <div className="space-y-10 animate-in fade-in duration-1000">
      <AnnouncementBanner />
      {user && <LevelProgress studentId={user.id} />}
      
      {/* Welcome Header (Client Component) */}
      <DashboardHeader 
        firstName={firstName} 
        platformName={platformName} 
        teachers={teachers} 
        students={students} 
      />

      {/* Stats Grid - Bento Style */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div 
            key={index} 
            className="glass-card p-8 group hover:-translate-y-2 transition-all duration-500"
          >
            <div className="flex items-start justify-between mb-6">
              <div className={`p-4 ${stat.color} text-white rounded-2xl shadow-2xl shadow-current/20`}>
                <stat.icon size={24} />
              </div>
              <div className="flex flex-col items-end">
                <span className="text-xs font-black text-emerald-500 bg-emerald-50 px-2 py-1 rounded-lg flex items-center gap-1">
                  <ArrowUpRight size={14} /> {stat.change}
                </span>
              </div>
            </div>
            <div>
              <h3 className="text-slate-400 text-[10px] font-black uppercase tracking-[0.15em] mb-2">{stat.label}</h3>
              <div className="text-4xl font-black text-slate-900">{stat.value}</div>
              <p className="text-xs text-slate-400 mt-4 font-medium leading-relaxed">{stat.description}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Next Classes - Live List */}
        <div className="lg:col-span-2">
          <LiveAppointments initialAppointments={todayAppointments || []} />
        </div>

        {/* Side Feed */}
        <div className="h-full">
          <ActivityFeed />
        </div>
      </div>
    </div>
  );
}

function Sparkles(props) {
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
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
      <path d="M5 3v4" />
      <path d="M19 17v4" />
      <path d="M3 5h4" />
      <path d="M17 19h4" />
    </svg>
  );
}
