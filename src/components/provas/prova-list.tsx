"use client";

import { TipoProva } from "@/generated/prisma";
import { ProvaCard } from "./prova-card";

interface Prova {
  id: string;
  nome: string;
  ano_letivo: number;
  peso: number;
  _count: {
    notas: number;
  };
  turmaId: string;
  tipo: TipoProva;
  data_prova: Date | null;
  turma: {
    id: string;
    nome: string;
  };
}

interface ProvaListProps {
  provas: Prova[];
}

export function ProvaList({ provas }: ProvaListProps) {
  if (provas.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground text-lg mb-2">
          Nenhuma Prova encontrada
        </p>
        <p className="text-sm text-muted-foreground">
          Crie sua primeira Prova para começar
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {provas.map((prova) => (
        <ProvaCard key={prova.id} prova={prova} />
      ))}
    </div>
  );
}
