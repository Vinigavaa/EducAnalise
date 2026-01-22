"use client"

import { TipoProva } from "@/generated/prisma";
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
import { CalendarIcon, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

interface Turma {
    id: string;
    nome: string;
    ano_letivo: number;
}

interface Materia {
    id: string;
    nome: string;
}

interface MateriaSimulado {
    materiaId: string;
    nome: string;
    peso: number;
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
        simuladoMaterias?: {
            id: string;
            materiaId: string;
            peso: number;
            materia: {
                id: string;
                nome: string;
            };
        }[];
    }
    onSuccess?: () => void;
}

export function ProvaForm({ prova, onSuccess }: ProvaFormProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [turmas, setTurmas] = useState<Turma[]>([]);
    const [loadingTurmas, setLoadingTurmas] = useState(true);
    const [materias, setMaterias] = useState<Materia[]>([]);
    const [loadingMaterias, setLoadingMaterias] = useState(false);
    const [materiasSimulado, setMateriasSimulado] = useState<MateriaSimulado[]>([]);
    const [novaMateriaId, setNovaMateriaId] = useState<string>("");
    const [novaMateriaPeso, setNovaMateriaPeso] = useState<string>("");

    const isEditing = !!prova;

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

    // Buscar matérias globais
    useEffect(() => {
        async function fetchMaterias() {
            setLoadingMaterias(true);
            try {
                const response = await fetch("/api/materias");
                if (response.ok) {
                    const data = await response.json();
                    setMaterias(data);
                }
            } catch (error) {
                console.error("Erro ao buscar matérias:", error);
            } finally {
                setLoadingMaterias(false);
            }
        }
        fetchMaterias();
    }, []);

    // Carregar matérias do simulado ao editar
    useEffect(() => {
        if (prova?.simuladoMaterias && prova.simuladoMaterias.length > 0) {
            setMateriasSimulado(
                prova.simuladoMaterias.map((sm) => ({
                    materiaId: sm.materiaId,
                    nome: sm.materia.nome,
                    peso: Number(sm.peso),
                }))
            );
        }
    }, [prova]);

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

    const tipoProva = form.watch("tipo");

    // Calcular peso total do simulado
    const pesoTotalSimulado = materiasSimulado.reduce((acc, m) => acc + m.peso, 0);

    const adicionarMateria = () => {
        if (!novaMateriaId || !novaMateriaPeso) return;

        const materia = materias.find((m) => m.id === novaMateriaId);
        if (!materia) return;

        // Verificar se a matéria já foi adicionada
        if (materiasSimulado.some((m) => m.materiaId === novaMateriaId)) {
            setError("Esta matéria já foi adicionada ao simulado");
            return;
        }

        setMateriasSimulado([
            ...materiasSimulado,
            {
                materiaId: novaMateriaId,
                nome: materia.nome,
                peso: parseFloat(novaMateriaPeso),
            },
        ]);

        setNovaMateriaId("");
        setNovaMateriaPeso("");
        setError(null);
    };

    const removerMateria = (materiaId: string) => {
        setMateriasSimulado(materiasSimulado.filter((m) => m.materiaId !== materiaId));
    };

    const onSubmit = async (data: ProvaInput) => {
        // Validar matérias para simulado
        if (data.tipo === TipoProva.SIMULADO && materiasSimulado.length === 0) {
            setError("Simulados devem ter pelo menos uma matéria cadastrada");
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const url = isEditing ? `/api/provas/${prova.id}` : "/api/provas";
            const method = isEditing ? "PUT" : "POST";

            // Preparar dados
            const payload = {
                ...data,
                // Para simulado, peso é a soma das matérias
                peso: data.tipo === TipoProva.SIMULADO ? pesoTotalSimulado : data.peso,
                // Incluir matérias se for simulado
                materias: data.tipo === TipoProva.SIMULADO
                    ? materiasSimulado.map((m) => ({
                        materiaId: m.materiaId,
                        peso: m.peso,
                    }))
                    : undefined,
            };

            const response = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
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

    // Filtrar matérias que ainda não foram adicionadas
    const materiasDisponiveis = materias.filter(
        (m) => !materiasSimulado.some((ms) => ms.materiaId === m.id)
    );

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
            name="tipo"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Tipo da Prova</FormLabel>
                <Select
                    onValueChange={(value) => {
                        field.onChange(value);
                        // Limpar matérias se mudar de simulado para comum
                        if (value === TipoProva.COMUM) {
                            setMateriasSimulado([]);
                        }
                    }}
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

            {/* Campo de peso para prova comum */}
            {tipoProva === TipoProva.COMUM && (
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
            )}

            {/* Seção de matérias para simulado */}
            {tipoProva === TipoProva.SIMULADO && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Matérias do Simulado</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Lista de matérias adicionadas */}
                        {materiasSimulado.length > 0 && (
                            <div className="space-y-2">
                                {materiasSimulado.map((materia) => (
                                    <div
                                        key={materia.materiaId}
                                        className="flex items-center justify-between p-3 bg-muted rounded-lg"
                                    >
                                        <div>
                                            <span className="font-medium">{materia.nome}</span>
                                            <span className="text-muted-foreground ml-2">
                                                (Peso: {materia.peso})
                                            </span>
                                        </div>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => removerMateria(materia.materiaId)}
                                            disabled={isLoading}
                                        >
                                            <Trash2 className="h-4 w-4 text-destructive" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Adicionar nova matéria */}
                        <div className="flex gap-2 items-end">
                            <div className="flex-1">
                                <label className="text-sm font-medium mb-2 block">Matéria</label>
                                <Select
                                    value={novaMateriaId}
                                    onValueChange={setNovaMateriaId}
                                    disabled={isLoading || loadingMaterias}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder={loadingMaterias ? "Carregando..." : "Selecione uma matéria"} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {materiasDisponiveis.length === 0 ? (
                                            <div className="p-2 text-sm text-muted-foreground">
                                                {materias.length === 0
                                                    ? "Nenhuma matéria cadastrada"
                                                    : "Todas as matérias já foram adicionadas"}
                                            </div>
                                        ) : (
                                            materiasDisponiveis.map((materia) => (
                                                <SelectItem key={materia.id} value={materia.id}>
                                                    {materia.nome}
                                                </SelectItem>
                                            ))
                                        )}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="w-24">
                                <label className="text-sm font-medium mb-2 block">Peso</label>
                                <Input
                                    type="number"
                                    step="0.01"
                                    min="0.1"
                                    placeholder="Ex: 10"
                                    value={novaMateriaPeso}
                                    onChange={(e) => setNovaMateriaPeso(e.target.value)}
                                    disabled={isLoading}
                                />
                            </div>
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={adicionarMateria}
                                disabled={isLoading || !novaMateriaId || !novaMateriaPeso}
                            >
                                <Plus className="h-4 w-4" />
                            </Button>
                        </div>

                        {materias.length === 0 && !loadingMaterias && (
                            <p className="text-sm text-muted-foreground">
                                Você precisa cadastrar matérias primeiro.{" "}
                                <a href="/materias/nova" className="text-primary underline">
                                    Cadastrar matéria
                                </a>
                            </p>
                        )}

                        {/* Peso total */}
                        {materiasSimulado.length > 0 && (
                            <div className="pt-4 border-t">
                                <p className="text-lg font-semibold">
                                    Peso Total: {pesoTotalSimulado} pontos
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

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
