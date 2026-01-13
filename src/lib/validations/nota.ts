import { z } from "zod";

export const notaSchema = z.object({
  alunoId: z.string().uuid("ID do aluno inválido"),
  valor: z.number().min(0, "Nota mínima é 0").max(10, "Nota máxima é 10"),
});

export const salvarNotasSchema = z.object({
  provaId: z.string().uuid("ID da prova inválido"),
  notas: z.array(notaSchema),
});

export type NotaInput = z.infer<typeof notaSchema>;
export type SalvarNotasInput = z.infer<typeof salvarNotasSchema>;
