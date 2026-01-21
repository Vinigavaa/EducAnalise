import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/auth-helper";
import prisma from "@/lib/prisma";
import { provaSchema } from "@/lib/validations/prova";
import { z } from "zod";
import { TipoProva } from "@/generated/prisma/enums";

// GET /api/provas/[id] - Buscar uma prova específica
export const GET = withAuth(async (
  _request: NextRequest,
  userId: string,
  props: { params: Promise<{ id: string }> }
) => {
  const params = await props.params;
  try {
    const prova = await prisma.prova.findFirst({
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
        simuladoMaterias: {
          include: {
            materia: {
              select: {
                id: true,
                nome: true,
              },
            },
          },
          orderBy: {
            materia: {
              nome: "asc",
            },
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
});

// PUT /api/provas/[id] - Atualizar uma prova
export const PUT = withAuth(async (
  request: NextRequest,
  userId: string,
  props: { params: Promise<{ id: string }> }
) => {
  const params = await props.params;
  try {
    // Verificar se a prova existe e pertence a uma turma do usuário
    const provaExistente = await prisma.prova.findFirst({
      where: {
        id: params.id,
        turma: {
          userId,
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
    const validatedData = provaSchema.partial().parse(body);

    // Se turmaId for fornecido, verificar se a nova turma pertence ao usuário
    if (validatedData.turmaId) {
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
    }

    // Validar matérias para simulado
    if (validatedData.tipo === TipoProva.SIMULADO) {
      if (!validatedData.materias || validatedData.materias.length === 0) {
        return NextResponse.json(
          { error: "Simulados devem ter pelo menos uma matéria" },
          { status: 400 }
        );
      }

      // Verificar se todas as matérias existem e pertencem ao usuário
      const materiasIds = validatedData.materias.map((m) => m.materiaId);
      const materiasExistentes = await prisma.materia.findMany({
        where: {
          id: { in: materiasIds },
          userId,
        },
      });

      if (materiasExistentes.length !== materiasIds.length) {
        return NextResponse.json(
          { error: "Uma ou mais matérias não foram encontradas" },
          { status: 404 }
        );
      }
    }

    // Usar transação para atualizar prova e matérias do simulado
    const provaAtualizada = await prisma.$transaction(async (tx) => {
      // Se for simulado e tem matérias, atualizar as matérias
      if (validatedData.tipo === TipoProva.SIMULADO && validatedData.materias) {
        // Deletar matérias antigas
        await tx.simuladoMateria.deleteMany({
          where: { provaId: params.id },
        });

        // Criar novas matérias
        await tx.simuladoMateria.createMany({
          data: validatedData.materias.map((m) => ({
            provaId: params.id,
            materiaId: m.materiaId,
            peso: m.peso,
          })),
        });
      }

      // Se mudou de simulado para comum, deletar matérias
      if (validatedData.tipo === TipoProva.COMUM && provaExistente.tipo === TipoProva.SIMULADO) {
        await tx.simuladoMateria.deleteMany({
          where: { provaId: params.id },
        });
      }

      // Atualizar a prova
      return tx.prova.update({
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
          simuladoMaterias: {
            include: {
              materia: {
                select: {
                  id: true,
                  nome: true,
                },
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
});

// DELETE /api/provas/[id] - Excluir uma prova
export const DELETE = withAuth(async (
  _request: NextRequest,
  userId: string,
  props: { params: Promise<{ id: string }> }
) => {
  const params = await props.params;
  try {
    // Verificar se a prova existe e pertence a uma turma do usuário
    const provaExistente = await prisma.prova.findFirst({
      where: {
        id: params.id,
        turma: {
          userId,
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

    // Excluir a prova e suas dependências em uma transação
    await prisma.$transaction(async (tx) => {
      // Primeiro, excluir as notas vinculadas
      await tx.nota.deleteMany({
        where: {
          provaId: params.id,
        },
      });

      // Depois, excluir os simuladoMaterias (se houver)
      await tx.simuladoMateria.deleteMany({
        where: {
          provaId: params.id,
        },
      });

      // Por fim, excluir a prova
      await tx.prova.delete({
        where: {
          id: params.id,
        },
      });
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
});
