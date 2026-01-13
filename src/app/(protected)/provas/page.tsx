import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { ProvaList } from "@/components/provas/prova-list";

export default async function ProvasPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/");
  }

  const provasRaw = await prisma.prova.findMany({
    where: {
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
    orderBy: {
      data_prova: "desc",
    },
  });

  // Converter Decimal para number para serialização
  const provas = provasRaw.map(prova => ({
    ...prova,
    peso: Number(prova.peso),
  }));

  return (
    <div className="space-y-6 pt-15">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-zinc-800">Minhas Provas</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie suas Provas
          </p>
        </div>
        <Button asChild className="bg-indigo-500">
          <Link href="/provas/nova">
            <Plus className="mr-2 h-4 w-4" />
            Nova Prova
          </Link>
        </Button>
      </div>

      <ProvaList provas={provas} />
    </div>
  );
}
