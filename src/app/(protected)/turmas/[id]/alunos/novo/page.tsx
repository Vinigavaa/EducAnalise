import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlunoForm } from "@/components/alunos/aluno-form";

interface NovoAlunoPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function NovoAlunoPage(props: NovoAlunoPageProps) {
  const params = await props.params;
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/");
  }

  // Verificar se a turma existe e pertence ao usuário
  const turma = await prisma.turma.findFirst({
    where: {
      id: params.id,
      userId: session.user.id,
    },
  });

  if (!turma) {
    notFound();
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Adicionar Aluno</h1>
        <p className="text-muted-foreground mt-1">
          Adicione um novo aluno à turma {turma.nome}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informações do Aluno</CardTitle>
        </CardHeader>
        <CardContent>
          <AlunoForm turmaId={turma.id} />
        </CardContent>
      </Card>
    </div>
  );
}
