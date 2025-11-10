import { withAuth } from "@/lib/auth-helper";
import prisma from "@/lib/prisma";
import { updateMateriaSchema } from "@/lib/validations/materia";
import { NextRequest, NextResponse } from "next/server";
import z from "zod";

export const GET = withAuth(async (_request: NextRequest, userId: string, props: {params: Promise<{id: string}>}) => {
    const params = await props.params;

    try{
        const materia = await prisma.materia.findFirst({
            where: {id: params.id, userId}
        })

        if(!materia){
            return NextResponse.json(
                {error: "Não encontrado"},
                {status: 404}
            )
        }

        return NextResponse.json(materia, { status: 200 });
    } catch(error){
        console.error("Erro ao buscar matéria:", error);
        return NextResponse.json(
            { error: "Erro ao buscar matéria" },
            { status: 500 }
        );
    }
});

export const PUT = withAuth(async (request: NextRequest, userId: string, props: {params: Promise<{id: string}>}) => {
    const params = await props.params;

    try{
        const materiaExistente = await prisma.materia.findFirst({
            where: {
                id: params.id,
                userId,
            },
        })

        if(!materiaExistente){
            return NextResponse.json(
                {error: "Essa matéria não existe"},
                {status: 404}
            )
        }

        const body = await request.json();

        const validatedData = updateMateriaSchema.parse(body);

        const materiaAtualizada = await prisma.materia.update({
            where: {
                id: params.id,
            },
            data: {
                //Atualiza nome somente se existir em validatedData, Se não existir, data fica vazio ({}) e nada é alterado no banco
                ...(validatedData.nome && {nome: validatedData.nome}),
            }
        });

        return NextResponse.json(materiaAtualizada, {status: 200});
    } catch(error){
        if(error instanceof z.ZodError){
            return NextResponse.json(
                {error: "Dados Inválidos"},
                {status: 400}
            );
        }

        console.error("Erro ao atualizar Matéria!");

        return NextResponse.json(
            {error: "Erro ao atualizar Matéria!"},
            {status: 500}
        );
    }
});

export const DELETE = withAuth(async (_request: NextRequest, userId: string, props: {params: Promise<{id: string}>}) => {
    const params = await props.params;

    try {
        const materia = await prisma.materia.findFirst({
            where: {
                id: params.id,
                userId,
            },
        });

        if (!materia) {
            return NextResponse.json(
                { error: "Matéria não encontrada" },
                { status: 404 }
            );
        }

        await prisma.materia.delete({
            where: {
                id: params.id,
            },
        });

        return NextResponse.json(
            { message: "Matéria deletada com sucesso" },
            { status: 200 }
        );
    } catch (error) {
        console.error("Erro ao deletar matéria:", error);
        return NextResponse.json(
            { error: "Erro ao deletar matéria" },
            { status: 500 }
        );
    }
});