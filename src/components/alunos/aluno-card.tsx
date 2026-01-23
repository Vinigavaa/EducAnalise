"use client";

import Link from "next/link";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DeleteAlunoDialog } from "./delete-aluno-dialog";
import { User, ChevronRight } from "lucide-react";

interface AlunoCardProps {
  aluno: {
    id: string;
    nome: string;
  };
  turmaId: string;
}

export function AlunoCard({ aluno, turmaId }: AlunoCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3 flex-1">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-5 w-5 text-primary" />
            </div>
            <CardTitle className="text-lg">{aluno.nome}</CardTitle>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" asChild>
              <Link href={`/turmas/${turmaId}/alunos/${aluno.id}`}>
                <ChevronRight className="h-5 w-5" />
              </Link>
            </Button>
            <DeleteAlunoDialog alunoId={aluno.id} alunoNome={aluno.nome} />
          </div>
        </div>
      </CardHeader>
    </Card>
  );
}
