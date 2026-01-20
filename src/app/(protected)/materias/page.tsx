import { MateriaList } from "@/components/materia/materia-list";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { Plus } from "lucide-react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

export default async function MateriaPage() {
    const session = await auth();

    if (!session?.user?.id) {
        redirect("/");
    };

    const materia = prisma.materia.findMany({
        where: {
            userId: session.user.id,
        }, select: {
            id: true,
            nome: true,
        },
        orderBy: {
            criado_em: "desc",
        },
    });

    if (!materia) {
        notFound();
    };

    return (
        <div className="space-y-6 pt-15">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-zinc-800">Minhas Matérias</h1>
                    <p className="text-muted-foreground mt-1">Gerencie suas matérias</p>
                </div>
                <Button asChild className="bg-indigo-500">
                    <Link href="/turmas/nova">
                        <Plus className="mr-2 h-4 w-4" />
                        Nova Matéria
                    </Link>
                </Button>
            </div>
            <MateriaList materias={await materia} />
        </div>
    )
}