"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { User, Save } from "lucide-react";
import { TipoProva } from "@/generated/prisma/enums";

interface Aluno {
  id: string;
  nome: string;
  nota?: number;
  notasPorMateria?: Record<string, number>;
}

interface SimuladoMateria {
  id: string;
  materiaId: string;
  peso: number;
  materia: {
    id: string;
    nome: string;
  };
}

interface LancarNotasFormProps {
  provaId: string;
  alunos: Aluno[];
  pesoProva: number;
  tipoProva: TipoProva;
  simuladoMaterias?: SimuladoMateria[];
}

export function LancarNotasForm({
  provaId,
  alunos,
  pesoProva,
  tipoProva,
  simuladoMaterias = [],
}: LancarNotasFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Estado para notas de prova comum
  const [notas, setNotas] = useState<Record<string, string>>(() =>
    Object.fromEntries(alunos.map((a) => [a.id, a.nota?.toString() ?? ""]))
  );

  // Estado para notas de simulado (alunoId -> simuladoMateriaId -> valor)
  const [notasSimulado, setNotasSimulado] = useState<Record<string, Record<string, string>>>(() => {
    const initial: Record<string, Record<string, string>> = {};
    alunos.forEach((aluno) => {
      initial[aluno.id] = {};
      simuladoMaterias.forEach((sm) => {
        initial[aluno.id][sm.id] = aluno.notasPorMateria?.[sm.id]?.toString() ?? "";
      });
    });
    return initial;
  });

  const isSimulado = tipoProva === TipoProva.SIMULADO;

  // Handler para prova comum
  const handleNotaChange = (alunoId: string, valor: string) => {
    const valorLimpo = valor.replace(/[^0-9.,]/g, "").replace(",", ".");
    if (valorLimpo === "" || (Number(valorLimpo) >= 0 && Number(valorLimpo) <= pesoProva)) {
      setNotas((prev) => ({ ...prev, [alunoId]: valorLimpo }));
    }
  };

  // Handler para simulado
  const handleNotaSimuladoChange = (
    alunoId: string,
    simuladoMateriaId: string,
    valor: string,
    pesoMateria: number
  ) => {
    const valorLimpo = valor.replace(/[^0-9.,]/g, "").replace(",", ".");
    if (valorLimpo === "" || (Number(valorLimpo) >= 0 && Number(valorLimpo) <= pesoMateria)) {
      setNotasSimulado((prev) => ({
        ...prev,
        [alunoId]: {
          ...prev[alunoId],
          [simuladoMateriaId]: valorLimpo,
        },
      }));
    }
  };

  // Calcular total do aluno no simulado
  const calcularTotalAluno = (alunoId: string): number => {
    if (!notasSimulado[alunoId]) return 0;
    return Object.values(notasSimulado[alunoId]).reduce((acc, valor) => {
      const num = Number(valor);
      return acc + (isNaN(num) ? 0 : num);
    }, 0);
  };

  // Verificar se todas as matérias de um aluno estão preenchidas
  const todasMateriasPreenchidas = (alunoId: string): boolean => {
    if (!notasSimulado[alunoId]) return false;
    return simuladoMaterias.every((sm) => {
      const valor = notasSimulado[alunoId][sm.id];
      return valor !== "" && valor !== undefined;
    });
  };

  // Verificar se pelo menos um aluno tem todas as matérias preenchidas
  const algumAlunoCompleto = (): boolean => {
    return alunos.some((aluno) => todasMateriasPreenchidas(aluno.id));
  };

  const handleSalvar = async () => {
    setIsLoading(true);
    setError(null);

    try {
      if (isSimulado) {
        // Validar que pelo menos um aluno tenha todas as notas
        const alunosCompletos = alunos.filter((aluno) => todasMateriasPreenchidas(aluno.id));

        if (alunosCompletos.length === 0) {
          setError("Preencha todas as matérias de pelo menos um aluno");
          setIsLoading(false);
          return;
        }

        // Preparar dados para simulado
        const notasParaSalvar = alunosCompletos.map((aluno) => ({
          alunoId: aluno.id,
          notasPorMateria: simuladoMaterias.map((sm) => ({
            simuladoMateriaId: sm.id,
            valor: Number(notasSimulado[aluno.id][sm.id]),
          })),
        }));

        const response = await fetch("/api/notas/simulado", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ provaId, notas: notasParaSalvar }),
        });

        if (!response.ok) {
          const result = await response.json();
          throw new Error(result.error || "Erro ao salvar notas");
        }
      } else {
        // Prova comum - mantém lógica original
        const notasParaSalvar = Object.entries(notas)
          .filter(([, valor]) => valor !== "")
          .map(([alunoId, valor]) => ({ alunoId, valor: Number(valor) }));

        if (notasParaSalvar.length === 0) {
          setError("Nenhuma nota foi preenchida");
          setIsLoading(false);
          return;
        }

        const response = await fetch("/api/notas", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ provaId, notas: notasParaSalvar }),
        });

        if (!response.ok) {
          const result = await response.json();
          throw new Error(result.error || "Erro ao salvar notas");
        }
      }

      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao salvar notas");
    } finally {
      setIsLoading(false);
    }
  };

  if (alunos.length === 0) {
    return (
      <div className="text-center py-8 border-2 border-dashed rounded-lg">
        <p className="text-muted-foreground text-base mb-1">
          Nenhum aluno cadastrado
        </p>
        <p className="text-sm text-muted-foreground">
          Adicione alunos à turma para lançar notas
        </p>
      </div>
    );
  }

  if (isSimulado && simuladoMaterias.length === 0) {
    return (
      <div className="text-center py-8 border-2 border-dashed rounded-lg">
        <p className="text-muted-foreground text-base mb-1">
          Nenhuma matéria cadastrada no simulado
        </p>
        <p className="text-sm text-muted-foreground">
          Edite o simulado e adicione matérias para lançar notas
        </p>
      </div>
    );
  }

  // Renderização para prova comum
  if (!isSimulado) {
    return (
      <div className="space-y-6">
        {error && (
          <div className="rounded-md bg-red-50 p-4 text-sm text-red-800">
            {error}
          </div>
        )}

        <Button
          onClick={handleSalvar}
          disabled={isLoading}
          size="lg"
          className="w-full h-14 text-lg font-semibold"
        >
          <Save className="mr-2 h-5 w-5" />
          {isLoading ? "Salvando..." : "Salvar Notas"}
        </Button>

        <div className="space-y-3">
          {alunos.map((aluno) => (
            <Card key={aluno.id} className="hover:shadow-md transition-shadow">
              <CardContent className="py-4">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <User className="h-6 w-6 text-primary" />
                  </div>
                  <p className="flex-1 font-medium text-lg truncate">{aluno.nome}</p>
                  <Input
                    type="text"
                    inputMode="decimal"
                    placeholder="0.00"
                    value={notas[aluno.id]}
                    onChange={(e) => handleNotaChange(aluno.id, e.target.value)}
                    disabled={isLoading}
                    className="w-24 h-12 text-center text-lg font-semibold"
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Renderização para simulado
  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-md bg-red-50 p-4 text-sm text-red-800">
          {error}
        </div>
      )}

      <div className="bg-muted/50 p-4 rounded-lg">
        <p className="text-sm text-muted-foreground">
          Peso Total do Simulado: <span className="font-semibold text-foreground">{pesoProva} pontos</span>
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Preencha todas as matérias de cada aluno para salvar suas notas.
        </p>
      </div>

      <Button
        onClick={handleSalvar}
        disabled={isLoading || !algumAlunoCompleto()}
        size="lg"
        className="w-full h-14 text-lg font-semibold"
      >
        <Save className="mr-2 h-5 w-5" />
        {isLoading ? "Salvando..." : "Salvar Notas"}
      </Button>

      <div className="space-y-4">
        {alunos.map((aluno) => {
          const totalAluno = calcularTotalAluno(aluno.id);
          const completo = todasMateriasPreenchidas(aluno.id);

          return (
            <Card
              key={aluno.id}
              className={`hover:shadow-md transition-shadow ${completo ? "border-green-200 bg-green-50/30" : ""}`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-lg">{aluno.nome}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Total: <span className="font-semibold">{totalAluno.toFixed(2)}</span> / {pesoProva}
                    </p>
                  </div>
                  {completo && (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                      Completo
                    </span>
                  )}
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid gap-3 sm:grid-cols-2">
                  {simuladoMaterias.map((sm) => (
                    <div key={sm.id} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{sm.materia.nome}</p>
                        <p className="text-xs text-muted-foreground">Peso: {sm.peso}</p>
                      </div>
                      <Input
                        type="text"
                        inputMode="decimal"
                        placeholder="0.00"
                        value={notasSimulado[aluno.id]?.[sm.id] ?? ""}
                        onChange={(e) =>
                          handleNotaSimuladoChange(aluno.id, sm.id, e.target.value, Number(sm.peso))
                        }
                        disabled={isLoading}
                        className="w-20 h-10 text-center font-semibold"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
