"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChartEvolucao } from "@/charts/line-chart-evolucao";
import { BarChartComparacao } from "@/charts/bar-chart-comparacao";
import { RadarChartMaterias } from "@/charts/radar-chart-materias";
import { TrendingUp, Award, BookOpen, Users } from "lucide-react";

interface DashboardData {
  aluno: {
    id: string;
    nome: string;
    turma: string;
  };
  estatisticas: {
    mediaGeral: number;
    maiorNota: number;
    menorNota: number;
    totalProvas: number;
    posicaoTurma: number;
    totalAlunosTurma: number;
  };
  evolucao: Array<{
    prova: string;
    nota: number;
    data: string | null;
    tipo: "COMUM" | "SIMULADO";
  }>;
  comparacaoTurma: Array<{
    prova: string;
    notaAluno: number | null;
    mediaTurma: number;
    tipo: "COMUM" | "SIMULADO";
  }>;
  materias: Array<{
    materia: string;
    media: number;
  }>;
}

export function DashboardContent() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await fetch("/api/aluno/dashboard");
        if (!response.ok) {
          throw new Error("Erro ao carregar dashboard");
        }
        const dashboardData = await response.json();
        setData(dashboardData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro desconhecido");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <div className="h-20 animate-pulse bg-muted rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Cards de estatísticas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Media Geral</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.estatisticas.mediaGeral.toFixed(1)}
            </div>
            <p className="text-xs text-muted-foreground">
              Em {data.estatisticas.totalProvas} prova(s)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Maior Nota</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.estatisticas.maiorNota}
            </div>
            <p className="text-xs text-muted-foreground">Melhor desempenho</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Provas Realizadas</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.estatisticas.totalProvas}
            </div>
            <p className="text-xs text-muted-foreground">Total de avaliacoes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Posicao na Turma</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.estatisticas.posicaoTurma}º
            </div>
            <p className="text-xs text-muted-foreground">
              de {data.estatisticas.totalAlunosTurma} aluno(s)
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="md:col-span-2">
          {data.evolucao.length > 0 ? (
            <LineChartEvolucao
              data={data.evolucao}
              title="Evolucao das Notas"
              description="Ultimas avaliacoes realizadas (provas e simulados)"
            />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Evolucao das Notas</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-center text-muted-foreground py-8">
                  Nenhuma nota disponivel
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        <div>
          {data.comparacaoTurma.length > 0 ? (
            <BarChartComparacao
              data={data.comparacaoTurma}
              title="Comparacao com a Turma"
              description="Seu desempenho vs media da turma"
            />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Comparacao com a Turma</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-center text-muted-foreground py-8">
                  Nenhuma nota disponivel
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        <div>
          {data.materias.length > 0 ? (
            <RadarChartMaterias
              data={data.materias}
              title="Desempenho por Materia"
              description="Media de notas nos simulados"
            />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Desempenho por Materia</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-center text-muted-foreground py-8">
                  Nenhum simulado disponivel
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
