'use server'

import { createClient } from '@/lib/supabase/server'
import { agendaSchema } from '@/lib/validations/agenda.schema'
import type { AgendaInput } from '@/lib/validations/agenda.schema'
import { revalidatePath } from 'next/cache'
import type { Appointment } from '@/types/agenda'

export async function getAppointments(filters: { 
  teacherId?: string, 
  studentId?: string,
  startDate?: string,
  endDate?: string 
} = {}) {
  const supabase = createClient()
  
  let query = supabase
    .from('agenda')
    .select(`
      *,
      professores(*),
      profiles:student_id(id, full_name)
    `)
    .order('start_time', { ascending: true })

  if (filters.teacherId) query = query.eq('teacher_id', filters.teacherId)
  if (filters.studentId) query = query.eq('student_id', filters.studentId)
  if (filters.startDate) query = query.gte('start_time', filters.startDate)
  if (filters.endDate) query = query.lte('end_time', filters.endDate)

  const { data, error } = await query

  if (error) {
    console.error('Error fetching appointments:', error)
    return { success: false, error: error.message }
  }

  return { success: true, data: data as Appointment[] }
}

export async function createAppointment(formData: AgendaInput) {
  const supabase = createClient()
  
  const validatedFields = agendaSchema.safeParse(formData)

  if (!validatedFields.success) {
    return { 
      success: false, 
      error: 'Dados inválidos', 
      details: validatedFields.error.flatten().fieldErrors 
    }
  }

  const { data, error } = await supabase
    .from('agenda')
    .insert([validatedFields.data])
    .select()

  if (error) {
    console.error('Error creating appointment:', error)
    return { success: false, error: error.message }
  }

  revalidatePath('/agenda')
  return { success: true, data }
}

export async function updateAppointmentStatus(id: string, status: string) {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('agenda')
    .update({ status })
    .eq('id', id)
    .select()

  if (error) {
    console.error('Error updating appointment status:', error)
    return { success: false, error: error.message }
  }

  revalidatePath('/agenda')
  return { success: true, data }
}

export async function deleteAppointment(id: string) {
  const supabase = createClient()
  
  const { error } = await supabase
    .from('agenda')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting appointment:', error)
    return { success: false, error: error.message }
  }

  revalidatePath('/agenda')
  return { success: true }
}
