import z from "zod";

export const materiaSchema = z.object({
    nome: z
     .string()
     .min(3, "O nome da prova deve ter no mínimo 3 caracteres")
     .max(100, "O nome da prova deve ter no máximo 100 caracteres"),
})

export const createMateriaSchema = materiaSchema;

export const updateMateriaSchema = materiaSchema.partial();

export type ProvaInput = z.infer<typeof materiaSchema>;
export type CreateProvaInput = z.infer<typeof createMateriaSchema>;
export type UpdateProvaInput = z.infer<typeof updateMateriaSchema>;