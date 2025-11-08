import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { updateProvaSchema } from "@/lib/validations/prova";
import { z } from "zod";

// GET /api/provas/[id] - Buscar uma prova específica
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

    const prova = await prisma.prova.findFirst({
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
            aluno: {
              select: {
                id: true,
                nome: true,
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
            aluno: {
              nome: "asc",
            },
          },
        },
        _count: {
          select: {
            notas: true,
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

    return NextResponse.json(prova, { status: 200 });
  } catch (error) {
    console.error("Erro ao buscar prova:", error);
    return NextResponse.json(
      { error: "Erro ao buscar prova" },
      { status: 500 }
    );
  }
}

// PUT /api/provas/[id] - Atualizar uma prova
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

    // Verificar se a prova existe e pertence a uma turma do usuário
    const provaExistente = await prisma.prova.findFirst({
      where: {
        id: params.id,
        turma: {
          userId: session.user.id,
        },
      },
    });

    if (!provaExistente) {
      return NextResponse.json(
        { error: "Prova não encontrada" },
        { status: 404 }
      );
    }

    const body = await request.json();

    // Converter data_prova se for string
    if (body.data_prova && typeof body.data_prova === 'string') {
      body.data_prova = new Date(body.data_prova);
    }

    // Validar dados com Zod
    const validatedData = updateProvaSchema.parse(body);

    // Se turmaId for fornecido, verificar se a nova turma pertence ao usuário
    if (validatedData.turmaId) {
      const turma = await prisma.turma.findFirst({
        where: {
          id: validatedData.turmaId,
          userId: session.user.id,
        },
      });

      if (!turma) {
        return NextResponse.json(
          { error: "Turma não encontrada ou não pertence ao usuário" },
          { status: 404 }
        );
      }
    }

    const provaAtualizada = await prisma.prova.update({
      where: {
        id: params.id,
      },
      data: {
        ...(validatedData.nome && { nome: validatedData.nome }),
        ...(validatedData.turmaId && { turmaId: validatedData.turmaId }),
        ...(validatedData.ano_letivo !== undefined && { ano_letivo: validatedData.ano_letivo }),
        ...(validatedData.peso !== undefined && { peso: validatedData.peso }),
        ...(validatedData.tipo && { tipo: validatedData.tipo }),
        ...(validatedData.data_prova !== undefined && { data_prova: validatedData.data_prova }),
      },
      include: {
        turma: {
          select: {
            id: true,
            nome: true,
            ano_letivo: true,
          },
        },
        _count: {
          select: {
            notas: true,
          },
        },
      },
    });

    return NextResponse.json(provaAtualizada, { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Dados inválidos", details: error.issues },
        { status: 400 }
      );
    }

    console.error("Erro ao atualizar prova:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar prova" },
      { status: 500 }
    );
  }
}

// DELETE /api/provas/[id] - Excluir uma prova
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

    // Verificar se a prova existe e pertence a uma turma do usuário
    const provaExistente = await prisma.prova.findFirst({
      where: {
        id: params.id,
        turma: {
          userId: session.user.id,
        },
      },
      include: {
        _count: {
          select: {
            notas: true,
          },
        },
      },
    });

    if (!provaExistente) {
      return NextResponse.json(
        { error: "Prova não encontrada" },
        { status: 404 }
      );
    }

    // Excluir a prova (cascade delete vai excluir as notas vinculadas)
    await prisma.prova.delete({
      where: {
        id: params.id,
      },
    });

    return NextResponse.json(
      {
        message: "Prova excluída com sucesso",
        notasExcluidas: provaExistente._count.notas,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erro ao excluir prova:", error);
    return NextResponse.json(
      { error: "Erro ao excluir prova" },
      { status: 500 }
    );
  }
}
