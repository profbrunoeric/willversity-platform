'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function getXPCategories() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('xp_categories')
    .select('*')
    .order('label', { ascending: true });
    
  if (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
  return data;
}

export async function saveXPCategory(category) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('xp_categories')
    .upsert({ 
      ...category, 
      id: category.id || category.label.toLowerCase().replace(/\s+/g, '-'),
      updated_at: new Date().toISOString() 
    })
    .select()
    .single();

  if (error) throw error;
  revalidatePath('/configuracoes');
  return data;
}

export async function deleteXPCategory(id) {
  const supabase = createClient();
  const { error } = await supabase
    .from('xp_categories')
    .delete()
    .eq('id', id);
    
  if (error) throw error;
  revalidatePath('/configuracoes');
}
