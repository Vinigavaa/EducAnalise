"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { alunoSchema, type AlunoInput } from "@/lib/validations/aluno";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

interface AlunoFormProps {
  turmaId: string;
  aluno?: {
    id: string;
    nome: string;
    turmaId: string;
  };
  onSuccess?: () => void;
}

export function AlunoForm({ turmaId, aluno, onSuccess }: AlunoFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEditing = !!aluno;

  const form = useForm<AlunoInput>({
    resolver: zodResolver(alunoSchema),
    defaultValues: {
      nome: aluno?.nome || "",
      turmaId: turmaId,
    },
  });

  const onSubmit = async (data: AlunoInput) => {
    setIsLoading(true);
    setError(null);

    try {
      const url = isEditing ? `/api/alunos/${aluno.id}` : "/api/alunos";
      const method = isEditing ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Erro ao salvar aluno");
      }

      if (onSuccess) {
        onSuccess();
      } else {
        router.push(`/turmas/${turmaId}`);
        router.refresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao salvar aluno");
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
              <FormLabel>Nome do Aluno</FormLabel>
              <FormControl>
                <Input
                  placeholder="Ex: João Silva, Maria Santos..."
                  {...field}
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

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
              ? "Atualizar Aluno"
              : "Adicionar Aluno"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
