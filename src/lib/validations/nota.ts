import { z } from "zod";

// Schema para nota de prova comum
export const notaSchema = z.object({
  alunoId: z.string().uuid("ID do aluno inválido"),
  valor: z.number().min(0, "Nota mínima é 0"),
});

// Schema para nota de simulado (com matéria)
export const notaSimuladoMateriaSchema = z.object({
  simuladoMateriaId: z.string().uuid("ID da matéria do simulado inválido"),
  valor: z.number().min(0, "Nota mínima é 0"),
});

// Schema para notas de aluno em simulado
export const notaAlunoSimuladoSchema = z.object({
  alunoId: z.string().uuid("ID do aluno inválido"),
  notasPorMateria: z.array(notaSimuladoMateriaSchema),
});

// Schema para salvar notas de prova comum
export const salvarNotasSchema = z.object({
  provaId: z.string().uuid("ID da prova inválido"),
  notas: z.array(notaSchema),
});

// Schema para salvar notas de simulado
export const salvarNotasSimuladoSchema = z.object({
  provaId: z.string().uuid("ID da prova inválido"),
  notas: z.array(notaAlunoSimuladoSchema),
});

export type NotaInput = z.infer<typeof notaSchema>;
export type NotaSimuladoMateriaInput = z.infer<typeof notaSimuladoMateriaSchema>;
export type NotaAlunoSimuladoInput = z.infer<typeof notaAlunoSimuladoSchema>;
export type SalvarNotasInput = z.infer<typeof salvarNotasSchema>;
export type SalvarNotasSimuladoInput = z.infer<typeof salvarNotasSimuladoSchema>;
