import type { AgendaInput } from "../lib/validations/agenda.schema";
import type { Teacher } from "./teacher";

export interface Appointment extends AgendaInput {
  id: string;
  created_at: string;
  updated_at: string;
  // Joins
  professores?: Teacher;
  profiles?: {
    id: string;
    full_name: string;
    avatar_url?: string;
  };
}

export type AppointmentType = 'aula' | 'mentoria' | 'reposicao' | 'outro';
export type AppointmentStatus = 'pendente' | 'confirmado' | 'cancelado' | 'concluido' | 'falta';
