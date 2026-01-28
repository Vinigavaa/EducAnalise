import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { UserRole } from "@/generated/prisma";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  if (session.user.role === UserRole.ALUNO) {
    redirect("/aluno/dashboard");
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
