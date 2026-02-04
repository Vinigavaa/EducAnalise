"use client";

import { useRef, useMemo } from "react";
import { PieChart, Pie, Cell, Label } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Button } from "@/components/ui/button";
import { Download, TrendingUp, TrendingDown } from "lucide-react";

interface MateriaAcertos {
  materiaId: string;
  nome: string;
  mediaAcertos: number;
  [key: string]: string | number;
}

interface GraficoPizzaMateriasProps {
  materias: MateriaAcertos[];
  nomeProva?: string;
}

// Cores para exibição no navegador (variáveis CSS)
const CORES = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
  "#a855f7",
  "#f97316",
  "#14b8a6",
  "#ec4899",
  "#84cc16",
];

// Cores fixas para exportação PNG - paleta educacional harmoniosa e vibrante
const CORES_EXPORT = [
  "#3B82F6", // Azul (Português)
  "#10B981", // Verde (Matemática)
  "#F59E0B", // Laranja (História)
  "#8B5CF6", // Roxo (Ciências)
  "#EF4444", // Vermelho
  "#06B6D4", // Ciano
  "#EC4899", // Rosa
  "#84CC16", // Lima
  "#F97316", // Laranja escuro
  "#6366F1", // Índigo
];

export function GraficoPizzaMaterias({ materias, nomeProva }: GraficoPizzaMateriasProps) {
  const chartRef = useRef<HTMLDivElement>(null);

  const tituloGrafico = nomeProva
    ? `Desempenho por Materia - ${nomeProva}`
    : "Desempenho por Materia";

  // Criar config dinamico baseado nas materias
  const chartConfig = useMemo(() => {
    const config: ChartConfig = {};
    materias.forEach((materia, index) => {
      config[materia.nome] = {
        label: materia.nome,
        color: CORES[index % CORES.length],
      };
    });
    return config;
  }, [materias]);

  // Preparar dados com fill para o gráfico
  const chartData = useMemo(() => {
    return materias.map((materia, index) => ({
      ...materia,
      fill: CORES[index % CORES.length],
    }));
  }, [materias]);

  // Calcular melhor e pior matéria
  const destaques = useMemo(() => {
    if (materias.length === 0) return { melhor: null, pior: null };
    const ordenado = [...materias].sort((a, b) => b.mediaAcertos - a.mediaAcertos);
    return {
      melhor: ordenado[0],
      pior: ordenado[ordenado.length - 1],
    };
  }, [materias]);

  // Calcular total para o centro do grafico
  const totalAcertos = useMemo(() => {
    return materias.reduce((acc, curr) => acc + curr.mediaAcertos, 0);
  }, [materias]);

  const handleDownload = async () => {
    if (!chartRef.current) return;

    // Configurações de alta resolução
    const scale = 3; // 3x para alta qualidade
    const canvasWidth = 600;
    const canvasHeight = 700;

    // Dimensões dos elementos
    const titleAreaHeight = 80;
    const chartSize = 320;
    const chartCenterX = canvasWidth / 2;
    const chartCenterY = titleAreaHeight + chartSize / 2 + 20;
    const outerRadius = 130;
    const innerRadius = 80;
    const legendStartY = chartCenterY + outerRadius + 50;

    const canvas = document.createElement("canvas");
    canvas.width = canvasWidth * scale;
    canvas.height = canvasHeight * scale;
    const ctx = canvas.getContext("2d")!;
    ctx.scale(scale, scale);

    // Fundo branco limpo
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // Sombra sutil para o card
    ctx.fillStyle = "#F8FAFC";
    ctx.beginPath();
    ctx.roundRect(20, 20, canvasWidth - 40, canvasHeight - 40, 16);
    ctx.fill();

    ctx.fillStyle = "#FFFFFF";
    ctx.beginPath();
    ctx.roundRect(24, 24, canvasWidth - 48, canvasHeight - 48, 14);
    ctx.fill();

    // Título principal - fonte maior e bem posicionado
    ctx.fillStyle = "#0F172A";
    ctx.font = "bold 22px 'Segoe UI', system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(tituloGrafico, chartCenterX, 55);

    // Subtítulo
    ctx.fillStyle = "#64748B";
    ctx.font = "14px 'Segoe UI', system-ui, sans-serif";
    ctx.fillText("Média de acertos por área de conhecimento", chartCenterX, 80);

    // Calcular total e ângulos
    const total = materias.reduce((acc, curr) => acc + curr.mediaAcertos, 0);
    let startAngle = -Math.PI / 2; // Começar do topo

    // Desenhar fatias do gráfico de rosca
    materias.forEach((materia, index) => {
      const sliceAngle = (materia.mediaAcertos / total) * 2 * Math.PI;
      const endAngle = startAngle + sliceAngle;
      const color = CORES_EXPORT[index % CORES_EXPORT.length];

      // Desenhar fatia
      ctx.beginPath();
      ctx.moveTo(chartCenterX, chartCenterY);
      ctx.arc(chartCenterX, chartCenterY, outerRadius, startAngle, endAngle);
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.fill();

      // Borda branca entre fatias
      ctx.strokeStyle = "#FFFFFF";
      ctx.lineWidth = 3;
      ctx.stroke();

      startAngle = endAngle;
    });

    // Círculo interno (buraco da rosca) - branco
    ctx.beginPath();
    ctx.arc(chartCenterX, chartCenterY, innerRadius, 0, 2 * Math.PI);
    ctx.fillStyle = "#FFFFFF";
    ctx.fill();

    // Valor total no centro - número grande
    ctx.fillStyle = "#0F172A";
    ctx.font = "bold 36px 'Segoe UI', system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(totalAcertos.toFixed(1), chartCenterX, chartCenterY - 8);

    // Label "Total" abaixo do número
    ctx.fillStyle = "#64748B";
    ctx.font = "14px 'Segoe UI', system-ui, sans-serif";
    ctx.fillText("Total", chartCenterX, chartCenterY + 20);

    // Legenda com cores - layout em grid responsivo
    const legendItemWidth = 240;
    const legendItemHeight = 32;
    const legendCols = 2;
    const legendPaddingX = (canvasWidth - (legendCols * legendItemWidth)) / 2;

    materias.forEach((materia, index) => {
      const col = index % legendCols;
      const row = Math.floor(index / legendCols);
      const x = legendPaddingX + col * legendItemWidth;
      const y = legendStartY + row * legendItemHeight;
      const color = CORES_EXPORT[index % CORES_EXPORT.length];

      // Círculo colorido da legenda
      ctx.beginPath();
      ctx.arc(x + 10, y + 10, 8, 0, 2 * Math.PI);
      ctx.fillStyle = color;
      ctx.fill();

      // Nome da matéria
      ctx.fillStyle = "#0F172A";
      ctx.font = "600 14px 'Segoe UI', system-ui, sans-serif";
      ctx.textAlign = "left";
      ctx.textBaseline = "middle";
      ctx.fillText(materia.nome, x + 26, y + 10);

      // Valor da média
      ctx.fillStyle = "#64748B";
      ctx.font = "14px 'Segoe UI', system-ui, sans-serif";
      const nomeWidth = ctx.measureText(materia.nome).width;
      ctx.fillText(` (${materia.mediaAcertos.toFixed(2)})`, x + 26 + nomeWidth, y + 10);
    });

    // Rodapé com indicadores de melhor/pior desempenho
    const footerY = legendStartY + Math.ceil(materias.length / legendCols) * legendItemHeight + 20;

    if (destaques.melhor && destaques.pior) {
      // Melhor matéria
      ctx.fillStyle = "#059669";
      ctx.font = "600 13px 'Segoe UI', system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(
        `Melhor: ${destaques.melhor.nome} (${destaques.melhor.mediaAcertos.toFixed(1)})`,
        chartCenterX,
        footerY
      );

      // Matéria para focar
      ctx.fillStyle = "#D97706";
      ctx.fillText(
        `Foco: ${destaques.pior.nome} (${destaques.pior.mediaAcertos.toFixed(1)})`,
        chartCenterX,
        footerY + 22
      );
    }

    // Marca d'água sutil
    ctx.fillStyle = "#CBD5E1";
    ctx.font = "11px 'Segoe UI', system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("EducAnalise", chartCenterX, canvasHeight - 35);

    // Download do PNG em alta resolução
    const link = document.createElement("a");
    link.download = `grafico-materias${nomeProva ? `-${nomeProva.replace(/\s+/g, "-")}` : ""}.png`;
    link.href = canvas.toDataURL("image/png", 1.0);
    link.click();
  };

  return (
    <Card className="flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between pb-0">
        <div>
          <CardTitle>{tituloGrafico}</CardTitle>
          <CardDescription>Media de acertos por area de conhecimento</CardDescription>
        </div>
        <Button variant="outline" size="sm" onClick={handleDownload}>
          <Download className="h-4 w-4 mr-2" />
          Download
        </Button>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <div ref={chartRef}>
          <ChartContainer
            config={chartConfig}
            className="mx-auto aspect-square max-h-[300px]"
          >
            <PieChart>
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    formatter={(value) => [
                      typeof value === "number" ? value.toFixed(2) : "0.00",
                      " Media de acertos",
                    ]}
                  />
                }
              />
              <Pie
                data={chartData}
                dataKey="mediaAcertos"
                nameKey="nome"
                innerRadius={60}
                outerRadius={100}
                strokeWidth={5}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
                <Label
                  content={({ viewBox }) => {
                    if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                      return (
                        <text
                          x={viewBox.cx}
                          y={viewBox.cy}
                          textAnchor="middle"
                          dominantBaseline="middle"
                        >
                          <tspan
                            x={viewBox.cx}
                            y={viewBox.cy}
                            className="fill-foreground text-2xl font-bold"
                          >
                            {totalAcertos.toFixed(1)}
                          </tspan>
                          <tspan
                            x={viewBox.cx}
                            y={(viewBox.cy || 0) + 20}
                            className="fill-muted-foreground text-xs"
                          >
                            Total
                          </tspan>
                        </text>
                      );
                    }
                  }}
                />
              </Pie>
              <ChartLegend
                content={<ChartLegendContent nameKey="nome" />}
                className="-translate-y-2 flex-wrap gap-2 [&>*]:basis-1/4 [&>*]:justify-center"
              />
            </PieChart>
          </ChartContainer>
        </div>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        {destaques.melhor && destaques.pior && (
          <>
            <div className="flex items-center gap-2 leading-none font-medium">
              <span className="text-green-600 flex items-center gap-1">
                <TrendingUp className="h-4 w-4" />
                Melhor: {destaques.melhor.nome} ({destaques.melhor.mediaAcertos.toFixed(1)})
              </span>
            </div>
            <div className="flex items-center gap-2 leading-none font-medium">
              <span className="text-amber-600 flex items-center gap-1">
                <TrendingDown className="h-4 w-4" />
                Foco: {destaques.pior.nome} ({destaques.pior.mediaAcertos.toFixed(1)})
              </span>
            </div>
          </>
        )}
        <div className="text-muted-foreground leading-none">
          Baseado em {materias.length} materia(s)
        </div>
      </CardFooter>
    </Card>
  );
}
