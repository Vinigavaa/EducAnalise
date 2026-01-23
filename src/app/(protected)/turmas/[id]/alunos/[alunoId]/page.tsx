import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GerenciarCredenciais } from "@/components/alunos/gerenciar-credenciais";
import { DeleteAlunoDialog } from "@/components/alunos/delete-aluno-dialog";
import { ArrowLeft, User, GraduationCap, BookOpen } from "lucide-react";

interface AlunoDetalhesPageProps {
  params: Promise<{
    id: string;
    alunoId: string;
  }>;
}

export default async function AlunoDetalhesPage({ params }: AlunoDetalhesPageProps) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/");
  }

  const { id: turmaId, alunoId } = await params;

  const aluno = await prisma.aluno.findFirst({
    where: {
      id: alunoId,
      turmaId,
      turma: {
        userId: session.user.id,
      },
    },
    include: {
      turma: {
        select: {
          id: true,
          nome: true,
          ano_letivo: true,
        },
      },
      notas: {
        include: {
          prova: {
            select: {
              id: true,
              nome: true,
              data_prova: true,
            },
          },
        },
        orderBy: {
          data_lancada: "desc",
        },
        take: 5,
      },
      _count: {
        select: {
          notas: true,
        },
      },
    },
  });

  if (!aluno) {
    notFound();
  }

  // Calcular média do aluno
  const notasComValor = aluno.notas.filter((n) => !n.simuladoMateriaId);
  const mediaAluno =
    notasComValor.length > 0
      ? notasComValor.reduce((sum, n) => sum + Number(n.valor_nota), 0) /
        notasComValor.length
      : 0;

  return (
    <div className="space-y-6 pt-15">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/turmas/${turmaId}`}>
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-zinc-800">{aluno.nome}</h1>
          <p className="text-muted-foreground mt-1">
            Aluno da turma {aluno.turma.nome}
          </p>
        </div>
        <DeleteAlunoDialog alunoId={aluno.id} alunoNome={aluno.nome} />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Informacoes do Aluno
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Nome</p>
              <p className="text-lg">{aluno.nome}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Turma</p>
              <p className="text-lg">{aluno.turma.nome}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Ano Letivo
              </p>
              <p className="text-lg">{aluno.turma.ano_letivo}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5" />
              Estatisticas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Total de Notas
              </p>
              <p className="text-lg">{aluno._count.notas}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Media Geral
              </p>
              <p className="text-lg">{mediaAluno.toFixed(2)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <GerenciarCredenciais alunoId={aluno.id} alunoNome={aluno.nome} />

      {aluno.notas.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Ultimas Notas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {aluno.notas
                .filter((n) => !n.simuladoMateriaId)
                .slice(0, 5)
                .map((nota) => (
                  <div
                    key={nota.id}
                    className="flex justify-between items-center py-2 border-b last:border-0"
                  >
                    <div>
                      <p className="font-medium">{nota.prova.nome}</p>
                      <p className="text-sm text-muted-foreground">
                        {nota.prova.data_prova
                          ? new Date(nota.prova.data_prova).toLocaleDateString(
                              "pt-BR"
                            )
                          : "Data nao definida"}
                      </p>
                    </div>
                    <span className="text-lg font-bold">
                      {Number(nota.valor_nota).toFixed(1)}
                    </span>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
