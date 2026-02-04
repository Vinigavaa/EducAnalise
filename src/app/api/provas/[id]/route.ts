import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/auth-helper";
import prisma from "@/lib/prisma";
import { provaSchema } from "@/lib/validations/prova";
import { z } from "zod";
import { TipoProva } from "@/generated/prisma";

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
        materia: {
          select: {
            id: true,
            nome: true,
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

export const PUT = withAuth(async (
  request: NextRequest,
  userId: string,
  props: { params: Promise<{ id: string }> }
) => {
  const params = await props.params;
  try {
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

    if (body.data_prova && typeof body.data_prova === 'string') {
      body.data_prova = new Date(body.data_prova);
    }

    const validatedData = provaSchema.partial().parse(body);

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

    if (validatedData.tipo === TipoProva.SIMULADO) {
      if (!validatedData.materias || validatedData.materias.length === 0) {
        return NextResponse.json(
          { error: "Simulados devem ter pelo menos uma matéria" },
          { status: 400 }
        );
      }

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

    const provaAtualizada = await prisma.$transaction(async (tx) => {
      if (validatedData.tipo === TipoProva.SIMULADO && validatedData.materias) {
        await tx.simuladoMateria.deleteMany({
          where: { provaId: params.id },
        });

        await tx.simuladoMateria.createMany({
          data: validatedData.materias.map((m) => ({
            provaId: params.id,
            materiaId: m.materiaId,
            peso: m.peso,
          })),
        });
      }

      if (validatedData.tipo === TipoProva.COMUM && provaExistente.tipo === TipoProva.SIMULADO) {
        await tx.simuladoMateria.deleteMany({
          where: { provaId: params.id },
        });
      }

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
          // Para prova comum, atualizar materiaId; para simulado, limpar materiaId
          ...(validatedData.tipo === TipoProva.COMUM
            ? { materiaId: validatedData.materiaId ?? null }
            : validatedData.tipo === TipoProva.SIMULADO
            ? { materiaId: null }
            : {}),
        },
        include: {
          turma: {
            select: {
              id: true,
              nome: true,
              ano_letivo: true,
            },
          },
          materia: {
            select: {
              id: true,
              nome: true,
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

export const DELETE = withAuth(async (
  _request: NextRequest,
  userId: string,
  props: { params: Promise<{ id: string }> }
) => {
  const params = await props.params;
  try {
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

    await prisma.$transaction(async (tx) => {
      await tx.nota.deleteMany({
        where: {
          provaId: params.id,
        },
      });

      await tx.simuladoMateria.deleteMany({
        where: {
          provaId: params.id,
        },
      });

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
