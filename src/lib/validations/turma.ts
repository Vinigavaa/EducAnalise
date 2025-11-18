import { z } from "zod";

export const turmaSchema = z.object({
  nome: z
    .string()
    .min(3, "O nome da turma deve ter no mínimo 3 caracteres")
    .max(100, "O nome da turma deve ter no máximo 100 caracteres"),
  ano_letivo: z
    .number()
    .int("O ano letivo deve ser um número inteiro")
    .min(2000, "O ano letivo deve ser maior ou igual a 2000")
    .max(2100, "O ano letivo deve ser menor ou igual a 2100"),
});

export const createTurmaSchema = turmaSchema;

export const updateTurmaSchema = turmaSchema.partial();

//define um tipo typescript estatico para o schema "z.infer"
export type TurmaInput = z.infer<typeof turmaSchema>;
export type CreateTurmaInput = z.infer<typeof createTurmaSchema>;
export type UpdateTurmaInput = z.infer<typeof updateTurmaSchema>;
