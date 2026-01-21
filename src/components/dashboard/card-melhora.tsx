"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface CardMelhoraProps {
  porcentagemMelhora: number | null;
  provaAnteriorNome: string | null;
}

export function CardMelhora({ porcentagemMelhora, provaAnteriorNome }: CardMelhoraProps) {
  const getIconeECor = () => {
    if (porcentagemMelhora === null) {
      return {
        icone: <Minus className="h-8 w-8 text-muted-foreground" />,
        cor: "text-muted-foreground",
        bg: "bg-muted",
      };
    }
    if (porcentagemMelhora > 0) {
      return {
        icone: <TrendingUp className="h-8 w-8 text-green-500" />,
        cor: "text-green-500",
        bg: "bg-green-50",
      };
    }
    if (porcentagemMelhora < 0) {
      return {
        icone: <TrendingDown className="h-8 w-8 text-red-500" />,
        cor: "text-red-500",
        bg: "bg-red-50",
      };
    }
    return {
      icone: <Minus className="h-8 w-8 text-yellow-500" />,
      cor: "text-yellow-500",
      bg: "bg-yellow-50",
    };
  };

  const { icone, cor, bg } = getIconeECor();

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg text-center">Comparativo</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center py-4">
        <div className={`p-4 rounded-full ${bg} mb-3`}>
          {icone}
        </div>
        {porcentagemMelhora !== null ? (
          <>
            <span className={`text-3xl font-bold ${cor}`}>
              {porcentagemMelhora > 0 ? "+" : ""}
              {porcentagemMelhora.toFixed(1)}%
            </span>
            <p className="text-sm text-muted-foreground mt-2 text-center">
              {porcentagemMelhora > 0
                ? "Melhora"
                : porcentagemMelhora < 0
                ? "Queda"
                : "Sem alteracao"}{" "}
              em relacao a
            </p>
            <p className="text-sm font-medium text-center truncate max-w-full">
              {provaAnteriorNome}
            </p>
          </>
        ) : (
          <>
            <span className="text-lg font-medium text-muted-foreground">
              Sem dados
            </span>
            <p className="text-sm text-muted-foreground mt-2 text-center">
              Esta e a primeira prova da turma
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
}
