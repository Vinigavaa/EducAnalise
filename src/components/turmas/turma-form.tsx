"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { turmaSchema, type TurmaInput } from "@/lib/validations/turma";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface TurmaFormProps {
  turma?: {
    id: string;
    nome: string;
    ano_letivo: number;
  };
  onSuccess?: () => void;
}

export function TurmaForm({ turma, onSuccess }: TurmaFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEditing = !!turma;

  //com o useform to dizendo o tipo dos dados do formulario
  const form = useForm<TurmaInput>({
    resolver: zodResolver(turmaSchema),
    defaultValues: {
      nome: turma?.nome || "",
      ano_letivo: turma?.ano_letivo || new Date().getFullYear(),
    },
  });

  const onSubmit = async (data: TurmaInput) => {
    setIsLoading(true);
    setError(null);

    try {
      const url = isEditing ? `/api/turmas/${turma.id}` : "/api/turmas";
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
        throw new Error(result.error || "Erro ao salvar turma");
      }

      if (onSuccess) {
        onSuccess();
      } else {
        router.push("/turmas");
        router.refresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao salvar turma");
    } finally {
      setIsLoading(false);
    }
  };

  // Gerar anos (ano atual - 5 até ano atual + 2)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 8 }, (_, i) => currentYear - 5 + i);

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
              <FormLabel>Nome da Turma</FormLabel>
              <FormControl>
                <Input
                  placeholder="Ex: 3º Ano A, Turma Avançada..."
                  {...field}
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="ano_letivo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ano Letivo</FormLabel>
              <Select
                onValueChange={(value) => field.onChange(parseInt(value))}
                defaultValue={field.value.toString()}
                disabled={isLoading}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o ano letivo" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {years.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
              ? "Atualizar Turma"
              : "Criar Turma"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
