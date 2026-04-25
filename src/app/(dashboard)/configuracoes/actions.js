'use server';

import { createClient } from '@/lib/supabase/server';

export async function getSettings() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('settings')
    .select('*')
    .eq('id', 1)
    .single();
    
  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching settings:', error);
  }
  return data;
}

export async function updateSettings(newSettings) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('settings')
    .upsert({
      id: 1,
      ...newSettings,
      updated_at: new Date().toISOString(),
    })
    .select();

  if (error) throw error;
  return data[0];
}
