import { NextRequest, NextResponse } from "next/server";
import { withAluno } from "@/lib/auth-helper";
import prisma from "@/lib/prisma";
import { TipoProva } from "@/generated/prisma";

// GET /api/aluno/dashboard - Dashboard do aluno
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

    const notas = await prisma.nota.findMany({
      where: {
        alunoId,
        prova: {
          publicada: true,
        },
        simuladoMateriaId: null, // Apenas notas principais (não por matéria)
      },
      include: {
        prova: {
          select: {
            id: true,
            nome: true,
            data_prova: true,
            tipo: true,
            turmaId: true,
          },
        },
      },
      orderBy: {
        prova: {
          data_prova: "asc",
        },
      },
    });

    const simulado = await prisma.nota.findMany({
      where: {
        alunoId,
        prova:{
          publicada: true,
          tipo: 'SIMULADO'
        },
      },
    });

    const notaSimulado = simulado.map((n) => Number(n.valor_nota));
    const notasValores = notas.map((n) => Number(n.valor_nota));
    const mediaProvasComuns = notasValores.length > 0 ? notasValores.reduce((a, b) => a + b, 0) / notasValores.length : 0;
    const mediaSimulados = notaSimulado.length > 0 ? notaSimulado.reduce((a, b) => a + b, 0) / notaSimulado.length : 0;
    const maiorNota = notasValores.length > 0 ? Math.max(...notasValores) : 0;
    const menorNota = notasValores.length > 0 ? Math.min(...notasValores) : 0;

    let mediaGeral = 0;
    if(notasValores.length > 0  && notaSimulado.length > 0){
      mediaGeral = (mediaProvasComuns + mediaSimulados) / 2;
    } else if (notasValores.length > 0){
      mediaGeral= mediaProvasComuns
    } else if (notaSimulado.length > 0){
      mediaGeral = mediaSimulados
    }

    const evolucao = notas.map((n) => ({
      prova: n.prova.nome,
      nota: Number(n.valor_nota),
      data: n.prova.data_prova,
    }));

    // Buscar média da turma para comparação
    const provasPublicadas = await prisma.prova.findMany({
      where: {
        turmaId: aluno.turmaId,
        publicada: true,
      },
      include: {
        notas: {
          where: {
            simuladoMateriaId: null,
          },
        },
      },
      orderBy: {
        data_prova: "asc",
      },
    });

    const comparacaoTurma = provasPublicadas.map((prova) => {
      const notasDaProva = prova.notas.map((n) => Number(n.valor_nota));
      const mediaTurma =
        notasDaProva.length > 0
          ? notasDaProva.reduce((a, b) => a + b, 0) / notasDaProva.length
          : 0;
      const notaAluno = prova.notas.find((n) => n.alunoId === alunoId);

      return {
        prova: prova.nome,
        notaAluno: notaAluno ? Number(notaAluno.valor_nota) : null,
        mediaTurma: Math.round(mediaTurma * 100) / 100,
      };
    });

    // Calcular posição na turma
    const alunosDaTurma = await prisma.aluno.findMany({
      where: { turmaId: aluno.turmaId },
      include: {
        notas: {
          where: {
            prova: { publicada: true },
            simuladoMateriaId: null,
          },
        },
      },
    });

    const mediasAlunos = alunosDaTurma.map((a) => {
      const mediaAluno =
        a.notas.length > 0
          ? a.notas.reduce((sum, n) => sum + Number(n.valor_nota), 0) /
            a.notas.length
          : 0;
      return { alunoId: a.id, media: mediaAluno };
    });

    mediasAlunos.sort((a, b) => b.media - a.media);
    const posicaoTurma = mediasAlunos.findIndex((a) => a.alunoId === alunoId) + 1;

    // Desempenho por matéria (apenas simulados)
    const notasSimulado = await prisma.nota.findMany({
      where: {
        alunoId,
        prova: {
          publicada: true,
          tipo: TipoProva.SIMULADO,
        },
        simuladoMateriaId: { not: null },
      },
      include: {
        simuladoMateria: {
          include: {
            materia: true,
          },
        },
      },
    });

    const desempenhoMaterias: Record<string, { total: number; count: number }> = {};
    notasSimulado.forEach((nota) => {
      if (nota.simuladoMateria?.materia) {
        const nomeMateria = nota.simuladoMateria.materia.nome;
        if (!desempenhoMaterias[nomeMateria]) {
          desempenhoMaterias[nomeMateria] = { total: 0, count: 0 };
        }
        desempenhoMaterias[nomeMateria].total += Number(nota.valor_nota);
        desempenhoMaterias[nomeMateria].count += 1;
      }
    });

    const materias = Object.entries(desempenhoMaterias).map(([nome, data]) => ({
      materia: nome,
      media: Math.round((data.total / data.count) * 100) / 100,
    }));

    return NextResponse.json({
      aluno: {
        id: aluno.id,
        nome: aluno.nome,
        turma: aluno.turma.nome,
      },
      estatisticas: {
        mediaGeral: Math.round(mediaGeral * 100) / 100,
        maiorNota,
        menorNota,
        totalProvas: provasPublicadas.length,
        posicaoTurma,
        totalAlunosTurma: alunosDaTurma.length,
      },
      evolucao,
      comparacaoTurma,
      materias,
    });
  } catch (error) {
    console.error("Erro ao buscar dashboard:", error);
    return NextResponse.json(
      { error: "Erro ao buscar dashboard" },
      { status: 500 }
    );
  }
});
