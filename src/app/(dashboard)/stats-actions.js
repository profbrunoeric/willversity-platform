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
