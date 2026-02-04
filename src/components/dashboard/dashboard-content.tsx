"use client";

import { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue,} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { BarChart3, Loader2 } from "lucide-react";
import { GraficoBarrasNotas, GraficoPizzaMaterias, CardMediaCircular, CardMelhora, CardMaiorNota, } from "@/components/dashboard";

interface Turma {
  id: string;
  nome: string;
  ano_letivo: number;
}

interface Prova {
  id: string;
  nome: string;
  tipo: "COMUM" | "SIMULADO";
  peso: number;
  data_prova: string | null;
  materiaId?: string | null;
  materia?: { id: string; nome: string } | null;
  simuladoMaterias?: { materiaId: string }[];
}

interface Materia {
  id: string;
  nome: string;
}

interface DashboardData {
  prova: {
    id: string;
    nome: string;
    tipo: "COMUM" | "SIMULADO";
    peso: number;
    data_prova: string | null;
  };
  notasPorAluno: { alunoId: string; nome: string; nota: number }[];
  mediaGeral: number;
  alunoMaiorNota: { alunoId: string; nome: string; nota: number } | null;
  porcentagemMelhora: number | null;
  provaAnteriorNome: string | null;
  materiasPorAcertos: { materiaId: string; nome: string; mediaAcertos: number }[];
}

interface DashboardContentProps {
  turmas: Turma[];
}

export function DashboardContent({ turmas }: DashboardContentProps) {
  const [turmaId, setTurmaId] = useState<string>("");
  const [provaId, setProvaId] = useState<string>("");
  const [materiaId, setMateriaId] = useState<string>("");
  const [provas, setProvas] = useState<Prova[]>([]);
  const [materias, setMaterias] = useState<Materia[]>([]);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingProvas, setLoadingProvas] = useState(false);

  // Buscar matérias do professor
  useEffect(() => {
    const fetchMaterias = async () => {
      try {
        const res = await fetch("/api/materias");
        if (res.ok) {
          const data = await res.json();
          setMaterias(data);
        }
      } catch (error) {
        console.error("Erro ao buscar matérias:", error);
      }
    };
    fetchMaterias();
  }, []);

  // Buscar provas quando turma mudar
  useEffect(() => {
    if (!turmaId) {
      setProvas([]);
      setProvaId("");
      setMateriaId("");
      setDashboardData(null);
      return;
    }

    const fetchProvas = async () => {
      setLoadingProvas(true);
      try {
        const res = await fetch(`/api/provas?turmaId=${turmaId}`);
        if (res.ok) {
          const data = await res.json();
          // Converter peso para number
          const provasFormatadas = data.map((p: { id: string; nome: string; tipo: "COMUM" | "SIMULADO"; peso: string | number; data_prova: string | null }) => ({
            ...p,
            peso: Number(p.peso),
          }));
          setProvas(provasFormatadas);
        }
      } catch (error) {
        console.error("Erro ao buscar provas:", error);
      } finally {
        setLoadingProvas(false);
      }
    };

    fetchProvas();
    setProvaId("");
    setMateriaId("");
    setDashboardData(null);
  }, [turmaId]);

  // Buscar dados do dashboard quando prova ou matéria mudar
  useEffect(() => {
    if (!turmaId || !provaId) {
      setDashboardData(null);
      return;
    }

    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const url = `/api/dashboard?turmaId=${turmaId}&provaId=${provaId}${materiaId ? `&materiaId=${materiaId}` : ''}`;
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          setDashboardData(data);
        }
      } catch (error) {
        console.error("Erro ao buscar dados do dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [turmaId, provaId, materiaId]);

  // Filtrar provas pela matéria selecionada
  const provasFiltradas = materiaId
    ? provas.filter((p) =>
        p.materiaId === materiaId ||
        p.simuladoMaterias?.some((sm) => sm.materiaId === materiaId)
      )
    : provas;

  return (
    <div className="space-y-6">
      {/* Seletores */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <label className="text-sm font-medium text-zinc-700 mb-2 block">
            Selecione a Turma
          </label>
          <Select value={turmaId} onValueChange={setTurmaId}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecione uma turma" />
            </SelectTrigger>
            <SelectContent>
              {turmas.map((turma) => (
                <SelectItem key={turma.id} value={turma.id}>
                  {turma.nome} ({turma.ano_letivo})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex-1">
          <label className="text-sm font-medium text-zinc-700 mb-2 block">
            Filtrar por Matéria
          </label>
          <Select value={materiaId || "todas"} onValueChange={(value) => {
            setMateriaId(value === "todas" ? "" : value);
            setProvaId("");
          }}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Todas as matérias" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas as matérias</SelectItem>
              {materias.map((materia) => (
                <SelectItem key={materia.id} value={materia.id}>
                  {materia.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex-1">
          <label className="text-sm font-medium text-zinc-700 mb-2 block">
            Selecione a Prova
          </label>
          <Select
            value={provaId}
            onValueChange={setProvaId}
            disabled={!turmaId || loadingProvas}
          >
            <SelectTrigger className="w-full">
              <SelectValue
                placeholder={
                  loadingProvas
                    ? "Carregando..."
                    : !turmaId
                    ? "Selecione uma turma primeiro"
                    : "Selecione uma prova"
                }
              />
            </SelectTrigger>
            <SelectContent>
              {provasFiltradas.map((prova) => (
                <SelectItem key={prova.id} value={prova.id}>
                  {prova.nome} ({prova.tipo === "SIMULADO" ? "Simulado" : "Comum"})
                  {prova.materia && ` - ${prova.materia.nome}`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Estado vazio */}
      {!turmaId || !provaId ? (
        <Card className="py-16">
          <CardContent className="flex flex-col items-center justify-center text-center">
            <div className="p-4 rounded-full bg-indigo-50 mb-4">
              <BarChart3 className="h-12 w-12 text-indigo-500" />
            </div>
            <h3 className="text-xl font-semibold text-zinc-800 mb-2">
              Selecione uma turma e prova
            </h3>
            <p className="text-muted-foreground max-w-md">
              Para visualizar os graficos e estatisticas, selecione uma turma e uma prova
              nos campos acima.
            </p>
          </CardContent>
        </Card>
      ) : loading ? (
        <Card className="py-16">
          <CardContent className="flex flex-col items-center justify-center">
            <Loader2 className="h-12 w-12 text-indigo-500 animate-spin mb-4" />
            <p className="text-muted-foreground">Carregando dados...</p>
          </CardContent>
        </Card>
      ) : dashboardData && dashboardData.notasPorAluno.length > 0 ? (
        <>
          {/* Cards de estatisticas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <CardMediaCircular
              media={dashboardData.mediaGeral}
              pesoProva={dashboardData.prova.peso}
            />
            <CardMelhora
              porcentagemMelhora={dashboardData.porcentagemMelhora}
              provaAnteriorNome={dashboardData.provaAnteriorNome}
            />
            <CardMaiorNota
              alunoNome={dashboardData.alunoMaiorNota?.nome || null}
              nota={dashboardData.alunoMaiorNota?.nota || null}
              pesoProva={dashboardData.prova.peso}
            />
          </div>

          {/* Grafico de barras */}
          <GraficoBarrasNotas
            notas={dashboardData.notasPorAluno}
            pesoProva={dashboardData.prova.peso}
            nomeProva={dashboardData.prova.nome}
          />

          {/* Grafico de pizza (apenas para simulados) */}
          {dashboardData.prova.tipo === "SIMULADO" &&
            dashboardData.materiasPorAcertos.length > 0 && (
              <GraficoPizzaMaterias
                materias={dashboardData.materiasPorAcertos}
                nomeProva={dashboardData.prova.nome}
              />
            )}
        </>
      ) : dashboardData ? (
        <Card className="py-16">
          <CardContent className="flex flex-col items-center justify-center text-center">
            <div className="p-4 rounded-full bg-yellow-50 mb-4">
              <BarChart3 className="h-12 w-12 text-yellow-500" />
            </div>
            <h3 className="text-xl font-semibold text-zinc-800 mb-2">
              Sem notas lancadas
            </h3>
            <p className="text-muted-foreground max-w-md">
              Esta prova ainda nao possui notas lancadas. Lance as notas para visualizar
              os graficos e estatisticas.
            </p>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}