"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Legend } from "recharts"
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

interface ComparacaoData {
  prova: string;
  notaAluno: number | null;
  mediaTurma: number;
  tipo?: "COMUM" | "SIMULADO";
}

interface BarChartComparacaoProps {
  data: ComparacaoData[];
  title?: string;
  description?: string;
}

const chartConfig = {
  notaAluno: {
    label: "Sua Nota",
    color: "var(--chart-1)",
  },
  mediaTurma: {
    label: "Media da Turma",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig

export function BarChartComparacao({
  data,
  title = "Comparacao com a Turma",
  description = "Seu desempenho vs media da turma"
}: BarChartComparacaoProps) {
  const chartData = data.map((item) => ({
    name: item.prova.length > 10 ? item.prova.substring(0, 10) + "..." : item.prova,
    fullName: item.prova,
    notaAluno: item.notaAluno,
    mediaTurma: item.mediaTurma,
    tipo: item.tipo || "COMUM",
  }));

  // Calcular estatisticas
  const calcularEstatisticas = () => {
    const notasAluno = chartData.filter(d => d.notaAluno !== null).map(d => d.notaAluno!);

    if (notasAluno.length === 0) return { acimaDaMedia: 0, abaixoDaMedia: 0 };

    let acimaDaMedia = 0;
    let abaixoDaMedia = 0;

    chartData.forEach((item) => {
      if (item.notaAluno !== null) {
        if (item.notaAluno > item.mediaTurma) acimaDaMedia++;
        else if (item.notaAluno < item.mediaTurma) abaixoDaMedia++;
      }
    });

    return { acimaDaMedia, abaixoDaMedia };
  };

  const stats = calcularEstatisticas();

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <BarChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 12,
              right: 12,
              top: 12,
              bottom: 12,
            }}
          >
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="name"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value.slice(0, 6)}
            />
            <YAxis
              domain={[0, 10]}
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(_, payload) => {
                    if (payload && payload[0]) {
                      const data = payload[0].payload;
                      return `${data.fullName} (${data.tipo === "SIMULADO" ? "Simulado" : "Prova"})`;
                    }
                    return "";
                  }}
                />
              }
            />
            <Legend />
            <Bar
              dataKey="notaAluno"
              fill="var(--color-notaAluno)"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="mediaTurma"
              fill="var(--color-mediaTurma)"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-4 leading-none font-medium">
          <span className="text-green-600">
            Acima da media: {stats.acimaDaMedia} prova(s)
          </span>
          <span className="text-red-600">
            Abaixo da media: {stats.abaixoDaMedia} prova(s)
          </span>
        </div>
        <div className="text-muted-foreground leading-none">
          Total de {chartData.length} avaliacao(oes) comparadas
        </div>
      </CardFooter>
    </Card>
  )
}
