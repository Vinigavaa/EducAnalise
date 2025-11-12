import z from "zod";

export const materiaSchema = z.object({
    nome: z
     .string()
     .min(3, "O nome da Materia deve ter no mínimo 3 caracteres")
     .max(100, "O nome da Materia deve ter no máximo 100 caracteres"),
})

export const createMateriaSchema = materiaSchema;

export const updateMateriaSchema = materiaSchema.partial();

export type MateriaInput = z.infer<typeof materiaSchema>;
export type CreateMateriaInput = z.infer<typeof createMateriaSchema>;
export type UpdateMateriaInput = z.infer<typeof updateMateriaSchema>;