import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { TurmaList } from "@/components/turmas/turma-list";
import { Plus } from "lucide-react";

export default async function TurmasPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/");
  }

  const turmas = await prisma.turma.findMany({
    where: {
      userId: session.user.id,
    },
    include: {
      _count: {
        select: {
          alunos: true,
        },
      },
    },
    orderBy: {
      criado_em: "desc",
    },
  });

  return (
    <div className="space-y-6 pt-15">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-zinc-800">Minhas Turmas</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie suas turmas e alunos
          </p>
        </div>
        <Button asChild className="bg-indigo-500">
          <Link href="/turmas/nova">
            <Plus className="mr-2 h-4 w-4" />
            Nova Turma
          </Link>
        </Button>
      </div>

      <TurmaList turmas={turmas} />
    </div>
  );
}
