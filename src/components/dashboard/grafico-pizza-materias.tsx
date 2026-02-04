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

    const svg = chartRef.current.querySelector("svg");
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
      const titleHeight = 60;
      const footerHeight = 100;
      canvas.width = img.width * 2;
      canvas.height = (img.height * 2) + titleHeight + footerHeight;
      ctx!.scale(2, 2);
      ctx!.fillStyle = "white";
      ctx!.fillRect(0, 0, canvas.width, canvas.height);

      // Desenhar titulo
      ctx!.fillStyle = "#18181b";
      ctx!.font = "bold 16px Inter, sans-serif";
      ctx!.textAlign = "center";
      ctx!.fillText(tituloGrafico, img.width / 2, 25);

      // Desenhar grafico
      ctx!.drawImage(img, 0, titleHeight / 2);

      // Desenhar rodape com valores das materias
      const footerY = img.height + (titleHeight / 2) + 10;
      ctx!.font = "11px Inter, sans-serif";
      ctx!.textAlign = "left";
      ctx!.fillStyle = "#71717a";

      materias.forEach((materia, index) => {
        const col = index % 2;
        const row = Math.floor(index / 2);
        const x = col === 0 ? 20 : img.width / 2 + 20;
        const y = footerY + (row * 16);
        ctx!.fillText(`${materia.nome}: ${materia.mediaAcertos.toFixed(2)}`, x, y);
      });

      URL.revokeObjectURL(url);

      const link = document.createElement("a");
      link.download = `grafico-materias${nomeProva ? `-${nomeProva.replace(/\s+/g, "-")}` : ""}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    };

    img.src = url;
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
