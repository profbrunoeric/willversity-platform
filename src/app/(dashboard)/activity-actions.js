'use server';

import { createClient } from '@/lib/supabase/server';

export async function getGlobalActivity() {
  const supabase = createClient();

  // 1. Buscar últimos ganhos de XP
  const { data: xpData, error: xpError } = await supabase
    .from('xp_transactions')
    .select(`
      id,
      amount,
      category,
      reason,
      created_at,
      profiles:student_id (full_name)
    `)
    .order('created_at', { ascending: false })
    .limit(10);

  // 2. Buscar últimos avisos
  const { data: annData, error: annError } = await supabase
    .from('announcements')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(3);

  // 3. Buscar últimas evoluções (O RLS garantirá que alunos recebam vazio/filtrado)
  const { data: evoData, error: evoError } = await supabase
    .from('lesson_evolutions')
    .select(`
      id,
      created_at,
      profiles:student_id (full_name)
    `)
    .order('created_at', { ascending: false })
    .limit(5);

  if (xpError || annError) {
    console.error('Error fetching activity:', xpError || annError);
    return [];
  }

  // 4. Formatar e Mesclar
  const activities = [
    ...(xpData || []).map(item => ({
      id: item.id,
      type: 'xp',
      user: item.profiles?.full_name || 'Usuário',
      amount: item.amount,
      category: item.category,
      content: item.reason,
      date: item.created_at
    })),
    ...(annData || []).map(item => ({
      id: item.id,
      type: 'announcement',
      user: 'Willversity',
      amount: null,
      category: item.type,
      content: item.title,
      date: item.created_at
    })),
    ...(evoData || []).map(item => ({
      id: item.id,
      type: 'lesson',
      user: item.profiles?.full_name || 'Aluno',
      content: 'Resumo Pedagógico Registrado',
      date: item.created_at
    }))
  ].sort((a, b) => new Date(b.date) - new Date(a.date));

  return activities;
}
