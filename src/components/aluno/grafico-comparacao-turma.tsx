"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface GraficoComparacaoTurmaProps {
  data: Array<{
    prova: string;
    notaAluno: number | null;
    mediaTurma: number;
  }>;
}

export function GraficoComparacaoTurma({ data }: GraficoComparacaoTurmaProps) {
  const chartData = data.map((item) => ({
    name: item.prova.length > 10 ? item.prova.substring(0, 10) + "..." : item.prova,
    "Sua Nota": item.notaAluno,
    "Media da Turma": item.mediaTurma,
  }));

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 12 }}
            className="text-muted-foreground"
          />
          <YAxis
            domain={[0, 10]}
            tick={{ fontSize: 12 }}
            className="text-muted-foreground"
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--background))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "6px",
            }}
            formatter={(value) => [typeof value === 'number' ? value.toFixed(1) : "-", ""]}
          />
          <Legend />
          <Bar
            dataKey="Sua Nota"
            fill="hsl(var(--primary))"
            radius={[4, 4, 0, 0]}
          />
          <Bar
            dataKey="Media da Turma"
            fill="hsl(var(--muted-foreground))"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
