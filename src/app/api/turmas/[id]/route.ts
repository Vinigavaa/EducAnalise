import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/auth-helper";
import prisma from "@/lib/prisma";
import { updateTurmaSchema } from "@/lib/validations/turma";
import { z } from "zod";

// GET /api/turmas/[id] - Buscar uma turma específica
export const GET = withAuth(async (
  _request: NextRequest,
  userId: string,
  props: { params: Promise<{ id: string }> }
) => {
  const params = await props.params;
  try {
    const turma = await prisma.turma.findFirst({
      where: {
        id: params.id,
        userId,
      },
      include: {
        alunos: {
          orderBy: {
            nome: "asc",
          },
        },
        _count: {
          select: {
            alunos: true,
            provas: true,
          },
        },
      },
    });

    if (!turma) {
      return NextResponse.json(
        { error: "Turma não encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json(turma, { status: 200 });
  } catch (error) {
    console.error("Erro ao buscar turma:", error);
    return NextResponse.json(
      { error: "Erro ao buscar turma" },
      { status: 500 }
    );
  }
});

// PUT /api/turmas/[id] - Atualizar uma turma
export const PUT = withAuth(async (
  request: NextRequest,
  userId: string,
  props: { params: Promise<{ id: string }> }
) => {
  const params = await props.params;
  try {
    // Verificar se a turma pertence ao usuário
    const turmaExistente = await prisma.turma.findFirst({
      where: {
        id: params.id,
        userId,
      },
    });

    if (!turmaExistente) {
      return NextResponse.json(
        { error: "Turma não encontrada" },
        { status: 404 }
      );
    }

    const body = await request.json();

    // Validar dados com Zod
    const validatedData = updateTurmaSchema.parse(body);

    const turmaAtualizada = await prisma.turma.update({
      where: {
        id: params.id,
      },
      data: {
        ...(validatedData.nome && { nome: validatedData.nome }),
        ...(validatedData.ano_letivo && { ano_letivo: validatedData.ano_letivo }),
      },
      include: {
        _count: {
          select: {
            alunos: true,
          },
        },
      },
    });

    return NextResponse.json(turmaAtualizada, { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Dados inválidos"},
        { status: 400 }
      );
    }

    console.error("Erro ao atualizar turma:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar turma" },
      { status: 500 }
    );
  }
});

// DELETE /api/turmas/[id] - Excluir uma turma
export const DELETE = withAuth(async (
  _request: NextRequest,
  userId: string,
  props: { params: Promise<{ id: string }> }
) => {
  const params = await props.params;
  try {
    // Verificar se a turma pertence ao usuário
    const turmaExistente = await prisma.turma.findFirst({
      where: {
        id: params.id,
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

    if (!turmaExistente) {
      return NextResponse.json(
        { error: "Turma não encontrada" },
        { status: 404 }
      );
    }

    // Excluir a turma (cascade delete vai excluir os alunos vinculados)
    await prisma.turma.delete({
      where: {
        id: params.id,
      },
    });

    return NextResponse.json(
      {
        message: "Turma excluída com sucesso",
        alunosExcluidos: turmaExistente._count.alunos,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erro ao excluir turma:", error);
    return NextResponse.json(
      { error: "Erro ao excluir turma" },
      { status: 500 }
    );
  }
});
