"use client";

import { useRef } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

interface MateriaAcertos {
  materiaId: string;
  nome: string;
  mediaAcertos: number;
  [key: string]: string | number;
}

interface GraficoPizzaMateriasProps {
  materias: MateriaAcertos[];
}

const CORES = [
  "#6366f1", // indigo
  "#22c55e", // verde
  "#eab308", // amarelo
  "#ef4444", // vermelho
  "#3b82f6", // azul
  "#a855f7", // roxo
  "#f97316", // laranja
  "#14b8a6", // teal
  "#ec4899", // rosa
  "#84cc16", // lime
];

export function GraficoPizzaMaterias({ materias }: GraficoPizzaMateriasProps) {
  const chartRef = useRef<HTMLDivElement>(null);

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
      canvas.width = img.width * 2;
      canvas.height = img.height * 2;
      ctx!.scale(2, 2);
      ctx!.fillStyle = "white";
      ctx!.fillRect(0, 0, canvas.width, canvas.height);
      ctx!.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);

      const link = document.createElement("a");
      link.download = "grafico-materias.png";
      link.href = canvas.toDataURL("image/png");
      link.click();
    };

    img.src = url;
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Desempenho por Materia</CardTitle>
        <Button variant="outline" size="sm" onClick={handleDownload}>
          <Download className="h-4 w-4 mr-2" />
          Download
        </Button>
      </CardHeader>
      <CardContent>
        <div ref={chartRef} className="w-full h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={materias}
                dataKey="mediaAcertos"
                nameKey="nome"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={({ name, value }) => `${name}: ${Number(value).toFixed(1)}`}
              >
                {materias.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={CORES[index % CORES.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => [Number(value).toFixed(2), "Media"]}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
