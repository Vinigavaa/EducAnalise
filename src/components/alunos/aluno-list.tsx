"use client";

import { AlunoCard } from "./aluno-card";

interface Aluno {
  id: string;
  nome: string;
}

interface AlunoListProps {
  alunos: Aluno[];
}

export function AlunoList({ alunos }: AlunoListProps) {
  if (alunos.length === 0) {
    return (
      <div className="text-center py-8 border-2 border-dashed rounded-lg">
        <p className="text-muted-foreground text-base mb-1">
          Nenhum aluno cadastrado
        </p>
        <p className="text-sm text-muted-foreground">
          Adicione alunos à turma para começar
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {alunos.map((aluno) => (
        <AlunoCard key={aluno.id} aluno={aluno} />
      ))}
    </div>
  );
}
