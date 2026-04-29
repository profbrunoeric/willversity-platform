'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

/**
 * Salva uma nova evolução pedagógica para o aluno
 */
export async function saveEvolution(formData) {
  const supabase = createClient();
  
  // [SEGURANÇA] Obter o ID do professor logado direto da sessão do servidor
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    return { error: 'Você precisa estar logado para registrar evoluções.' };
  }

  const studentId = formData.get('studentId');
  const classDate = formData.get('classDate');
  
  const evolutionData = {
    student_id: studentId,
    teacher_id: user.id, // Injetado via servidor
    class_date: classDate || new Date().toISOString(),
    warm_up: formData.get('warm_up'),
    comprehensible_input: formData.get('comprehensible_input'),
    guided_practice: formData.get('guided_practice'),
    meaningful_output: formData.get('meaningful_output'),
    consolidation: formData.get('consolidation'),
  };

  const { error } = await supabase
    .from('lesson_evolutions')
    .insert([evolutionData]);

  if (error) {
    console.error('Erro ao salvar evolução:', error);
    return { error: 'Não foi possível salvar a evolução no banco de dados.' };
  }

  revalidatePath(`/alunos/${studentId}`);
  return { success: true };
}

/**
 * Atualiza dados básicos do aluno (Telefone, Nível, Nome)
 */
export async function updateStudentProfile(studentId, data) {
  const supabase = createClient();

  // [SEGURANÇA] Obter usuário logado
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return { error: 'Sessão expirada. Faça login novamente.' };

  // Log para depuração no terminal
  console.log('--- DEBUG UPDATE ---');
  console.log('Usuário Ativo:', user.id);
  console.log('Editando Aluno:', studentId);

  // Verificar o cargo do usuário
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  console.log('Cargo detectado:', profile?.role);

  // Por enquanto, vamos permitir a edição se for admin ou o próprio usuário
  // Se houver erro de RLS, o Supabase vai avisar no catch abaixo
  const { error } = await supabase
    .from('profiles')
    .update({
      full_name: data.full_name,
      email: data.email,
      level: data.level,
      phone: data.phone
    })
    .eq('id', studentId);

  if (error) {
    console.error('ERRO SUPABASE:', error);
    return { error: `Erro no Supabase: ${error.message}` };
  }

  revalidatePath(`/alunos/${studentId}`);
  revalidatePath('/alunos');
  return { success: true };
}

/**
 * Busca a lista de alunos com suporte a filtros e busca
 */
export async function getStudents(filters = {}) {
  const { query, level, status } = filters;
  const supabase = createClient();
  
  console.log('--- BUSCANDO ALUNOS COM FILTROS ---', filters);

  const { data: { user } } = await supabase.auth.getUser();

  let dbQuery = supabase
    .from('profiles')
    .select('*')
    .neq('id', user?.id); // Exclui você (o administrador) da listagem de alunos

  // Filtro de Status
  if (status === 'archived') {
    dbQuery = dbQuery.eq('status', 'archived');
  } else {
    // Se for 'active' ou vazio, mostra ativos e nulos
    dbQuery = dbQuery.or('status.eq.active,status.is.null');
  }

  // Filtro de Busca
  if (query) {
    dbQuery = dbQuery.or(`full_name.ilike.%${query}%,email.ilike.%${query}%`);
  }

  // Filtro de Nível
  if (level) {
    dbQuery = dbQuery.eq('level', level);
  }

  const { data, error } = await dbQuery.order('full_name', { ascending: true });

  if (error) {
    console.error('Erro ao buscar alunos:', error);
    return [];
  }
  
  console.log('Alunos encontrados:', data?.length);
  return data;
}

/**
 * Arquiva um aluno (Soft Delete)
 */
export async function archiveStudent(studentId) {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Não autorizado.' };

  const { error } = await supabase
    .from('profiles')
    .update({ status: 'archived' })
    .eq('id', studentId);

  if (error) {
    console.error('Erro ao arquivar:', error);
    return { error: 'Falha ao arquivar aluno.' };
  }

  revalidatePath('/alunos');
  return { success: true };
}

/**
 * Busca estatísticas rápidas dos alunos
 */
export async function getStudentStats() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  const { count: totalActive } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .neq('id', user?.id)
    .or('status.eq.active,status.is.null');

  const { data: levelDist } = await supabase
    .from('profiles')
    .select('level')
    .neq('id', user?.id)
    .or('status.eq.active,status.is.null');

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  
  const { count: recentEvolutions } = await supabase
    .from('lesson_evolutions')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', sevenDaysAgo.toISOString());

  return {
    totalActive: totalActive || 0,
    recentEvolutions: recentEvolutions || 0,
    levelDist: levelDist || []
  };
}

/**
 * Gera um novo código de matrícula para um aluno ou professor
 */
export async function generateRegistrationCode(role = 'student') {
  const supabase = createClient();
  
  // [SEGURANÇA] Verificar se o usuário logado é um Admin
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return { error: 'Não autorizado.' };

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') {
    return { error: 'Apenas administradores podem gerar códigos de matrícula.' };
  }

  // Gerar código aleatório (Ex: WILL-XXXX ou PROF-XXXX)
  const prefix = role === 'teacher' ? 'PROF' : 'WILL';
  const randomStr = Math.random().toString(36).substring(2, 6).toUpperCase();
  const code = `${prefix}-${randomStr}`;

  const { error } = await supabase
    .from('registration_codes')
    .insert([{
      code,
      target_role: role,
      created_by: user.id,
      is_active: true
    }]);

  if (error) {
    console.error('Erro ao gerar código:', error);
    return { error: 'Erro ao salvar código no banco.' };
  }

  revalidatePath('/configuracoes');
  return { success: true, code };
}

/**
 * Busca rápida de alunos para o Command Palette
 */
export async function quickSearchStudents(query) {
  if (!query || query.length < 2) return [];
  
  const supabase = createClient();
  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, email, role')
    .eq('role', 'student')
    .ilike('full_name', `%${query}%`)
    .limit(5);

  if (error) {
    console.error('Erro na busca rápida:', error);
    return [];
  }

  return data;
}

/**
 * Busca o ranking dos Top 10 alunos por XP
 */
export async function getLeaderboard() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, xp, level')
    .eq('role', 'student')
    .order('xp', { ascending: false })
    .limit(10);

  if (error) {
    console.error('Erro ao buscar ranking:', error);
    return [];
  }

  return data;
}

/**
 * Atualiza o status financeiro e o dia de vencimento do aluno
 */
export async function updateFinancialStatus(studentId, data) {
  const supabase = createClient();
  const { error } = await supabase
    .from('profiles')
    .update({ 
      payment_status: data.status,
      due_day: data.dueDay,
      monthly_fee: data.monthlyFee 
    })
    .eq('id', studentId);

  if (error) {
    console.error('Erro ao atualizar financeiro:', error);
    return { success: false, error: error.message };
  }

  revalidatePath(`/alunos/${studentId}`);
  revalidatePath('/financeiro');
  return { success: true };
}

/**
 * Registra um novo pagamento no histórico
 */
export async function registerPayment(paymentData) {
  const supabase = createClient();
  const { error } = await supabase
    .from('payment_history')
    .insert([{
      student_id: paymentData.studentId,
      amount: paymentData.amount,
      reference_month: paymentData.referenceMonth,
      payment_method: paymentData.paymentMethod,
      payment_date: new Date().toISOString()
    }]);

  if (error) {
    console.error('Erro ao registrar pagamento:', error);
    return { success: false, error: error.message };
  }

  // Ao registrar pagamento, opcionalmente marcamos como "Pago"
  await supabase
    .from('profiles')
    .update({ payment_status: 'paid' })
    .eq('id', paymentData.studentId);

  revalidatePath('/financeiro');
  revalidatePath(`/alunos/${paymentData.studentId}`);
  return { success: true };
}

/**
 * Registra presença/falta no diário de classe e atualiza status da agenda
 */
export async function recordAttendance(studentId, status, appointmentId = null) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // 1. Registrar a evolução pedagógica (histórico)
  const { error: evolutionError } = await supabase
    .from('lesson_evolutions')
    .insert([{
      student_id: studentId,
      teacher_id: user.id,
      class_date: new Date().toISOString(),
      attendance_status: status,
      consolidation: status === 'absent' ? 'ALUNO AUSENTE (FALTA)' : 'Presença confirmada no diário.'
    }]);

  if (evolutionError) {
    console.error('Erro ao registrar evolução:', evolutionError);
  }

  // 2. Se tiver um appointmentId, atualiza o status na agenda
  if (appointmentId) {
    const { error: agendaError } = await supabase
      .from('agenda')
      .update({ status: status === 'present' ? 'completed' : 'missed' })
      .eq('id', appointmentId);
      
    if (agendaError) console.error('Erro ao atualizar agenda:', agendaError);
  }

  revalidatePath(`/alunos/${studentId}`);
  revalidatePath('/diario');
  revalidatePath('/agenda');
  return { success: true };
}

/**
 * Atualiza uma evolução pedagógica existente
 */
export async function updateEvolution(evolutionId, studentId, data) {
  const supabase = createClient();
  
  const { error } = await supabase
    .from('lesson_evolutions')
    .update({
      warm_up: data.warm_up,
      comprehensible_input: data.comprehensible_input,
      guided_practice: data.guided_practice,
      meaningful_output: data.meaningful_output,
      consolidation: data.consolidation,
      class_date: data.class_date
    })
    .eq('id', evolutionId);

  if (error) {
    console.error('Erro ao atualizar evolução:', error);
    return { error: 'Não foi possível atualizar a evolução.' };
  }

  revalidatePath(`/alunos/${studentId}`);
  return { success: true };
}

/**
 * Exclui uma evolução pedagógica
 */
export async function deleteEvolution(evolutionId, studentId) {
  const supabase = createClient();
  
  const { error } = await supabase
    .from('lesson_evolutions')
    .delete()
    .eq('id', evolutionId);

  if (error) {
    console.error('Erro ao excluir evolução:', error);
    return { error: 'Não foi possível excluir a evolução.' };
  }

  revalidatePath(`/alunos/${studentId}`);
  return { success: true };
}
