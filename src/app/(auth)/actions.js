'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

/**
 * Ação para Login com E-mail e Senha
 */
export async function signIn(formData) {
  const supabase = createClient();
  const email = formData.get('email');
  const password = formData.get('password');

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  redirect('/');
}

/**
 * Ação para Login com Google
 */
export async function signInWithGoogle() {
  const supabase = createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback`,
    },
  });

  if (error) {
    return { error: error.message };
  }

  if (data.url) {
    redirect(data.url);
  }
}

/**
 * Ação para Registro de Aluno com Código Obrigatório
 */
export async function signUp(formData) {
  const supabase = createClient();
  const email = formData.get('email');
  const password = formData.get('password');
  const fullName = formData.get('fullName');
  const studentCode = formData.get('studentCode');

  // 1. Criar o usuário no Supabase Auth primeiro
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      }
    }
  });

  if (authError) {
    return { error: authError.message };
  }

  if (authData?.user) {
    // 2. Usar a função RPC para validar código e ativar perfil em uma única operação segura
    const { data: success, error: rpcError } = await supabase.rpc('redeem_student_code', {
      target_code: studentCode,
      target_user_id: authData.user.id
    });

    if (rpcError || !success) {
      console.error('Erro na ativação via RPC:', rpcError);
      return { error: 'Código de aluno inválido ou já utilizado. Sua conta foi criada, mas precisa ser ativada.' };
    }
  }

  redirect('/');
}

/**
 * Ação para Validar Código no Onboarding (Login Social)
 */
export async function redeemCode(formData) {
  const supabase = createClient();
  const studentCode = formData.get('studentCode');
  const userId = formData.get('userId');

  console.log('--- DEBUG REDEEM CODE ---');
  console.log('Iniciando resgate para o código:', studentCode);
  console.log('ID do usuário:', userId);

  // Chamada da função segura no banco
  const { data: success, error: rpcError } = await supabase.rpc('redeem_student_code', {
    target_code: studentCode,
    target_user_id: userId
  });

  console.log('Sucesso do RPC:', success);
  if (rpcError) {
    console.error('Erro DETALHADO do RPC:', rpcError);
  }

  redirect('/');
}

/**
 * Logout
 */
export async function signOut() {
  const supabase = createClient();
  await supabase.auth.signOut();
  redirect('/login');
}
