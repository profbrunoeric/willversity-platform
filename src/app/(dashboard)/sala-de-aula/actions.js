'use server';

import { createClient } from '@/lib/supabase/server';

/**
 * Busca todas as lições cadastradas, incluindo os dados do professor vinculado.
 * Ordenadas pelo índice definido no Command Center.
 */
export async function getLessons() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('lessons')
    .select('*, professores(*)')
    .order('order_index', { ascending: true });
    
  if (error) {
    console.error('Error fetching lessons:', error);
    return [];
  }
  return data;
}

/**
 * Cria ou atualiza uma lição.
 * Utiliza o ID do professor para o relacionamento 'belongs to'.
 */
export async function saveLesson(lesson) {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('lessons')
    .upsert({
      id: lesson.id || undefined,
      title: lesson.title,
      description: lesson.description,
      video_url: lesson.video_url,
      teacher_id: lesson.teacher_id,
      order_index: lesson.order_index || 0,
      updated_at: new Date().toISOString(),
    })
    .select();

  if (error) throw error;
  return data[0];
}

export async function deleteLesson(id) {
  const supabase = createClient();
  const { error } = await supabase
    .from('lessons')
    .delete()
    .eq('id', id);
    
  if (error) throw error;
}

// --- AÇÕES PARA MATERIAIS DE APOIO ---

/**
 * Busca materiais (PDFs, links, áudios) vinculados a uma aula específica.
 */
export async function getLessonResources(lessonId) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('lesson_resources')
    .select('*')
    .eq('lesson_id', lessonId);
    
  if (error) {
    console.error('Error fetching resources:', error);
    return [];
  }
  return data;
}

export async function addResource(resource) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('lesson_resources')
    .insert(resource)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteResource(id) {
  const supabase = createClient();
  const { error } = await supabase
    .from('lesson_resources')
    .delete()
    .eq('id', id);
    
  if (error) throw error;
}

/**
 * Registra que o aluno assistiu/concluiu a aula.
 * Nota: A premiação de XP ocorre via TRIGGER no banco de dados (lesson_completions).
 */
export async function completeLesson(lessonId) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) throw new Error('Unauthorized');

  const { error } = await supabase
    .from('lesson_completions')
    .insert({
      student_id: user.id,
      lesson_id: lessonId
    });

  if (error) {
    // Código 23505 indica que o aluno já concluiu esta aula antes (violão de chave única)
    if (error.code === '23505') return { success: true, alreadyDone: true }; 
    throw error;
  }

  return { success: true };
}

/**
 * Verifica se a aula atual já foi marcada como concluída pelo usuário logado.
 */
export async function getCompletionStatus(lessonId) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return false;

  const { data, error } = await supabase
    .from('lesson_completions')
    .select('id')
    .eq('student_id', user.id)
    .eq('lesson_id', lessonId)
    .single();

  // Erro PGRST116 significa "nenhum resultado encontrado", o que é esperado se não concluiu.
  if (error && error.code !== 'PGRST116') { 
    console.error('Error checking completion status:', error);
    return false;
  }

  return !!data;
}

