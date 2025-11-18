"use client"

import { MateriaInput, materiaSchema } from "@/lib/validations/materia";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Form, useForm } from "react-hook-form";
import { FormControl, FormField, FormItem, FormLabel } from "../ui/form";
import { Input } from "../ui/input";
import { Button } from "../ui/button";

interface MateriaFormProps {
    materia?: {
        id: string,
        nome: string
    }
    OnSucess?: () => void;
};

export function MateriaForm({ materia, OnSucess }: MateriaFormProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    //o estado error pode ter dois tipos, string se houver erro e null se não houver, sempre inicia null
    const [error, setError] = useState<string | null>(null)

    const isEditing = !!materia;

    const form = useForm<MateriaInput>({
        resolver: zodResolver(materiaSchema),
        defaultValues: {
            nome: materia?.nome || "",
        }
    });

    const onSubmit = async (data: MateriaInput) => {
        setIsLoading(true);
        setError(null);

        try {
            const url = isEditing ? `/api/materias/${materia.id}` : "api/materias";
            const method = isEditing ? "PUT" : "POST";

            const response = await fetch(url, { //fetch é um método do JavaScript usado para fazer requisições HTTP. 
                method,
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data), //transforma objeto num json
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || "Erro ao salvar turma")
            }

            if (OnSucess) {
                OnSucess();
            } else {
                router.push("/materias");
                router.refresh();
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "Erro ao salvar turma");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {error && (
                    <div className="rounded-md bg-red-50 p-4 text-sm text-red-800">
                        {error}
                    </div>
                )}

                <FormField
                    control={form.control}
                    name="nome"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Nome da Matéria</FormLabel>
                            <FormControl>
                                <Input
                                    placeholder="Ex: Matemática..."
                                    {...field}
                                    disabled={isLoading}
                                />
                            </FormControl>
                        </FormItem>
                    )}>
                </FormField>
                <div className="flex justify-end gap-3">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.back()}
                        disabled={isLoading}
                    >
                        Cancelar
                    </Button>
                    <Button type="submit" disabled={isLoading}>
                        {isLoading
                            ? "Salvando..."
                            : isEditing
                                ? "Atualizar Turma"
                                : "Criar Turma"}
                    </Button>
                </div>
            </form>
        </Form>
    )
};