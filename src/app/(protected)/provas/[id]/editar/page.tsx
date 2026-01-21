import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { ProvaForm } from "@/components/provas/prova-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface EditarProvaPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditarProvaPage({ params }: EditarProvaPageProps) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/");
  }

  const { id } = await params;

  const prova = await prisma.prova.findFirst({
    where: {
      id,
      turma: {
        userId: session.user.id,
      },
    },
    include: {
      turma: {
        select: {
          id: true,
          nome: true,
        },
      },
    },
  });

  if (!prova) {
    redirect("/provas");
  }

  // Converter Decimal para number
  const provaFormatted = {
    ...prova,
    peso: Number(prova.peso),
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pt-15">
      <div>
        <h1 className="text-3xl font-bold">Editar Prova</h1>
        <p className="text-muted-foreground mt-1">
          Edite as informações da prova
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informações da Prova</CardTitle>
        </CardHeader>
        <CardContent>
          <ProvaForm prova={provaFormatted} />
        </CardContent>
      </Card>
    </div>
  );
}
