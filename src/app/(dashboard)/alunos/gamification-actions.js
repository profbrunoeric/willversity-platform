'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function addXP(studentId, amount, category, reason) {
  const supabase = await createClient();
  
  const { data: userData } = await supabase.auth.getUser();
  if (!userData?.user) throw new Error('Unauthorized');

  const { data, error } = await supabase
    .from('xp_transactions')
    .insert({
      student_id: studentId,
      amount: parseInt(amount),
      category,
      reason,
      created_by: userData.user.id
    })
    .select()
    .single();

  if (error) throw error;
  
  revalidatePath('/alunos');
  revalidatePath('/');
  return data;
}

export async function getStudentXPDetails(studentId) {
  const supabase = await createClient();
  
  const { data: totalXP } = await supabase.rpc('get_student_total_xp', { target_user_id: studentId });
  
  const { data: history, error } = await supabase
    .from('xp_transactions')
    .select('*')
    .eq('student_id', studentId)
    .order('created_at', { ascending: false });
    
  if (error) return { total: 0, history: [] };
  
  return {
    total: totalXP || 0,
    history: history || []
  };
}

export async function getXPStatsByCategory(studentId) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('xp_transactions')
    .select('category, amount')
    .eq('student_id', studentId);
    
  if (error) return {};

  const stats = data.reduce((acc, curr) => {
    acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
    return acc;
  }, {});

  return stats;
}
