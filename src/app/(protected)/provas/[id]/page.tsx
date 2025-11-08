import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Calendar, Users, FileText, TrendingUp, Pencil } from "lucide-react";
import { DeleteProvaDialog } from "@/components/provas/delete-prova-dialog";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ProvaDetalhesPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ProvaDetalhesPage({ params }: ProvaDetalhesPageProps) {
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
          ano_letivo: true,
        },
      },
      _count: {
        select: {
          notas: true,
        },
      },
    },
  });

  if (!prova) {
    redirect("/provas");
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/provas">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-zinc-800">{prova.nome}</h1>
          <p className="text-muted-foreground mt-1">
            Detalhes da prova
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href={`/provas/${prova.id}/editar`}>
              <Pencil className="mr-2 h-4 w-4" />
              Editar
            </Link>
          </Button>
          <DeleteProvaDialog provaId={prova.id} provaNome={prova.nome} />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Informações da Prova
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Nome</p>
              <p className="text-lg">{prova.nome}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Tipo</p>
              <p className="text-lg">{prova.tipo}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Peso</p>
              <p className="text-lg">{Number(prova.peso)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Data da Prova</p>
              <p className="text-lg">
                {prova.data_prova
                  ? format(new Date(prova.data_prova), "PPP", { locale: ptBR })
                  : "Não definida"}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Informações da Turma
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Turma</p>
              <p className="text-lg">{prova.turma.nome}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Ano Letivo</p>
              <p className="text-lg">{prova.ano_letivo}</p>
            </div>
            <div className="pt-3">
              <Button variant="outline" asChild className="w-full">
                <Link href={`/turmas/${prova.turmaId}`}>
                  <Users className="mr-2 h-4 w-4" />
                  Ver Turma
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Estatísticas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Total de Notas</p>
              <p className="text-3xl font-bold">{prova._count.notas}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
