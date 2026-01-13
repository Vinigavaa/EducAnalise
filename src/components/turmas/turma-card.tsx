"use client";

import Link from "next/link";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Calendar, MoreVertical } from "lucide-react";

interface TurmaCardProps {
  turma: {
    id: string;
    nome: string;
    ano_letivo: number;
    _count?: {
      alunos: number;
    };
  };
}

export function TurmaCard({ turma }: TurmaCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-xl">{turma.nome}</CardTitle>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>Ano Letivo: {turma.ano_letivo}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Users className="h-4 w-4" />
          <span>{turma._count?.alunos || 0} aluno(s)</span>
        </div>
      </CardContent>
      <CardFooter className="gap-2 pt-3">
        <Button asChild variant="outline" className="flex-1">
          <Link href={`/turmas/${turma.id}`}>Adicionar Alunos</Link>
        </Button>
        <Button asChild className="flex-1">
          <Link href={`/turmas/${turma.id}/editar`}>Editar</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
