import { z } from "zod";

export const teacherSchema = z.object({
  nome_completo: z.string().min(3, "O nome deve ter pelo menos 3 caracteres"),
  email: z.string().email("E-mail inválido"),
  telefone: z.string().min(10, "Telefone inválido").optional().or(z.literal("")),
  data_nascimento: z.string().optional().or(z.literal("")),
  especialidade: z.string().min(2, "Especifique uma especialidade"),
  bio: z.string().max(500, "A bio deve ter no máximo 500 caracteres").optional(),
  avatar_url: z.string().url("URL de avatar inválida").optional().or(z.literal("")),
  status: z.enum(["ativo", "inativo", "pendente"]),
  metadata: z.record(z.string(), z.any()),
});

export type TeacherInput = z.infer<typeof teacherSchema>;
