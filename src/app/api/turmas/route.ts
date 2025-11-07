import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { createTurmaSchema } from "@/lib/validations/turma";
import { z } from "zod";

// GET /api/turmas - Listar todas as turmas do usuário autenticado
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || !session.user?.id) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }

    const turmas = await prisma.turma.findMany({
      where: {
        userId: session.user.id,
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
}

// POST /api/turmas - Criar nova turma
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || !session.user?.id) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Validar dados com Zod
    const validatedData = createTurmaSchema.parse(body);

    const novaTurma = await prisma.turma.create({
      data: {
        nome: validatedData.nome,
        ano_letivo: validatedData.ano_letivo,
        userId: session.user.id,
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
}
