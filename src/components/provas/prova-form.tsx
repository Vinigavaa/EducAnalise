"use client"

import { TipoProva } from "@/generated/prisma/enums";
import { ProvaInput, provaSchema } from "@/lib/validations/prova";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { FormControl, FormField, FormItem, FormLabel, FormMessage, Form } from "../ui/form";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "../ui/select";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Calendar } from "../ui/calendar";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";


interface Turma {
    id: string;
    nome: string;
    ano_letivo: number;
}

interface ProvaFormProps {
    prova?: {
        id: string;
        nome: string;
        ano_letivo: number;
        peso: number;
        tipo: TipoProva;
        data_prova: Date | null;
        turmaId: string;
        turma: {
            id: string;
            nome: string;
        };
    }
    onSuccess?: () => void;
}

export function ProvaForm({ prova, onSuccess }: ProvaFormProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [turmas, setTurmas] = useState<Turma[]>([]);
    const [loadingTurmas, setLoadingTurmas] = useState(true);

    const isEditing = !!prova;

    // Buscar turmas disponíveis
    useEffect(() => {
        async function fetchTurmas() {
            try {
                const response = await fetch("/api/turmas");
                if (response.ok) {
                    const data = await response.json();
                    setTurmas(data);
                }
            } catch (error) {
                console.error("Erro ao buscar turmas:", error);
            } finally {
                setLoadingTurmas(false);
            }
        }
        fetchTurmas();
    }, []);

    const form = useForm<ProvaInput>({
        resolver: zodResolver(provaSchema),
        defaultValues: {
            nome: prova?.nome || "",
            turmaId: prova?.turmaId || "",
            ano_letivo: prova?.ano_letivo || new Date().getFullYear(),
            peso: prova?.peso || 0,
            tipo: prova?.tipo || TipoProva.COMUM,
            data_prova: prova?.data_prova ? new Date(prova.data_prova) : undefined,
        },
    });

    const onSubmit = async (data: ProvaInput) => {
        setIsLoading(true);
        setError(null);

        try {
            const url = isEditing ? `/api/provas/${prova.id}` : "/api/provas";
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
                throw new Error(result.error || "Erro ao salvar prova");
            }

            if (onSuccess) {
                onSuccess();
            } else {
                router.push("/provas");
                router.refresh();
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "Erro ao salvar prova");
        } finally {
            setIsLoading(false);
        }
    };

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
                <FormLabel>Nome da Prova</FormLabel>
                <FormControl>
                    <Input
                    placeholder="Ex: Prova de Matemática, Simulado..."
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
            name="turmaId"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Turma</FormLabel>
                <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isLoading || loadingTurmas}
                >
                    <FormControl>
                    <SelectTrigger>
                        <SelectValue placeholder={loadingTurmas ? "Carregando turmas..." : "Selecione uma turma"} />
                    </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                    {turmas.length === 0 && !loadingTurmas ? (
                        <div className="p-2 text-sm text-muted-foreground">
                        Nenhuma turma encontrada
                        </div>
                    ) : (
                        turmas.map((turma) => (
                        <SelectItem key={turma.id} value={turma.id}>
                            {turma.nome} - {turma.ano_letivo}
                        </SelectItem>
                        ))
                    )}
                    </SelectContent>
                </Select>
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

            <FormField
            control={form.control}
            name="peso"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Peso da Prova</FormLabel>
                <FormControl>
                    <Input
                    type="number"
                    step="0.01"
                    placeholder="Ex: 10"
                    {...field}
                    value={field.value || ""}
                    onChange={(e) => {
                        const value = e.target.value;
                        field.onChange(value === "" ? 0 : parseFloat(value));
                    }}
                    disabled={isLoading}
                    />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />

            <FormField
            control={form.control}
            name="tipo"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Tipo da Prova</FormLabel>
                <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isLoading}
                >
                    <FormControl>
                    <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo de prova" />
                    </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                    <SelectItem value={TipoProva.COMUM}>Comum</SelectItem>
                    <SelectItem value={TipoProva.SIMULADO}>Simulado</SelectItem>
                    </SelectContent>
                </Select>
                <FormMessage />
                </FormItem>
            )}
            />

            <FormField
            control={form.control}
            name="data_prova"
            render={({ field }) => (
                <FormItem className="flex flex-col">
                <FormLabel>Data da Prova</FormLabel>
                <Popover>
                    <PopoverTrigger asChild>
                    <FormControl>
                        <Button
                        variant="outline"
                        disabled={isLoading}
                        className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                        )}
                        >
                        {field.value ? (
                            format(field.value, "PPP", { locale: ptBR })
                        ) : (
                            <span>Selecione uma data</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                    </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                        mode="single"
                        selected={field.value ?? undefined}
                        onSelect={field.onChange}
                        disabled={isLoading}
                        locale={ptBR}
                    />
                    </PopoverContent>
                </Popover>
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
                ? "Atualizar Prova"
                : "Criar Prova"}
            </Button>
            </div>
        </form>
        </Form>
    );
}
