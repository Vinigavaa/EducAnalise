"use client";

import Link from "next/link";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Calendar, MoreVertical, ClipboardList, Newspaper, CalendarDays } from "lucide-react";
import { TipoProva } from "@/generated/prisma/enums";

interface ProvaCardProps {
  prova: {
    id: string;
    nome: string;
    ano_letivo: number;
    turmaId: string;
    tipo: TipoProva;
    data_prova: Date | null;
    turma: {
      id: string;
      nome: string;
    };
  };
}

export function ProvaCard({ prova }: ProvaCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-xl">{prova.nome}</CardTitle>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>Ano Letivo: {prova.ano_letivo}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <ClipboardList className="h-4 w-4" />
          <span>Prova: {prova.nome}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Newspaper className="h-4 w-4" />
          <span>Modelo da Prova: {prova.tipo}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <CalendarDays className="h-4 w-4" />
          <span>Data da Prova: {prova.data_prova ? new Date(prova.data_prova).toLocaleDateString('pt-BR') : 'Não definida'}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Users className="h-4 w-4" />
          <span>Pertence à Turma: {prova.turma?.nome ?? "Sem turma"}</span>
        </div>
      </CardContent>
      <CardFooter className="gap-2 pt-3">
        <Button asChild variant="outline" className="flex-1">
          <Link href={`/provas/${prova.id}`}>Ver Detalhes</Link>
        </Button>
        <Button asChild variant="outline" className="flex-1">
          <Link href={`/provas/${prova.id}/notas`}>Lançar Notas</Link>
        </Button>
        <Button asChild className="flex-1">
          <Link href={`/provas/${prova.id}/editar`}>Editar</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
