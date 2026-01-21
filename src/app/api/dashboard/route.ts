import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/auth-helper";
import prisma from "@/lib/prisma";
import { TipoProva } from "@/generated/prisma";

// GET /api/dashboard?turmaId=X&provaId=Y - Buscar dados do dashboard
export const GET = withAuth(async (request: NextRequest, userId: string) => {
  try {
    const { searchParams } = new URL(request.url);
    const turmaId = searchParams.get("turmaId");
    const provaId = searchParams.get("provaId");

    if (!turmaId || !provaId) {
      return NextResponse.json(
        { error: "turmaId e provaId são obrigatórios" },
        { status: 400 }
      );
    }

    // Verificar se a turma pertence ao usuário
    const turma = await prisma.turma.findFirst({
      where: { id: turmaId, userId },
    });

    if (!turma) {
      return NextResponse.json(
        { error: "Turma não encontrada" },
        { status: 404 }
      );
    }

    // Buscar a prova selecionada com notas
    const prova = await prisma.prova.findFirst({
      where: { id: provaId, turmaId },
      include: {
        notas: {
          include: {
            aluno: { select: { id: true, nome: true } },
            simuladoMateria: {
              include: {
                materia: { select: { id: true, nome: true } },
              },
            },
          },
        },
        simuladoMaterias: {
          include: {
            materia: { select: { id: true, nome: true } },
            notas: {
              include: {
                aluno: { select: { id: true, nome: true } },
              },
            },
          },
        },
      },
    });

    if (!prova) {
      return NextResponse.json(
        { error: "Prova não encontrada" },
        { status: 404 }
      );
    }

    // Calcular notas por aluno
    let notasPorAluno: { alunoId: string; nome: string; nota: number }[] = [];

    if (prova.tipo === TipoProva.SIMULADO) {
      // Para simulado, calcular média ponderada das matérias por aluno
      const alunosMap = new Map<string, { nome: string; somaNotas: number; somaPesos: number }>();

      for (const sm of prova.simuladoMaterias) {
        const pesoMateria = Number(sm.peso);
        for (const nota of sm.notas) {
          const existing = alunosMap.get(nota.alunoId);
          if (existing) {
            existing.somaNotas += Number(nota.valor_nota) * pesoMateria;
            existing.somaPesos += pesoMateria;
          } else {
            alunosMap.set(nota.alunoId, {
              nome: nota.aluno.nome,
              somaNotas: Number(nota.valor_nota) * pesoMateria,
              somaPesos: pesoMateria,
            });
          }
        }
      }

      notasPorAluno = Array.from(alunosMap.entries()).map(([alunoId, data]) => ({
        alunoId,
        nome: data.nome,
        nota: data.somaPesos > 0 ? Number((data.somaNotas / data.somaPesos).toFixed(2)) : 0,
      }));
    } else {
      // Prova comum
      notasPorAluno = prova.notas.map((nota) => ({
        alunoId: nota.alunoId,
        nome: nota.aluno.nome,
        nota: Number(nota.valor_nota),
      }));
    }

    // Calcular média geral
    const mediaGeral =
      notasPorAluno.length > 0
        ? Number(
            (notasPorAluno.reduce((acc, n) => acc + n.nota, 0) / notasPorAluno.length).toFixed(2)
          )
        : 0;

    // Encontrar aluno com maior nota
    const alunoMaiorNota =
      notasPorAluno.length > 0
        ? notasPorAluno.reduce((max, n) => (n.nota > max.nota ? n : max), notasPorAluno[0])
        : null;

    // Calcular porcentagem de melhora comparado à prova anterior
    let porcentagemMelhora: number | null = null;
    let provaAnteriorNome: string | null = null;

    // Buscar prova anterior da mesma turma e do mesmo tipo (por data da prova ou criação)
    // Provas comuns só comparam com provas comuns, simulados só comparam com simulados
    const provaAnterior = await prisma.prova.findFirst({
      where: {
        turmaId,
        id: { not: provaId },
        tipo: prova.tipo, // Filtrar pelo mesmo tipo de prova
        ...(prova.data_prova
          ? { data_prova: { lt: prova.data_prova } }
          : { criado_em: { lt: prova.criado_em } }),
      },
      orderBy: prova.data_prova ? { data_prova: "desc" } : { criado_em: "desc" },
      include: {
        notas: true,
        simuladoMaterias: {
          include: {
            notas: true,
          },
        },
      },
    });

    if (provaAnterior) {
      provaAnteriorNome = provaAnterior.nome;

      let mediaAnterior = 0;
      if (provaAnterior.tipo === TipoProva.SIMULADO) {
        const alunosMapAnterior = new Map<string, { somaNotas: number; somaPesos: number }>();
        for (const sm of provaAnterior.simuladoMaterias) {
          const pesoMateria = Number(sm.peso);
          for (const nota of sm.notas) {
            const existing = alunosMapAnterior.get(nota.alunoId);
            if (existing) {
              existing.somaNotas += Number(nota.valor_nota) * pesoMateria;
              existing.somaPesos += pesoMateria;
            } else {
              alunosMapAnterior.set(nota.alunoId, {
                somaNotas: Number(nota.valor_nota) * pesoMateria,
                somaPesos: pesoMateria,
              });
            }
          }
        }
        const notasAnteriores = Array.from(alunosMapAnterior.values()).map(
          (data) => (data.somaPesos > 0 ? data.somaNotas / data.somaPesos : 0)
        );
        mediaAnterior =
          notasAnteriores.length > 0
            ? notasAnteriores.reduce((a, b) => a + b, 0) / notasAnteriores.length
            : 0;
      } else {
        const notasAnteriores = provaAnterior.notas.map((n) => Number(n.valor_nota));
        mediaAnterior =
          notasAnteriores.length > 0
            ? notasAnteriores.reduce((a, b) => a + b, 0) / notasAnteriores.length
            : 0;
      }

      if (mediaAnterior > 0) {
        porcentagemMelhora = Number((((mediaGeral - mediaAnterior) / mediaAnterior) * 100).toFixed(2));
      }
    }

    // Calcular acertos por matéria (para simulados)
    let materiasPorAcertos: { materiaId: string; nome: string; mediaAcertos: number }[] = [];

    if (prova.tipo === TipoProva.SIMULADO) {
      materiasPorAcertos = prova.simuladoMaterias.map((sm) => {
        const notasMateria = sm.notas.map((n) => Number(n.valor_nota));
        const mediaMateria =
          notasMateria.length > 0
            ? notasMateria.reduce((a, b) => a + b, 0) / notasMateria.length
            : 0;
        return {
          materiaId: sm.materiaId,
          nome: sm.materia.nome,
          mediaAcertos: Number(mediaMateria.toFixed(2)),
        };
      });

      // Ordenar por média de acertos (maior para menor)
      materiasPorAcertos.sort((a, b) => b.mediaAcertos - a.mediaAcertos);
    }

    return NextResponse.json({
      prova: {
        id: prova.id,
        nome: prova.nome,
        tipo: prova.tipo,
        peso: Number(prova.peso),
        data_prova: prova.data_prova,
      },
      notasPorAluno,
      mediaGeral,
      alunoMaiorNota,
      porcentagemMelhora,
      provaAnteriorNome,
      materiasPorAcertos,
    });
  } catch (error) {
    console.error("Erro ao buscar dados do dashboard:", error);
    return NextResponse.json(
      { error: "Erro ao buscar dados do dashboard" },
      { status: 500 }
    );
  }
});
