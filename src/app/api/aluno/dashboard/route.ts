import { NextRequest, NextResponse } from "next/server";
import { withAluno } from "@/lib/auth-helper";
import prisma from "@/lib/prisma";
import { TipoProva } from "@/generated/prisma";

// Função auxiliar para calcular média ponderada de um simulado para um aluno
function calcularMediaSimulado(
  simuladoMaterias: Array<{
    peso: { toNumber?: () => number } | number;
    notas: Array<{
      alunoId: string;
      valor_nota: { toNumber?: () => number } | number;
    }>;
  }>,
  alunoId: string
): number | null {
  let somaNotas = 0;
  let somaPesos = 0;

  for (const sm of simuladoMaterias) {
    const pesoMateria = typeof sm.peso === 'object' && sm.peso.toNumber
      ? sm.peso.toNumber()
      : Number(sm.peso);
    const notaAluno = sm.notas.find((n) => n.alunoId === alunoId);

    if (notaAluno) {
      const valorNota = typeof notaAluno.valor_nota === 'object' && notaAluno.valor_nota.toNumber
        ? notaAluno.valor_nota.toNumber()
        : Number(notaAluno.valor_nota);
      somaNotas += valorNota * pesoMateria;
      somaPesos += pesoMateria;
    }
  }

  if (somaPesos === 0) return null;
  return somaNotas / somaPesos;
}

// Função auxiliar para calcular média da turma em um simulado
function calcularMediaTurmaSimulado(
  simuladoMaterias: Array<{
    peso: { toNumber?: () => number } | number;
    notas: Array<{
      alunoId: string;
      valor_nota: { toNumber?: () => number } | number;
    }>;
  }>
): number {
  const alunosMap = new Map<string, { somaNotas: number; somaPesos: number }>();

  for (const sm of simuladoMaterias) {
    const pesoMateria = typeof sm.peso === 'object' && sm.peso.toNumber
      ? sm.peso.toNumber()
      : Number(sm.peso);

    for (const nota of sm.notas) {
      const valorNota = typeof nota.valor_nota === 'object' && nota.valor_nota.toNumber
        ? nota.valor_nota.toNumber()
        : Number(nota.valor_nota);

      const existing = alunosMap.get(nota.alunoId);
      if (existing) {
        existing.somaNotas += valorNota * pesoMateria;
        existing.somaPesos += pesoMateria;
      } else {
        alunosMap.set(nota.alunoId, {
          somaNotas: valorNota * pesoMateria,
          somaPesos: pesoMateria,
        });
      }
    }
  }

  const medias = Array.from(alunosMap.values())
    .filter((data) => data.somaPesos > 0)
    .map((data) => data.somaNotas / data.somaPesos);

  if (medias.length === 0) return 0;
  return medias.reduce((a, b) => a + b, 0) / medias.length;
}

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

    // Buscar todas as provas publicadas da turma (COMUM e SIMULADO)
    const provasPublicadas = await prisma.prova.findMany({
      where: {
        turmaId: aluno.turmaId,
        publicada: true,
      },
      include: {
        notas: {
          where: {
            simuladoMateriaId: null, // Notas diretas (provas comuns)
          },
        },
        simuladoMaterias: {
          include: {
            materia: true,
            notas: true,
          },
        },
      },
      orderBy: {
        data_prova: "asc",
      },
    });

    // Calcular notas consolidadas do aluno (COMUM = nota direta, SIMULADO = média ponderada)
    const notasConsolidadas: Array<{
      provaId: string;
      provaNome: string;
      tipo: TipoProva;
      nota: number;
      data: Date | null;
    }> = [];

    for (const prova of provasPublicadas) {
      if (prova.tipo === TipoProva.COMUM) {
        const notaAluno = prova.notas.find((n) => n.alunoId === alunoId);
        if (notaAluno) {
          notasConsolidadas.push({
            provaId: prova.id,
            provaNome: prova.nome,
            tipo: prova.tipo,
            nota: Number(notaAluno.valor_nota),
            data: prova.data_prova,
          });
        }
      } else {
        // SIMULADO: calcular média ponderada
        const mediaSimulado = calcularMediaSimulado(prova.simuladoMaterias, alunoId);
        if (mediaSimulado !== null) {
          notasConsolidadas.push({
            provaId: prova.id,
            provaNome: prova.nome,
            tipo: prova.tipo,
            nota: Number(mediaSimulado.toFixed(2)),
            data: prova.data_prova,
          });
        }
      }
    }

    // Calcular estatísticas
    const todasNotas = notasConsolidadas.map((n) => n.nota);
    const mediaGeral = todasNotas.length > 0
      ? todasNotas.reduce((a, b) => a + b, 0) / todasNotas.length
      : 0;
    const maiorNota = todasNotas.length > 0 ? Math.max(...todasNotas) : 0;
    const menorNota = todasNotas.length > 0 ? Math.min(...todasNotas) : 0;

    // Evolução das notas (últimas 6 provas)
    const evolucao = notasConsolidadas.slice(-6).map((n) => ({
      prova: n.provaNome,
      nota: n.nota,
      data: n.data,
      tipo: n.tipo,
    }));

    // Comparação com a turma (incluindo simulados)
    const comparacaoTurma = provasPublicadas.map((prova) => {
      let mediaTurma = 0;
      let notaAluno: number | null = null;

      if (prova.tipo === TipoProva.COMUM) {
        const notasDaProva = prova.notas.map((n) => Number(n.valor_nota));
        mediaTurma = notasDaProva.length > 0
          ? notasDaProva.reduce((a, b) => a + b, 0) / notasDaProva.length
          : 0;
        const notaAlunoObj = prova.notas.find((n) => n.alunoId === alunoId);
        notaAluno = notaAlunoObj ? Number(notaAlunoObj.valor_nota) : null;
      } else {
        // SIMULADO
        mediaTurma = calcularMediaTurmaSimulado(prova.simuladoMaterias);
        notaAluno = calcularMediaSimulado(prova.simuladoMaterias, alunoId);
        if (notaAluno !== null) {
          notaAluno = Number(notaAluno.toFixed(2));
        }
      }

      return {
        prova: prova.nome,
        tipo: prova.tipo,
        notaAluno,
        mediaTurma: Math.round(mediaTurma * 100) / 100,
      };
    });

    // Calcular posição na turma (considerando todas as provas com notas consolidadas)
    const alunosDaTurma = await prisma.aluno.findMany({
      where: { turmaId: aluno.turmaId },
    });

    const mediasAlunos = await Promise.all(
      alunosDaTurma.map(async (a) => {
        const notasAluno: number[] = [];

        for (const prova of provasPublicadas) {
          if (prova.tipo === TipoProva.COMUM) {
            const nota = prova.notas.find((n) => n.alunoId === a.id);
            if (nota) {
              notasAluno.push(Number(nota.valor_nota));
            }
          } else {
            const media = calcularMediaSimulado(prova.simuladoMaterias, a.id);
            if (media !== null) {
              notasAluno.push(media);
            }
          }
        }

        const mediaAluno = notasAluno.length > 0
          ? notasAluno.reduce((sum, n) => sum + n, 0) / notasAluno.length
          : 0;

        return { alunoId: a.id, media: mediaAluno };
      })
    );

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
        maiorNota: Math.round(maiorNota * 100) / 100,
        menorNota: Math.round(menorNota * 100) / 100,
        totalProvas: notasConsolidadas.length,
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
