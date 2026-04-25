'use server';

import { createClient } from '@/lib/supabase/server';

export async function getPedagogicalStages() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('pedagogical_stages')
    .select('*')
    .order('id', { ascending: true });
    
  if (error) {
    console.error('Error fetching stages:', error);
    return [];
  }
  return data;
}

export async function updateStage(id, name, description) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('pedagogical_stages')
    .update({ name, description, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select();

  if (error) throw error;
  return data[0];
}
