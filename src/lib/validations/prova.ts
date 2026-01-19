import { z } from "zod";
import { TipoProva } from "@/generated/prisma/enums";

// Schema para matéria do simulado (com peso)
export const simuladoMateriaSchema = z.object({
  materiaId: z.string().uuid("ID da matéria inválido"),
  peso: z
    .number()
    .min(0.1, "O peso deve ser maior que 0")
    .max(100, "O peso deve ser menor ou igual a 100"),
});

// Schema base para prova comum
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
  // Matérias do simulado (obrigatório quando tipo = SIMULADO)
  materias: z.array(simuladoMateriaSchema).optional(),
});

// Schema com validação condicional para simulado
export const createProvaSchema = provaSchema.refine(
  (data) => {
    if (data.tipo === TipoProva.SIMULADO) {
      return data.materias && data.materias.length > 0;
    }
    return true;
  },
  {
    message: "Simulados devem ter pelo menos uma matéria cadastrada",
    path: ["materias"],
  }
);

export const updateProvaSchema = provaSchema.partial();

export type SimuladoMateriaInput = z.infer<typeof simuladoMateriaSchema>;
export type ProvaInput = z.infer<typeof provaSchema>;
export type CreateProvaInput = z.infer<typeof createProvaSchema>;
export type UpdateProvaInput = z.infer<typeof updateProvaSchema>;
