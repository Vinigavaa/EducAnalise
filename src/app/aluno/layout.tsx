import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AlunoHeader } from "@/components/aluno/aluno-header";
import { UserRole } from "@/generated/prisma";

export default async function AlunoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  if (session.user.role !== UserRole.ALUNO) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-background">
      <AlunoHeader alunoNome={session.user.name || "Aluno"} />
      <main className="container mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
