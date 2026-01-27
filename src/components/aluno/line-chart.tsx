"use client"

import { TrendingUp } from "lucide-react"
import { CartesianGrid, Line, LineChart, XAxis } from "recharts"
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle,} from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig, } from "@/components/ui/chart"

export const description = "A line chart";

interface GraficoEvolucaoProps {
  data: Array<{
    prova: string;
    nota: number;
    data: string | null;
  }>;
}

const chartConfig = {
  nota: {
    label: "Nota",
    color: "var(--chart-3)",
  },
} satisfies ChartConfig

export function GraficoEvolucao({ data }: GraficoEvolucaoProps) {
  const chartData = data.map((item, index) => ({
    name: item.prova.length > 15 ? item.prova.substring(0, 15) + "..." : item.prova,
    nota: item.nota,
    index: index + 1,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Line Chart</CardTitle>
        <CardDescription>Evolução das Notas</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <LineChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="name"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
              formatter={(value: number) => [typeof value === 'number' ? value.toFixed(1) : "-", " Nota"]}
            />
            <Line
              dataKey="nota"
              type="natural"
              stroke="var(--color-nota)"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 leading-none font-medium">
          Veja sua evolução<TrendingUp className="h-4 w-4" />
        </div>
        <div className="text-muted-foreground leading-none">
          em tempo real
        </div>
      </CardFooter>
    </Card>
  )
}
