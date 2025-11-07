import { z } from "zod";

export const alunoSchema = z.object({
  nome: z
    .string()
    .min(3, "O nome do aluno deve ter no mínimo 3 caracteres")
    .max(200, "O nome do aluno deve ter no máximo 200 caracteres"),
  turmaId: z
    .string()
    .uuid("ID da turma inválido"),
});

export const createAlunoSchema = alunoSchema;

export const updateAlunoSchema = alunoSchema.omit({ turmaId: true }).partial();

export type AlunoInput = z.infer<typeof alunoSchema>;
export type CreateAlunoInput = z.infer<typeof createAlunoSchema>;
export type UpdateAlunoInput = z.infer<typeof updateAlunoSchema>;
