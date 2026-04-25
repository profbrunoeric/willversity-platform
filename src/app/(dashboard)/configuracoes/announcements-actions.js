'use server';

import { createClient } from '@/lib/supabase/server';

export async function getAnnouncements() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('announcements')
    .select('*')
    .order('created_at', { ascending: false });
    
  if (error) {
    console.error('Error fetching announcements:', error);
    return [];
  }
  return data;
}

export async function createAnnouncement(announcement) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('announcements')
    .insert(announcement)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function toggleAnnouncement(id, isActive) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('announcements')
    .update({ is_active: isActive })
    .eq('id', id);
    
  if (error) throw error;
}

export async function deleteAnnouncement(id) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('announcements')
    .delete()
    .eq('id', id);
    
  if (error) throw error;
}
