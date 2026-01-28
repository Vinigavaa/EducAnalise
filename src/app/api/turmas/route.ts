import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/auth-helper";
import prisma from "@/lib/prisma";
import { createTurmaSchema } from "@/lib/validations/turma";
import { z } from "zod";

export const GET = withAuth(async (_request: NextRequest, userId: string) => {
  try {
    const turmas = await prisma.turma.findMany({
      where: {
        userId,
      },
      include: {
        _count: {
          select: {
            alunos: true,
          },
        },
      },
      orderBy: {
        criado_em: "desc",
      },
    });

    return NextResponse.json(turmas, { status: 200 });
  } catch (error) {
    console.error("Erro ao buscar turmas:", error);
    return NextResponse.json(
      { error: "Erro ao buscar turmas" },
      { status: 500 }
    );
  }
});

export const POST = withAuth(async (request: NextRequest, userId: string) => {
  try {
    const body = await request.json();

    const validatedData = createTurmaSchema.parse(body);

    const novaTurma = await prisma.turma.create({
      data: {
        nome: validatedData.nome,
        ano_letivo: validatedData.ano_letivo,
        userId,
      },
      include: {
        _count: {
          select: {
            alunos: true,
          },
        },
      },
    });

    return NextResponse.json(novaTurma, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Dados inválidos", details: error.issues },
        { status: 400 }
      );
    }

    console.error("Erro ao criar turma:", error);
    return NextResponse.json(
      { error: "Erro ao criar turma" },
      { status: 500 }
    );
  }
});
