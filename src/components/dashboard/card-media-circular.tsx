"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface CardMediaCircularProps {
  media: number;
  pesoProva: number;
}

export function CardMediaCircular({ media, pesoProva }: CardMediaCircularProps) {
  // Normalizar a nota para escala de 0-10 para determinar a cor
  const notaNormalizada = (media / pesoProva) * 10;

  const getCorMedia = () => {
    if (notaNormalizada < 5) return { bg: "bg-red-500", text: "text-red-500", stroke: "#ef4444" };
    if (notaNormalizada >= 6 && notaNormalizada <= 7) return { bg: "bg-yellow-500", text: "text-yellow-500", stroke: "#eab308" };
    if (notaNormalizada > 8) return { bg: "bg-green-500", text: "text-green-500", stroke: "#22c55e" };
    return { bg: "bg-blue-500", text: "text-blue-500", stroke: "#3b82f6" };
  };

  const cores = getCorMedia();

  // Calcular porcentagem para o circulo (baseado no peso da prova)
  const porcentagem = Math.min((media / pesoProva) * 100, 100);

  // Configuracoes do circulo SVG
  const tamanho = 140;
  const strokeWidth = 12;
  const raio = (tamanho - strokeWidth) / 2;
  const circunferencia = 2 * Math.PI * raio;
  const offset = circunferencia - (porcentagem / 100) * circunferencia;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg text-center">Media Geral</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center">
        <div className="relative">
          <svg width={tamanho} height={tamanho} className="transform -rotate-90">
            {/* Circulo de fundo */}
            <circle
              cx={tamanho / 2}
              cy={tamanho / 2}
              r={raio}
              fill="none"
              stroke="#e5e7eb"
              strokeWidth={strokeWidth}
            />
            {/* Circulo de progresso */}
            <circle
              cx={tamanho / 2}
              cy={tamanho / 2}
              r={raio}
              fill="none"
              stroke={cores.stroke}
              strokeWidth={strokeWidth}
              strokeDasharray={circunferencia}
              strokeDashoffset={offset}
              strokeLinecap="round"
              className="transition-all duration-500"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-3xl font-bold ${cores.text}`}>
              {media.toFixed(1)}
            </span>
            <span className="text-sm text-muted-foreground">
              de {pesoProva}
            </span>
          </div>
        </div>
        <p className="mt-3 text-sm text-muted-foreground text-center">
          {notaNormalizada < 5 && "Abaixo da media"}
          {notaNormalizada >= 5 && notaNormalizada < 6 && "Na media"}
          {notaNormalizada >= 6 && notaNormalizada <= 7 && "Bom desempenho"}
          {notaNormalizada > 7 && notaNormalizada <= 8 && "Otimo desempenho"}
          {notaNormalizada > 8 && "Excelente desempenho"}
        </p>
      </CardContent>
    </Card>
  );
}
