import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/auth-helper";
import prisma from "@/lib/prisma";
import { updateAlunoSchema } from "@/lib/validations/aluno";
import { z } from "zod";

export const GET = withAuth(async (
  _request: NextRequest,
  userId: string,
  props: { params: Promise<{ id: string }> }
) => {
  const params = await props.params;
  try {
    const aluno = await prisma.aluno.findFirst({
      where: {
        id: params.id,
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
        notas: {
          include: {
            prova: {
              select: {
                id: true,
                nome: true,
                data_prova: true,
              },
            },
            simuladoMateria: {
              include: {
                materia: {
                  select: {
                    id: true,
                    nome: true,
                  },
                },
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
});

export const PUT = withAuth(async (
  request: NextRequest,
  userId: string,
  props: { params: Promise<{ id: string }> }
) => {
  const params = await props.params;
  try {
    const alunoExistente = await prisma.aluno.findFirst({
      where: {
        id: params.id,
        turma: {
          userId,
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
});

export const DELETE = withAuth(async (
  _request: NextRequest,
  userId: string,
  props: { params: Promise<{ id: string }> }
) => {
  const params = await props.params;
  try {
    const alunoExistente = await prisma.aluno.findFirst({
      where: {
        id: params.id,
        turma: {
          userId,
        },
      },
    });

    if (!alunoExistente) {
      return NextResponse.json(
        { error: "Aluno não encontrado" },
        { status: 404 }
      );
    }

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
});
