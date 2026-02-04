"use client";

import { useRef } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Cell, LabelList } from "recharts";
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
  type ChartConfig,
} from "@/components/ui/chart";
import { Button } from "@/components/ui/button";
import { Download, Users } from "lucide-react";

interface NotaAluno {
  alunoId: string;
  nome: string;
  nota: number;
}

interface GraficoBarrasNotasProps {
  notas: NotaAluno[];
  pesoProva: number;
  nomeProva?: string;
}

const chartConfig = {
  nota: {
    label: "Nota",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

export function GraficoBarrasNotas({ notas, pesoProva, nomeProva }: GraficoBarrasNotasProps) {
  const chartRef = useRef<HTMLDivElement>(null);

  const getCorBarra = (nota: number) => {
    const percentual = (nota / pesoProva) * 10;
    if (percentual < 5) return "#ef4444"; // vermelho
    if (percentual >= 6 && percentual <= 7) return "#eab308"; // amarelo
    if (percentual > 8) return "#22c55e"; // verde
    return "#3b82f6"; // azul para notas entre 5 e 6, e entre 7 e 8
  };

  // Calcular estatisticas
  const calcularEstatisticas = () => {
    if (notas.length === 0) return { aprovados: 0, reprovados: 0, mediaGeral: 0 };

    let aprovados = 0;
    let reprovados = 0;
    let somaNotas = 0;

    notas.forEach((aluno) => {
      const percentual = (aluno.nota / pesoProva) * 10;
      somaNotas += aluno.nota;
      if (percentual >= 6) aprovados++;
      else reprovados++;
    });

    return {
      aprovados,
      reprovados,
      mediaGeral: somaNotas / notas.length,
    };
  };

  const stats = calcularEstatisticas();

  const tituloGrafico = nomeProva
    ? `Notas dos alunos na avaliacao ${nomeProva}`
    : "Notas dos Alunos";

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
      const footerHeight = 80;
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

      // Desenhar rodape com estatisticas
      const footerY = img.height + (titleHeight / 2) + 15;
      ctx!.font = "12px Inter, sans-serif";
      ctx!.fillStyle = "#22c55e";
      ctx!.textAlign = "left";
      ctx!.fillText(`Aprovados: ${stats.aprovados}`, 20, footerY);
      ctx!.fillStyle = "#ef4444";
      ctx!.fillText(`Reprovados: ${stats.reprovados}`, 150, footerY);
      ctx!.fillStyle = "#71717a";
      ctx!.fillText(`Media geral: ${stats.mediaGeral.toFixed(2)} | Total: ${notas.length} aluno(s)`, 20, footerY + 18);

      URL.revokeObjectURL(url);

      const link = document.createElement("a");
      link.download = `grafico-notas${nomeProva ? `-${nomeProva.replace(/\s+/g, "-")}` : ""}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    };

    img.src = url;
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>{tituloGrafico}</CardTitle>
          <CardDescription>Desempenho individual na avaliacao</CardDescription>
        </div>
        <Button variant="outline" size="sm" onClick={handleDownload}>
          <Download className="h-4 w-4 mr-2" />
          Download
        </Button>
      </CardHeader>
      <CardContent>
        <div ref={chartRef}>
          <ChartContainer config={chartConfig} className="h-[350px] w-full">
            <BarChart
              accessibilityLayer
              data={notas}
              margin={{ top: 30, right: 12, left: 12, bottom: 60 }}
            >
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis
                dataKey="nome"
                tickLine={false}
                axisLine={false}
                angle={-45}
                textAnchor="end"
                interval={0}
                height={80}
                tick={{ fontSize: 11 }}
                tickMargin={8}
              />
              <YAxis
                domain={[0, pesoProva]}
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
                        return `Aluno: ${payload[0].payload.nome}`;
                      }
                      return "";
                    }}
                    formatter={(value) => [
                      typeof value === "number" ? value.toFixed(2) : "0.00",
                      " Nota",
                    ]}
                  />
                }
              />
              <Bar dataKey="nota" name="Nota" radius={[4, 4, 0, 0]}>
                <LabelList
                  dataKey="nota"
                  position="top"
                  formatter={(value: number) => value.toFixed(1)}
                  className="fill-foreground"
                  fontSize={11}
                />
                {notas.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getCorBarra(entry.nota)} />
                ))}
              </Bar>
            </BarChart>
          </ChartContainer>
        </div>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-4 leading-none font-medium">
          <span className="text-green-600 flex items-center gap-1">
            <Users className="h-4 w-4" />
            Aprovados: {stats.aprovados}
          </span>
          <span className="text-red-600 flex items-center gap-1">
            <Users className="h-4 w-4" />
            Reprovados: {stats.reprovados}
          </span>
        </div>
        <div className="text-muted-foreground leading-none">
          Media geral: {stats.mediaGeral.toFixed(2)} | Total de {notas.length} aluno(s)
        </div>
      </CardFooter>
    </Card>
  );
}
