import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/auth-helper";
import prisma from "@/lib/prisma";
import { createAlunoSchema } from "@/lib/validations/aluno";
import { z } from "zod";

// GET /api/alunos - Listar todos os alunos (opcionalmente filtrar por turma)
export const GET = withAuth(async (request: NextRequest, userId: string) => {
  try {
    const { searchParams } = new URL(request.url);
    const turmaId = searchParams.get("turmaId");

    // Se turmaId for fornecido, primeiro verificar se a turma pertence ao usuário
    if (turmaId) {
      const turma = await prisma.turma.findFirst({
        where: {
          id: turmaId,
          userId,
        },
      });

      if (!turma) {
        return NextResponse.json(
          { error: "Turma não encontrada" },
          { status: 404 }
        );
      }

      const alunos = await prisma.aluno.findMany({
        where: {
          turmaId: turmaId,
        },
        include: {
          turma: {
            select: {
              id: true,
              nome: true,
              ano_letivo: true,
            },
          },
        },
        orderBy: {
          nome: "asc",
        },
      });

      return NextResponse.json(alunos, { status: 200 });
    }

    // Listar todos os alunos das turmas do usuário
    const alunos = await prisma.aluno.findMany({
      where: {
        turma: {
          userId,
        },
      },
      include: {
        turma: {
          select: {
            id: true,
            nome: true,
            ano_letivo: true,
          },
        },
      },
      orderBy: {
        nome: "asc",
      },
    });

    return NextResponse.json(alunos, { status: 200 });
  } catch (error) {
    console.error("Erro ao buscar alunos:", error);
    return NextResponse.json(
      { error: "Erro ao buscar alunos" },
      { status: 500 }
    );
  }
});

// POST /api/alunos - Criar novo aluno
export const POST = withAuth(async (request: NextRequest, userId: string) => {
  try {
    const body = await request.json();

    // Validar dados com Zod
    const validatedData = createAlunoSchema.parse(body);

    // Verificar se a turma existe e pertence ao usuário
    const turma = await prisma.turma.findFirst({
      where: {
        id: validatedData.turmaId,
        userId,
      },
    });

    if (!turma) {
      return NextResponse.json(
        { error: "Turma não encontrada ou não pertence ao usuário" },
        { status: 404 }
      );
    }

    const novoAluno = await prisma.aluno.create({
      data: {
        nome: validatedData.nome,
        turmaId: validatedData.turmaId,
      },
      include: {
        turma: {
          select: {
            id: true,
            nome: true,
            ano_letivo: true,
          },
        },
      },
    });

    return NextResponse.json(novoAluno, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Dados inválidos", details: error.issues },
        { status: 400 }
      );
    }

    console.error("Erro ao criar aluno:", error);
    return NextResponse.json(
      { error: "Erro ao criar aluno" },
      { status: 500 }
    );
  }
});
