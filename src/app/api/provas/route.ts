import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { createProvaSchema } from "@/lib/validations/prova";
import { z } from "zod";

// GET /api/provas - Listar todas as provas (opcionalmente filtrar por turma)
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || !session.user?.id) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const turmaId = searchParams.get("turmaId");

    // Se turmaId for fornecido, primeiro verificar se a turma pertence ao usuário
    if (turmaId) {
      const turma = await prisma.turma.findFirst({
        where: {
          id: turmaId,
          userId: session.user.id,
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
        turma: { userId: session.user.id,},},
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
}

// POST /api/provas - Criar nova prova
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

    // Converter data_prova se for string
    if (body.data_prova && typeof body.data_prova === 'string') {
      body.data_prova = new Date(body.data_prova);
    }

    // Validar dados com Zod
    const validatedData = createProvaSchema.parse(body);

    // Verificar se a turma existe e pertence ao usuário
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

    const novaProva = await prisma.prova.create({
      data: {
        nome: validatedData.nome,
        turmaId: validatedData.turmaId,
        ano_letivo: validatedData.ano_letivo,
        peso: validatedData.peso,
        tipo: validatedData.tipo,
        data_prova: validatedData.data_prova,
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
}
