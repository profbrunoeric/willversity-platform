'use server'

import { createClient } from '@/lib/supabase/server'
import { teacherSchema } from '@/lib/validations/teacher.schema'
import type { TeacherInput } from '@/lib/validations/teacher.schema'
import { revalidatePath } from 'next/cache'
import type { Teacher } from '@/types/teacher'

export async function getTeachers() {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('professores')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching teachers:', error)
    return { success: false, error: error.message }
  }

  return { success: true, data: data as Teacher[] }
}

export async function createTeacher(formData: TeacherInput) {
  const supabase = createClient()
  
  // Validação rigorosa com Zod no lado do servidor
  const validatedFields = teacherSchema.safeParse(formData)

  if (!validatedFields.success) {
    return { 
      success: false, 
      error: 'Dados inválidos', 
      details: validatedFields.error.flatten().fieldErrors 
    }
  }

  const { data, error } = await supabase
    .from('professores')
    .insert([validatedFields.data])
    .select()

  if (error) {
    console.error('Error creating teacher:', error)
    return { success: false, error: error.message }
  }

  revalidatePath('/professores')
  return { success: true, data }
}

export async function updateTeacher(id: string, formData: TeacherInput) {
  const supabase = createClient()
  
  const validatedFields = teacherSchema.safeParse(formData)

  if (!validatedFields.success) {
    return { 
      success: false, 
      error: 'Dados inválidos', 
      details: validatedFields.error.flatten().fieldErrors 
    }
  }

  const { data, error } = await supabase
    .from('professores')
    .update(validatedFields.data)
    .eq('id', id)
    .select()

  if (error) {
    console.error('Error updating teacher:', error)
    return { success: false, error: error.message }
  }

  revalidatePath('/professores')
  return { success: true, data }
}

export async function deleteTeacher(id: string) {
  const supabase = createClient()
  
  const { error } = await supabase
    .from('professores')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting teacher:', error)
    return { success: false, error: error.message }
  }

  revalidatePath('/professores')
  return { success: true }
}
