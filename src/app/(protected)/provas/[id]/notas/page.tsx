import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { LancarNotasForm } from "@/components/notas/lancar-notas-form";

interface ProvaNotasProps {
    params: Promise<{
        id: string;
    }>;
}

export default async function ProvaNotasPage({ params }: ProvaNotasProps) {
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
                include: {
                    alunos: {
                        orderBy: {
                            nome: 'asc'
                        }
                    }
                }
            },
            notas: true
        }
    });

    if (!prova) {
        redirect("/provas");
    }

    const alunosComNotas = prova.turma.alunos.map(aluno => {
        const notaExistente = prova.notas.find(n => n.alunoId === aluno.id);
        return {
            id: aluno.id,
            nome: aluno.nome,
            nota: notaExistente ? Number(notaExistente.valor_nota) : undefined
        };
    });

    const pesoProva = prova.peso;

    return (
        <div className="container mx-auto py-6 space-y-6 pt-15">
            <div>
                <h1 className="text-2xl font-bold">Lançar Notas</h1>
                <p className="text-muted-foreground">
                    {prova.nome} - {prova.turma.nome}
                </p>
            </div>

            <LancarNotasForm
                provaId={prova.id}
                alunos={alunosComNotas}
                pesoProva={pesoProva}
            />
        </div>
    );
}