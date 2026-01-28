import { withAuth } from "@/lib/auth-helper";
import prisma from "@/lib/prisma";
import { createMateriaSchema } from "@/lib/validations/materia";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

export const GET = withAuth(async (request: NextRequest, userId: string) => {
    try {
        const materias = await prisma.materia.findMany({
            where: {
                userId,
            }
        })

        return NextResponse.json(materias, { status: 200 });
    } catch (error) {
        console.error("Erro ao buscar matérias:", error);
        return NextResponse.json(
            { error: "Erro ao buscar matérias" },
            { status: 500 }
        );
    }
});

export const POST = withAuth(async (request: NextRequest, userId: string) => {
    try {
        const body = await request.json();

        const validatedData = createMateriaSchema.parse(body);

        const NovaMateria = await prisma.materia.create({
            data: {
                nome: validatedData.nome,
                userId
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

        console.error("Erro ao criar matéria:", error);
        return NextResponse.json(
            { error: "Erro ao criar matéria" },
            { status: 500 }
        );
    }
});