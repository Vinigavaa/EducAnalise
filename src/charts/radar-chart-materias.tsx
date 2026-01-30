"use client"

import { PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart } from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"

interface MateriaData {
  materia: string;
  media: number;
}

interface RadarChartMateriasProps {
  data: MateriaData[];
  title?: string;
  description?: string;
}

const chartConfig = {
  media: {
    label: "Media",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig

export function RadarChartMaterias({
  data,
  title = "Desempenho por Materia",
  description = "Media de notas nos simulados"
}: RadarChartMateriasProps) {
  const chartData = data.map((item) => ({
    materia: item.materia.length > 10 ? item.materia.substring(0, 10) + "..." : item.materia,
    fullName: item.materia,
    media: item.media,
  }));

  // Calcular melhor e pior materia
  const calcularDestaques = () => {
    if (chartData.length === 0) return { melhor: null, pior: null };

    const ordenado = [...data].sort((a, b) => b.media - a.media);
    return {
      melhor: ordenado[0],
      pior: ordenado[ordenado.length - 1],
    };
  };

  const destaques = calcularDestaques();

  return (
    <Card>
      <CardHeader className="items-center pb-4">
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[300px]"
        >
          <RadarChart data={chartData}>
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(_, payload) => {
                    if (payload && payload[0]) {
                      return payload[0].payload.fullName;
                    }
                    return "";
                  }}
                />
              }
            />
            <PolarAngleAxis
              dataKey="materia"
              tick={{ fontSize: 11 }}
            />
            <PolarGrid gridType="polygon" />
            <PolarRadiusAxis
              domain={[0, 10]}
              tick={{ fontSize: 10 }}
              axisLine={false}
            />
            <Radar
              dataKey="media"
              fill="var(--color-media)"
              fillOpacity={0.5}
              stroke="var(--color-media)"
              strokeWidth={2}
              dot={{
                r: 4,
                fillOpacity: 1,
              }}
            />
          </RadarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        {destaques.melhor && destaques.pior && (
          <>
            <div className="flex items-center gap-2 leading-none font-medium">
              <span className="text-green-600">
                Melhor: {destaques.melhor.materia} ({destaques.melhor.media.toFixed(1)})
              </span>
            </div>
            <div className="flex items-center gap-2 leading-none font-medium">
              <span className="text-amber-600">
                Foco: {destaques.pior.materia} ({destaques.pior.media.toFixed(1)})
              </span>
            </div>
          </>
        )}
        <div className="text-muted-foreground leading-none">
          Baseado em {data.length} materia(s)
        </div>
      </CardFooter>
    </Card>
  )
}
