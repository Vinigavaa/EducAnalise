"use client";

import { useRef } from "react";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

interface NotaAluno {
  alunoId: string;
  nome: string;
  nota: number;
}

interface GraficoBarrasNotasProps {
  notas: NotaAluno[];
  pesoProva: number;
}

export function GraficoBarrasNotas({ notas, pesoProva }: GraficoBarrasNotasProps) {
  const chartRef = useRef<HTMLDivElement>(null);

  const getCorBarra = (nota: number) => {
    const percentual = (nota / pesoProva) * 10;
    if (percentual < 5) return "#ef4444"; // vermelho
    if (percentual >= 6 && percentual <= 7) return "#eab308"; // amarelo
    if (percentual > 8) return "#22c55e"; // verde
    return "#3b82f6"; // azul para notas entre 5 e 6, e entre 7 e 8
  };

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
      link.download = "grafico-notas.png";
      link.href = canvas.toDataURL("image/png");
      link.click();
    };

    img.src = url;
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Notas dos Alunos</CardTitle>
        <Button variant="outline" size="sm" onClick={handleDownload}>
          <Download className="h-4 w-4 mr-2" />
          Download
        </Button>
      </CardHeader>
      <CardContent>
        <div ref={chartRef} className="w-full h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={notas}
              margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="nome"
                angle={-45}
                textAnchor="end"
                interval={0}
                height={80}
                tick={{ fontSize: 12 }}
              />
              <YAxis domain={[0, pesoProva]} />
              <Tooltip
                formatter={(value: number) => [value.toFixed(2), "Nota"]}
                labelFormatter={(label) => `Aluno: ${label}`}
              />
              <Bar dataKey="nota" name="Nota">
                {notas.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getCorBarra(entry.nota)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
