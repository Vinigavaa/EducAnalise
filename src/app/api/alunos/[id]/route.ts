import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { updateAlunoSchema } from "@/lib/validations/aluno";
import { z } from "zod";

// GET /api/alunos/[id] - Buscar um aluno específico
export async function GET(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  try {
    const session = await auth();

    if (!session || !session.user?.id) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }

    const aluno = await prisma.aluno.findFirst({
      where: {
        id: params.id,
        turma: {
          userId: session.user.id,
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
        notas: {
          include: {
            prova: {
              select: {
                id: true,
                nome: true,
                data_prova: true,
              },
            },
            materia: {
              select: {
                id: true,
                nome: true,
              },
            },
          },
          orderBy: {
            data_lancada: "desc",
          },
        },
      },
    });

    if (!aluno) {
      return NextResponse.json(
        { error: "Aluno não encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(aluno, { status: 200 });
  } catch (error) {
    console.error("Erro ao buscar aluno:", error);
    return NextResponse.json(
      { error: "Erro ao buscar aluno" },
      { status: 500 }
    );
  }
}

// PUT /api/alunos/[id] - Atualizar um aluno
export async function PUT(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  try {
    const session = await auth();

    if (!session || !session.user?.id) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }

    // Verificar se o aluno existe e pertence a uma turma do usuário
    const alunoExistente = await prisma.aluno.findFirst({
      where: {
        id: params.id,
        turma: {
          userId: session.user.id,
        },
      },
    });

    if (!alunoExistente) {
      return NextResponse.json(
        { error: "Aluno não encontrado" },
        { status: 404 }
      );
    }

    const body = await request.json();

    // Validar dados com Zod
    const validatedData = updateAlunoSchema.parse(body);

    const alunoAtualizado = await prisma.aluno.update({
      where: {
        id: params.id,
      },
      data: {
        ...(validatedData.nome && { nome: validatedData.nome }),
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

    return NextResponse.json(alunoAtualizado, { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Dados inválidos", details: error.issues },
        { status: 400 }
      );
    }

    console.error("Erro ao atualizar aluno:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar aluno" },
      { status: 500 }
    );
  }
}

// DELETE /api/alunos/[id] - Excluir um aluno
export async function DELETE(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  try {
    const session = await auth();

    if (!session || !session.user?.id) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }

    // Verificar se o aluno existe e pertence a uma turma do usuário
    const alunoExistente = await prisma.aluno.findFirst({
      where: {
        id: params.id,
        turma: {
          userId: session.user.id,
        },
      },
    });

    if (!alunoExistente) {
      return NextResponse.json(
        { error: "Aluno não encontrado" },
        { status: 404 }
      );
    }

    // Excluir o aluno
    await prisma.aluno.delete({
      where: {
        id: params.id,
      },
    });

    return NextResponse.json(
      { message: "Aluno excluído com sucesso" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erro ao excluir aluno:", error);
    return NextResponse.json(
      { error: "Erro ao excluir aluno" },
      { status: 500 }
    );
  }
}
