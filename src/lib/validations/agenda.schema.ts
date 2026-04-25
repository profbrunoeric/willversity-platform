import { z } from "zod";

export const appointmentTypeSchema = z.enum(['aula', 'mentoria', 'reposicao', 'outro']);
export const appointmentStatusSchema = z.enum(['pendente', 'confirmado', 'cancelado', 'concluido', 'falta']);

export const agendaSchema = z.object({
  teacher_id: z.string().uuid("Professor inválido"),
  student_id: z.string().uuid("Aluno inválido").optional().nullable(),
  start_time: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Data de início inválida",
  }),
  end_time: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Data de término inválida",
  }),
  title: z.string().min(3, "O título deve ter pelo menos 3 caracteres"),
  description: z.string().optional(),
  tipo: appointmentTypeSchema,
  status: appointmentStatusSchema,
  metadata: z.record(z.string(), z.any()).optional(),
}).refine((data) => {
  return new Date(data.start_time) < new Date(data.end_time);
}, {
  message: "A data de término deve ser após a data de início",
  path: ["end_time"],
});

export type AgendaInput = z.infer<typeof agendaSchema>;
