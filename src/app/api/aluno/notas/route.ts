import { NextRequest, NextResponse } from "next/server";
import { withAluno } from "@/lib/auth-helper";
import prisma from "@/lib/prisma";

export const GET = withAluno(async (
  _request: NextRequest,
  _userId: string,
  alunoId: string
) => {
  try {
    const aluno = await prisma.aluno.findUnique({
      where: { id: alunoId },
      include: {
        turma: true,
      },
    });

    if (!aluno) {
      return NextResponse.json(
        { error: "Aluno não encontrado" },
        { status: 404 }
      );
    }

    const provasPublicadas = await prisma.prova.findMany({
      where: {
        turmaId: aluno.turmaId,
        publicada: true,
      },
      include: {
        notas: {
          where: {
            alunoId,
          },
          include: {
            simuladoMateria: {
              include: {
                materia: true,
              },
            },
          },
        },
        simuladoMaterias: {
          include: {
            materia: true,
          },
        },
      },
      orderBy: {
        data_prova: "desc",
      },
    });

    const provasComNotas = provasPublicadas.map((prova) => {
      const notaPrincipal = prova.notas.find((n) => !n.simuladoMateriaId);

      const notasPorMateria = prova.notas
        .filter((n) => n.simuladoMateriaId)
        .map((n) => ({
          materia: n.simuladoMateria?.materia.nome || "",
          nota: Number(n.valor_nota),
          peso: n.simuladoMateria ? Number(n.simuladoMateria.peso) : 1,
        }));

      return {
        id: prova.id,
        nome: prova.nome,
        tipo: prova.tipo,
        data: prova.data_prova,
        peso: Number(prova.peso),
        nota: notaPrincipal ? Number(notaPrincipal.valor_nota) : null,
        dataPublicacao: prova.dataPublicacao,
        materias: notasPorMateria,
      };
    });

    const notasValidas = provasComNotas
      .filter((p) => p.nota !== null)
      .map((p) => p.nota as number);

    const estatisticas = {
      totalProvas: provasComNotas.length,
      provasComNota: notasValidas.length,
      media:
        notasValidas.length > 0
          ? Math.round(
              (notasValidas.reduce((a, b) => a + b, 0) / notasValidas.length) *
                100
            ) / 100
          : 0,
    };

    return NextResponse.json({
      turma: {
        id: aluno.turma.id,
        nome: aluno.turma.nome,
        anoLetivo: aluno.turma.ano_letivo,
      },
      provas: provasComNotas,
      estatisticas,
    });
  } catch (error) {
    console.error("Erro ao buscar notas:", error);
    return NextResponse.json(
      { error: "Erro ao buscar notas" },
      { status: 500 }
    );
  }
});
