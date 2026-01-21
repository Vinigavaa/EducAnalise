import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { LancarNotasForm } from "@/components/notas/lancar-notas-form";
import { TipoProva } from "@/generated/prisma";

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
            simuladoMaterias: {
                include: {
                    materia: {
                        select: {
                            id: true,
                            nome: true,
                        },
                    },
                },
                orderBy: {
                    materia: {
                        nome: 'asc'
                    }
                }
            },
            notas: {
                include: {
                    simuladoMateria: true,
                }
            }
        }
    });

    if (!prova) {
        redirect("/provas");
    }

    const isSimulado = prova.tipo === TipoProva.SIMULADO;

    // Mapear alunos com suas notas
    const alunosComNotas = prova.turma.alunos.map(aluno => {
        if (isSimulado) {
            // Para simulado, mapear notas por matéria
            const notasPorMateria: Record<string, number> = {};
            prova.notas
                .filter(n => n.alunoId === aluno.id && n.simuladoMateriaId)
                .forEach(n => {
                    if (n.simuladoMateriaId) {
                        notasPorMateria[n.simuladoMateriaId] = Number(n.valor_nota);
                    }
                });

            return {
                id: aluno.id,
                nome: aluno.nome,
                notasPorMateria,
            };
        } else {
            // Para prova comum, buscar nota única
            const notaExistente = prova.notas.find(n => n.alunoId === aluno.id && !n.simuladoMateriaId);
            return {
                id: aluno.id,
                nome: aluno.nome,
                nota: notaExistente ? Number(notaExistente.valor_nota) : undefined
            };
        }
    });

    const pesoProva = prova.peso.toNumber();

    // Mapear matérias do simulado
    const simuladoMaterias = prova.simuladoMaterias.map(sm => ({
        id: sm.id,
        materiaId: sm.materiaId,
        peso: Number(sm.peso),
        materia: {
            id: sm.materia.id,
            nome: sm.materia.nome,
        },
    }));

    return (
        <div className="container mx-auto py-6 space-y-6 pt-15">
            <div>
                <h1 className="text-2xl font-bold">Lançar Notas</h1>
                <p className="text-muted-foreground">
                    {prova.nome} - {prova.turma.nome}
                    {isSimulado && " (Simulado)"}
                </p>
            </div>

            <LancarNotasForm
                provaId={prova.id}
                alunos={alunosComNotas}
                pesoProva={pesoProva}
                tipoProva={prova.tipo}
                simuladoMaterias={simuladoMaterias}
            />
        </div>
    );
}
