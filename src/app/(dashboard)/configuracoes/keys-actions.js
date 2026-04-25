'use server';

import { createClient } from '@/lib/supabase/server';

export async function getRegistrationCodes() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('registration_codes')
    .select('*, used_by_profile:profiles!registration_codes_used_by_fkey(full_name)')
    .order('created_at', { ascending: false });
    
  if (error) {
    console.error('Error fetching codes:', error);
    return [];
  }
  return data;
}

export async function generateCode(customCode = null, role = 'student') {
  const supabase = await createClient();
  
  // Prefixo baseado no cargo
  const prefix = role === 'teacher' ? 'PROF' : 'WILL';
  
  // Se não houver código customizado, gera um aleatório
  const code = customCode || `${prefix}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
  
  const { data: userData } = await supabase.auth.getUser();
  if (!userData?.user) throw new Error('Unauthorized');

  const { data, error } = await supabase
    .from('registration_codes')
    .insert({
      code: code,
      target_role: role,
      created_by: userData.user.id,
      is_active: true
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteCode(id) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('registration_codes')
    .delete()
    .eq('id', id);
    
  if (error) throw error;
}
