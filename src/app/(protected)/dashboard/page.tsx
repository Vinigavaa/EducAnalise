import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { DashboardContent } from "@/components/dashboard/dashboard-content";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/");
  }

  const turmas = await prisma.turma.findMany({
    where: {
      userId: session.user.id,
    },
    select: {
      id: true,
      nome: true,
      ano_letivo: true,
    },
    orderBy: {
      criado_em: "desc",
    },
  });

  return (
    <div className="space-y-6 pt-15">
      <div>
        <h1 className="text-3xl font-bold text-zinc-800">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Analise o desempenho dos alunos em provas e simulados
        </p>
      </div>

      <DashboardContent turmas={turmas} />
    </div>
  );
}