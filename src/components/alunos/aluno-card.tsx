"use client";

import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { DeleteAlunoDialog } from "./delete-aluno-dialog";
import { User } from "lucide-react";

interface AlunoCardProps {
  aluno: {
    id: string;
    nome: string;
  };
}

export function AlunoCard({ aluno }: AlunoCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-5 w-5 text-primary" />
            </div>
            <CardTitle className="text-lg">{aluno.nome}</CardTitle>
          </div>
          <DeleteAlunoDialog alunoId={aluno.id} alunoNome={aluno.nome} />
        </div>
      </CardHeader>
    </Card>
  );
}
