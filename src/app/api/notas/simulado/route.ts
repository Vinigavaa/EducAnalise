import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/auth-helper";
import prisma from "@/lib/prisma";
import { salvarNotasSimuladoSchema } from "@/lib/validations/nota";
import { z } from "zod";
import { TipoProva } from "@/generated/prisma/enums";

// POST /api/notas/simulado - Salvar notas de um simulado
export const POST = withAuth(async (request: NextRequest, userId: string) => {
  try {
    const body = await request.json();
    const { provaId, notas } = salvarNotasSimuladoSchema.parse(body);

    // Verificar se a prova existe, pertence ao usuário e é um simulado
    const prova = await prisma.prova.findFirst({
      where: { id: provaId, turma: { userId } },
      include: {
        simuladoMaterias: true,
      },
    });

    if (!prova) {
      return NextResponse.json(
        { error: "Prova não encontrada" },
        { status: 404 }
      );
    }

    if (prova.tipo !== TipoProva.SIMULADO) {
      return NextResponse.json(
        { error: "Esta prova não é um simulado" },
        { status: 400 }
      );
    }

    // Verificar se todas as matérias do simulado existem
    const simuladoMateriasIds = prova.simuladoMaterias.map((sm) => sm.id);

    for (const notaAluno of notas) {
      for (const notaMateria of notaAluno.notasPorMateria) {
        if (!simuladoMateriasIds.includes(notaMateria.simuladoMateriaId)) {
          return NextResponse.json(
            { error: "Matéria não encontrada no simulado" },
            { status: 400 }
          );
        }
      }
    }

    // Usar transação para salvar todas as notas
    await prisma.$transaction(async (tx) => {
      for (const notaAluno of notas) {
        for (const notaMateria of notaAluno.notasPorMateria) {
          // Verificar se já existe uma nota para este aluno/matéria
          const notaExistente = await tx.nota.findFirst({
            where: {
              alunoId: notaAluno.alunoId,
              provaId,
              simuladoMateriaId: notaMateria.simuladoMateriaId,
            },
          });

          if (notaExistente) {
            // Atualizar nota existente
            await tx.nota.update({
              where: { id: notaExistente.id },
              data: { valor_nota: notaMateria.valor },
            });
          } else {
            // Criar nova nota
            await tx.nota.create({
              data: {
                alunoId: notaAluno.alunoId,
                provaId,
                simuladoMateriaId: notaMateria.simuladoMateriaId,
                valor_nota: notaMateria.valor,
              },
            });
          }
        }
      }
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Dados inválidos", details: error.issues },
        { status: 400 }
      );
    }

    console.error("Erro ao salvar notas do simulado:", error);
    return NextResponse.json(
      { error: "Erro ao salvar notas" },
      { status: 500 }
    );
  }
});
