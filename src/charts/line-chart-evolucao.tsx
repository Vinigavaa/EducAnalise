"use client"

import { TrendingUp, TrendingDown, Minus } from "lucide-react"
import { CartesianGrid, Line, LineChart, XAxis, YAxis, ReferenceLine } from "recharts"
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

interface EvolucaoData {
  prova: string;
  nota: number;
  data: Date | string | null;
  tipo?: "COMUM" | "SIMULADO";
}

interface LineChartEvolucaoProps {
  data: EvolucaoData[];
  title?: string;
  description?: string;
}

const chartConfig = {
  nota: {
    label: "Nota",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig

export function LineChartEvolucao({
  data,
  title = "Evolucao das Notas",
  description = "Ultimas avaliacoes realizadas"
}: LineChartEvolucaoProps) {
  const chartData = data.map((item, index) => ({
    name: item.prova.length > 12 ? item.prova.substring(0, 12) + "..." : item.prova,
    fullName: item.prova,
    nota: item.nota,
    tipo: item.tipo || "COMUM",
    index: index + 1,
  }));

  // Calcular tendencia
  const calcularTendencia = () => {
    if (chartData.length < 2) return { valor: 0, tipo: "neutro" };

    const primeiraMetade = chartData.slice(0, Math.ceil(chartData.length / 2));
    const segundaMetade = chartData.slice(Math.ceil(chartData.length / 2));

    const mediaPrimeira = primeiraMetade.reduce((acc, n) => acc + n.nota, 0) / primeiraMetade.length;
    const mediaSegunda = segundaMetade.reduce((acc, n) => acc + n.nota, 0) / segundaMetade.length;

    const diferenca = ((mediaSegunda - mediaPrimeira) / mediaPrimeira) * 100;

    if (diferenca > 2) return { valor: diferenca, tipo: "alta" };
    if (diferenca < -2) return { valor: Math.abs(diferenca), tipo: "baixa" };
    return { valor: 0, tipo: "neutro" };
  };

  const tendencia = calcularTendencia();

  // Calcular media para linha de referencia
  const mediaNotas = chartData.length > 0
    ? chartData.reduce((acc, n) => acc + n.nota, 0) / chartData.length
    : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[250px] w-full">
          <LineChart
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
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => value.slice(0, 6)}
            />
            <YAxis
              domain={[0, 10]}
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <ReferenceLine
              y={mediaNotas}
              stroke="var(--chart-2)"
              strokeDasharray="5 5"
              label={{ value: `Media: ${mediaNotas.toFixed(1)}`, position: "right", fontSize: 10 }}
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
            <Line
              dataKey="nota"
              type="monotone"
              stroke="var(--color-nota)"
              strokeWidth={2}
              dot={{
                fill: "var(--color-nota)",
                strokeWidth: 2,
                r: 4,
              }}
              activeDot={{
                r: 6,
              }}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 leading-none font-medium">
          {tendencia.tipo === "alta" && (
            <>
              Tendencia de alta de {tendencia.valor.toFixed(1)}%
              <TrendingUp className="h-4 w-4 text-green-500" />
            </>
          )}
          {tendencia.tipo === "baixa" && (
            <>
              Tendencia de queda de {tendencia.valor.toFixed(1)}%
              <TrendingDown className="h-4 w-4 text-red-500" />
            </>
          )}
          {tendencia.tipo === "neutro" && (
            <>
              Desempenho estavel
              <Minus className="h-4 w-4 text-gray-500" />
            </>
          )}
        </div>
        <div className="text-muted-foreground leading-none">
          Baseado em {chartData.length} avaliacao(oes)
        </div>
      </CardFooter>
    </Card>
  )
}
