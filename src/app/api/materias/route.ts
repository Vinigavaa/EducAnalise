import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { createMateriaSchema } from "@/lib/validations/materia";
import { NextRequest, NextResponse } from "next/server";
import z from "zod";

export async function GET(request: NextRequest) {
    try {
        const session = await auth();

        if (!session || !session.user?.id) {
            return NextResponse.json(
                { error: "Não autorizado" },
                { status: 401 }
            );
        }

        const materias = await prisma.materia.findMany({
            where: {
                userId: session.user.id,
            }
        })

        return NextResponse.json(materias, { status: 200 });
    } catch (error) {
        console.error("Erro ao buscar turmas:", error);
        return NextResponse.json(
            { error: "Erro ao buscar turmas" },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await auth();

        if (!session || !session.user?.id) {
            return NextResponse.json(
                { error: "Não Autorizado" },
                { status: 401 }
            );
        }

        const body = await request.json();

        const validatedData = createMateriaSchema.parse(body);

        const NovaMateria = await prisma.materia.create({
            data: {
                nome: validatedData.nome,
                userId: session.user.id
            }
        })

        return NextResponse.json(NovaMateria, { status: 201 });

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