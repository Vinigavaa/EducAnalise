"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { User, Save } from "lucide-react";
import { Decimal } from "@prisma/client/runtime/library";

interface Aluno {
  id: string;
  nome: string;
  nota?: number;
}

interface LancarNotasFormProps {
  provaId: string;
  alunos: Aluno[];
  pesoProva: Decimal;
}

export function LancarNotasForm({ provaId, alunos, pesoProva }: LancarNotasFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notas, setNotas] = useState<Record<string, string>>(() =>
    Object.fromEntries(alunos.map((a) => [a.id, a.nota?.toString() ?? ""]))
  );

  const handleNotaChange = (alunoId: string, valor: string) => {
    const valorLimpo = valor.replace(/[^0-9.,]/g, "").replace(",", ".");
    if (valorLimpo === "" || (Number(valorLimpo) >= 0 && Number(valorLimpo) <= pesoProva.toNumber())) {
      setNotas((prev) => ({ ...prev, [alunoId]: valorLimpo }));
    }
  };

  const handleSalvar = async () => {
    const notasParaSalvar = Object.entries(notas)
      .filter(([, valor]) => valor !== "")
      .map(([alunoId, valor]) => ({ alunoId, valor: Number(valor) }));

    if (notasParaSalvar.length === 0) {
      setError("Nenhuma nota foi preenchida");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/notas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provaId, notas: notasParaSalvar }),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || "Erro ao salvar notas");
      }

      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao salvar notas");
    } finally {
      setIsLoading(false);
    }
  };

  if (alunos.length === 0) {
    return (
      <div className="text-center py-8 border-2 border-dashed rounded-lg">
        <p className="text-muted-foreground text-base mb-1">
          Nenhum aluno cadastrado
        </p>
        <p className="text-sm text-muted-foreground">
          Adicione alunos à turma para lançar notas
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-md bg-red-50 p-4 text-sm text-red-800">
          {error}
        </div>
      )}

      <Button
        onClick={handleSalvar}
        disabled={isLoading}
        size="lg"
        className="w-full h-14 text-lg font-semibold"
      >
        <Save className="mr-2 h-5 w-5" />
        {isLoading ? "Salvando..." : "Salvar Notas"}
      </Button>

      <div className="space-y-3">
        {alunos.map((aluno) => (
          <Card key={aluno.id} className="hover:shadow-md transition-shadow">
            <CardContent className="py-4">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <User className="h-6 w-6 text-primary" />
                </div>
                <p className="flex-1 font-medium text-lg truncate">{aluno.nome}</p>
                <Input
                  type="text"
                  inputMode="decimal"
                  placeholder="0.00"
                  value={notas[aluno.id]}
                  onChange={(e) => handleNotaChange(aluno.id, e.target.value)}
                  disabled={isLoading}
                  className="w-24 h-12 text-center text-lg font-semibold"
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
