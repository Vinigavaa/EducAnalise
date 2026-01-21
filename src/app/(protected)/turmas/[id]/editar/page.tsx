import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TurmaForm } from "@/components/turmas/turma-form";

interface EditarTurmaPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditarTurmaPage(props: EditarTurmaPageProps) {
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
  });

  if (!turma) {
    notFound();
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 pt-15">
      <div>
        <h1 className="text-3xl font-bold">Editar Turma</h1>
        <p className="text-muted-foreground mt-1">
          Atualize as informações da turma {turma.nome}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informações da Turma</CardTitle>
        </CardHeader>
        <CardContent>
          <TurmaForm turma={turma} />
        </CardContent>
      </Card>
    </div>
  );
}
