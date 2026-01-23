"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface GraficoMateriasProps {
  data: Array<{
    materia: string;
    media: number;
  }>;
}

const COLORS = [
  "hsl(var(--primary))",
  "hsl(221, 83%, 53%)",
  "hsl(250, 83%, 53%)",
  "hsl(280, 83%, 53%)",
  "hsl(310, 83%, 53%)",
  "hsl(340, 83%, 53%)",
  "hsl(10, 83%, 53%)",
  "hsl(40, 83%, 53%)",
];

export function GraficoMaterias({ data }: GraficoMateriasProps) {
  const chartData = data.map((item) => ({
    name: item.materia.length > 12 ? item.materia.substring(0, 12) + "..." : item.materia,
    media: item.media,
    fullName: item.materia,
  }));

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis
            type="number"
            domain={[0, 10]}
            tick={{ fontSize: 12 }}
            className="text-muted-foreground"
          />
          <YAxis
            type="category"
            dataKey="name"
            tick={{ fontSize: 12 }}
            className="text-muted-foreground"
            width={75}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--background))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "6px",
            }}
            formatter={(value, _name, props) => [
              typeof value === 'number' ? value.toFixed(1) : "-",
              (props as { payload?: { fullName?: string } }).payload?.fullName || "Media",
            ]}
          />
          <Bar dataKey="media" radius={[0, 4, 4, 0]}>
            {chartData.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
