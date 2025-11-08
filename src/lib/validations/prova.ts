import { z } from "zod";
import { TipoProva } from "@/generated/prisma/enums";

export const provaSchema = z.object({
  nome: z
    .string()
    .min(3, "O nome da prova deve ter no mínimo 3 caracteres")
    .max(100, "O nome da prova deve ter no máximo 100 caracteres"),
  turmaId: z
    .string()
    .min(1, "A turma é obrigatória"),
  ano_letivo: z
    .number()
    .int("O ano letivo deve ser um número inteiro")
    .min(2000, "O ano letivo deve ser maior ou igual a 2000")
    .max(2100, "O ano letivo deve ser menor ou igual a 2100"),
  peso: z
    .number()
    .min(0, "O peso deve ser maior ou igual a 0")
    .max(100, "O peso deve ser menor ou igual a 100"),
  tipo: z.nativeEnum(TipoProva, {
    error: () => ({ message: "Tipo de prova inválido" }),
  }),
  data_prova: z.date().optional().nullable(),
});

export const createProvaSchema = provaSchema;

export const updateProvaSchema = provaSchema.partial();

export type ProvaInput = z.infer<typeof provaSchema>;
export type CreateProvaInput = z.infer<typeof createProvaSchema>;
export type UpdateProvaInput = z.infer<typeof updateProvaSchema>;
