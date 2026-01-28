import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlunoList } from "@/components/alunos/aluno-list";
import { DeleteTurmaDialog } from "@/components/turmas/delete-turma-dialog";
import { ArrowLeft, Edit, Plus, Users, Calendar } from "lucide-react";

interface TurmaPageProps {
  params: Promise<{ id: string; }>;
}

export default async function TurmaPage(props: TurmaPageProps) {
  const params = await props.params;
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/");
  }

  const turma = await prisma.turma.findFirst({
    where: {
      id: params.id,
      userId: session.user.id,
    },
    include: {
      alunos: {
        orderBy: {
          nome: "asc",
        },
      },
      _count: {
        select: {
          alunos: true,
          provas: true,
        },
      },
    },
  });

  if (!turma) {
    notFound();
  }

  return (
    <div className="space-y-6 pt-15">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/turmas">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <h1 className="text-3xl font-bold">{turma.nome}</h1>
          </div>
          <div className="flex items-center gap-4 text-muted-foreground ml-12">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>Ano Letivo: {turma.ano_letivo}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>{turma._count.alunos} aluno(s)</span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline" className="bg-indigo-500 text-white hover:bg-indigo-800 hover:text-white">
            <Link href={`/turmas/${turma.id}/editar`}>
              <Edit className="mr-2 h-4 w-4" />
              Editar Turma
            </Link>
          </Button>
          <DeleteTurmaDialog
            turmaId={turma.id}
            turmaNome={turma.nome}
            alunosCount={turma._count.alunos}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total de Alunos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{turma._count.alunos}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Provas Cadastradas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{turma._count.provas}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Ano Letivo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{turma.ano_letivo}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Alunos da Turma</CardTitle>
            <Button asChild size="sm">
              <Link href={`/turmas/${turma.id}/alunos/novo`}>
                <Plus className="mr-2 h-4 w-4" />
                Adicionar Aluno
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <AlunoList alunos={turma.alunos} turmaId={turma.id} />
        </CardContent>
      </Card>
    </div>
  );
}
