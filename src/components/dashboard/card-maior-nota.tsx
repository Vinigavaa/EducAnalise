"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy } from "lucide-react";

interface CardMaiorNotaProps {
  alunoNome: string | null;
  nota: number | null;
  pesoProva: number;
}

export function CardMaiorNota({ alunoNome, nota, pesoProva }: CardMaiorNotaProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg text-center">Maior Nota</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center py-4">
        <div className="p-4 rounded-full bg-yellow-50 mb-3">
          <Trophy className="h-8 w-8 text-yellow-500" />
        </div>
        {alunoNome && nota !== null ? (
          <>
            <span className="text-xl font-bold text-center truncate max-w-full px-2">
              {alunoNome}
            </span>
            <div className="flex items-baseline gap-1 mt-2">
              <span className="text-3xl font-bold text-indigo-600">
                {nota.toFixed(1)}
              </span>
              <span className="text-sm text-muted-foreground">
                / {pesoProva}
              </span>
            </div>
          </>
        ) : (
          <span className="text-lg font-medium text-muted-foreground">
            Sem dados
          </span>
        )}
      </CardContent>
    </Card>
  );
}
