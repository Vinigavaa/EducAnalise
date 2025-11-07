"use client";

import { TurmaCard } from "./turma-card";

interface Turma {
  id: string;
  nome: string;
  ano_letivo: number;
  _count?: {
    alunos: number;
  };
}

interface TurmaListProps {
  turmas: Turma[];
}

export function TurmaList({ turmas }: TurmaListProps) {
  if (turmas.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground text-lg mb-2">
          Nenhuma turma encontrada
        </p>
        <p className="text-sm text-muted-foreground">
          Crie sua primeira turma para começar
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {turmas.map((turma) => (
        <TurmaCard key={turma.id} turma={turma} />
      ))}
    </div>
  );
}
