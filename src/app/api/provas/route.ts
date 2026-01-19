import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/auth-helper";
import prisma from "@/lib/prisma";
import { provaSchema } from "@/lib/validations/prova";
import { z } from "zod";
import { TipoProva } from "@/generated/prisma/enums";

// GET /api/provas - Listar todas as provas (opcionalmente filtrar por turma)
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

      const provas = await prisma.prova.findMany({
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
          _count: {
            select: {
              notas: true,
            },
          },
        },
        orderBy: {
          data_prova: "desc",
        },
      });

      return NextResponse.json(provas, { status: 200 });
    }

    // Listar todas as provas das turmas do usuário
    const provas = await prisma.prova.findMany({
      where: {
        turma: { userId },
      },
      include: {
        turma: {
          select: { id: true, nome: true, ano_letivo: true },
        },
        _count: {
          select: {
            notas: true,
          },
        },
      },
      orderBy: {
        data_prova: "desc",
      },
    });

    return NextResponse.json(provas, { status: 200 });
  } catch (error) {
    console.error("Erro ao buscar provas:", error);
    return NextResponse.json(
      { error: "Erro ao buscar provas" },
      { status: 500 }
    );
  }
});

// POST /api/provas - Criar nova prova
export const POST = withAuth(async (request: NextRequest, userId: string) => {
  try {
    const body = await request.json();

    // Converter data_prova se for string
    if (body.data_prova && typeof body.data_prova === 'string') {
      body.data_prova = new Date(body.data_prova);
    }

    // Validar dados com Zod
    const validatedData = provaSchema.parse(body);

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

    // Criar prova com matérias do simulado (se aplicável)
    const novaProva = await prisma.prova.create({
      data: {
        nome: validatedData.nome,
        turmaId: validatedData.turmaId,
        ano_letivo: validatedData.ano_letivo,
        peso: validatedData.peso,
        tipo: validatedData.tipo,
        data_prova: validatedData.data_prova,
        userId,
        // Criar matérias do simulado se for simulado
        ...(validatedData.tipo === TipoProva.SIMULADO && validatedData.materias && {
          simuladoMaterias: {
            create: validatedData.materias.map((m) => ({
              materiaId: m.materiaId,
              peso: m.peso,
            })),
          },
        }),
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

    return NextResponse.json(novaProva, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Dados inválidos", details: error.issues },
        { status: 400 }
      );
    }

    console.error("Erro ao criar prova:", error);
    return NextResponse.json(
      { error: "Erro ao criar prova" },
      { status: 500 }
    );
  }
});
