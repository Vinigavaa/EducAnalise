"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TipoProva } from "@/generated/prisma";
import { ChevronDown, ChevronUp, Calendar, BookOpen } from "lucide-react";

interface NotasData {
  turma: {
    id: string;
    nome: string;
    anoLetivo: number;
  };
  provas: Array<{
    id: string;
    nome: string;
    tipo: TipoProva;
    data: string | null;
    peso: number;
    nota: number | null;
    dataPublicacao: string | null;
    materias: Array<{
      materia: string;
      nota: number;
      peso: number;
    }>;
  }>;
  estatisticas: {
    totalProvas: number;
    provasComNota: number;
    media: number;
  };
}

export function ListaNotas() {
  const [data, setData] = useState<NotasData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedProvas, setExpandedProvas] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchNotas = async () => {
      try {
        const response = await fetch("/api/aluno/notas");
        if (!response.ok) {
          throw new Error("Erro ao carregar notas");
        }
        const notasData = await response.json();
        setData(notasData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro desconhecido");
      } finally {
        setLoading(false);
      }
    };

    fetchNotas();
  }, []);

  const toggleExpand = (provaId: string) => {
    setExpandedProvas((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(provaId)) {
        newSet.delete(provaId);
      } else {
        newSet.add(provaId);
      }
      return newSet;
    });
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <div className="h-16 animate-pulse bg-muted rounded" />
            </CardContent>
          </Card>
        ))}
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

  if (!data || data.provas.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              Nenhuma prova publicada ainda
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Resumo */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Turma</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{data.turma.nome}</p>
            <p className="text-xs text-muted-foreground">
              Ano Letivo: {data.turma.anoLetivo}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Provas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {data.estatisticas.provasComNota} / {data.estatisticas.totalProvas}
            </p>
            <p className="text-xs text-muted-foreground">Realizadas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Media</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {data.estatisticas.media.toFixed(1)}
            </p>
            <p className="text-xs text-muted-foreground">Geral</p>
          </CardContent>
        </Card>
      </div>

      {/* Lista de provas */}
      <div className="space-y-4">
        {data.provas.map((prova) => {
          const isExpanded = expandedProvas.has(prova.id);
          const hasMaterias = prova.materias.length > 0;

          return (
            <Card key={prova.id}>
              <CardContent className="pt-6">
                <div
                  className={`flex items-center justify-between ${
                    hasMaterias ? "cursor-pointer" : ""
                  }`}
                  onClick={() => hasMaterias && toggleExpand(prova.id)}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-lg">{prova.nome}</h3>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          prova.tipo === "SIMULADO"
                            ? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
                            : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                        }`}
                      >
                        {prova.tipo}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {prova.data
                          ? new Date(prova.data).toLocaleDateString("pt-BR")
                          : "Data nao definida"}
                      </span>
                      <span>Peso: {prova.peso}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-2xl font-bold">
                        {prova.nota !== null ? prova.nota.toFixed(1) : "-"}
                      </p>
                      <p className="text-xs text-muted-foreground">Nota</p>
                    </div>
                    {hasMaterias && (
                      <div className="text-muted-foreground">
                        {isExpanded ? (
                          <ChevronUp className="h-5 w-5" />
                        ) : (
                          <ChevronDown className="h-5 w-5" />
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {isExpanded && hasMaterias && (
                  <div className="mt-4 pt-4 border-t">
                    <h4 className="text-sm font-medium mb-3">
                      Notas por Materia
                    </h4>
                    <div className="grid gap-2 md:grid-cols-2">
                      {prova.materias.map((materia, idx) => (
                        <div
                          key={idx}
                          className="flex justify-between items-center p-2 bg-muted/50 rounded"
                        >
                          <span className="text-sm">{materia.materia}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">
                              (Peso: {materia.peso})
                            </span>
                            <span className="font-semibold">
                              {materia.nota.toFixed(1)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
