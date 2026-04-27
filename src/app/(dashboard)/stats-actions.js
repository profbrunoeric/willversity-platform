'use server';

import { createClient } from '@/lib/supabase/server';

export async function getDashboardStats() {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();

  // 1. Total de Alunos (Exclui o administrador logado)
  const { count: studentsCount } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .neq('id', user?.id);

  // 2. Chaves Disponíveis (não usadas)
  const { count: codesCount } = await supabase
    .from('registration_codes')
    .select('*', { count: 'exact', head: true })
    .is('used_at', null);

  // 3. Materiais de Apoio
  const { count: resourcesCount } = await supabase
    .from('lesson_resources')
    .select('*', { count: 'exact', head: true });

  // 4. XP Global Acumulado
  const { data: xpSum } = await supabase
    .from('xp_transactions')
    .select('amount');
  
  const totalXP = xpSum?.reduce((acc, curr) => acc + curr.amount, 0) || 0;

  return {
    totalStudents: studentsCount || 0,
    availableCodes: codesCount || 0,
    totalResources: resourcesCount || 0,
    globalXP: totalXP
  };
}

/**
 * Gera o relatório financeiro consolidado (Inflow, Outflow, Projeções)
 */
export async function getFinancialReport() {
  const supabase = createClient();
  
  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  // 1. Entradas Reais (Mês atual)
  const { data: payments } = await supabase
    .from('payment_history')
    .select('amount')
    .gte('payment_date', firstDayOfMonth);
  
  const realInflow = payments?.reduce((acc, curr) => acc + curr.amount, 0) || 0;

  // 2. Saídas Reais (Mês atual)
  const { data: expenses } = await supabase
    .from('expenses')
    .select('amount')
    .eq('status', 'paid')
    .gte('created_at', firstDayOfMonth);
    
  const realOutflow = expenses?.reduce((acc, curr) => acc + curr.amount, 0) || 0;

  // 3. Projeção de Futuro (Soma de mensalidades de todos os alunos ativos)
  const { data: profiles } = await supabase
    .from('profiles')
    .select('monthly_fee')
    .eq('role', 'student')
    .or('status.eq.active,status.is.null');

  const projectedRevenue = profiles?.reduce((acc, curr) => acc + (curr.monthly_fee || 0), 0) || 0;

  return {
    inflow: realInflow,
    outflow: realOutflow,
    balance: realInflow - realOutflow,
    projection: projectedRevenue
  };
}

/**
 * Busca alunos que não tiveram aulas registradas nos últimos 15 dias
 */
export async function getInactiveStudents() {
  const supabase = createClient();
  
  const fifteenDaysAgo = new Date();
  fifteenDaysAgo.setDate(fifteenDaysAgo.getDate() - 15);

  // 1. Buscar todas as evoluções dos últimos 15 dias
  const { data: recentEvolutions } = await supabase
    .from('lesson_evolutions')
    .select('student_id')
    .gte('class_date', fifteenDaysAgo.toISOString());

  const activeStudentIds = new Set(recentEvolutions?.map(e => e.student_id) || []);

  // 2. Buscar todos os alunos
  const { data: allStudents } = await supabase
    .from('profiles')
    .select('id, full_name, level, last_sign_in_at')
    .eq('role', 'student');

  // 3. Filtrar os inativos
  const inactiveStudents = allStudents?.filter(s => !activeStudentIds.has(s.id)) || [];

  return inactiveStudents.slice(0, 5); // Mostrar apenas os top 5 para o card
}
