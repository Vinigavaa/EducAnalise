import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/auth-helper";
import prisma from "@/lib/prisma";
import { salvarNotasSchema } from "@/lib/validations/nota";
import { z } from "zod";

// POST /api/notas - Salvar notas de uma prova
export const POST = withAuth(async (request: NextRequest, userId: string) => {
  try {
    const body = await request.json();
    const { provaId, notas } = salvarNotasSchema.parse(body);

    const prova = await prisma.prova.findFirst({
      where: { id: provaId, turma: { userId } },
    });

    if (!prova) {
      return NextResponse.json(
        { error: "Prova não encontrada" },
        { status: 404 }
      );
    }

    for (const nota of notas) {
      const notaExistente = await prisma.nota.findFirst({
        where: { alunoId: nota.alunoId, provaId },
      });

      if (notaExistente) {
        await prisma.nota.update({
          where: { id: notaExistente.id },
          data: { valor_nota: nota.valor },
        });
      } else {
        await prisma.nota.create({
          data: {
            alunoId: nota.alunoId,
            provaId,
            valor_nota: nota.valor,
          },
        });
      }
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Dados inválidos", details: error.issues },
        { status: 400 }
      );
    }

    console.error("Erro ao salvar notas:", error);
    return NextResponse.json(
      { error: "Erro ao salvar notas" },
      { status: 500 }
    );
  }
});
