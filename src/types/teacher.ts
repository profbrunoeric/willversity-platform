import type { TeacherInput } from "../lib/validations/teacher.schema";

export interface Teacher extends TeacherInput {
  id: string;
  created_at: string;
  updated_at: string;
}

export type TeacherStatus = "ativo" | "inativo" | "pendente";
