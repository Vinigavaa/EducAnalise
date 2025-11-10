import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { updateMateriaSchema } from "@/lib/validations/materia";
import { NextRequest, NextResponse } from "next/server";
import z from "zod";

export async function GET(request: NextRequest, props: {params: Promise<{id: string}>}){
    const params = await props.params;

    try{
        const session = await auth();

        if(!session || session.user?.id){
            return NextResponse.json( {error: "Não Autorizado"}, {status: 401})
        }

        const materia = await prisma.materia.findFirst({
            where: {id: params.id, userId: session.user.id}
        })

        if(!materia){
            return NextResponse.json(
                {error: "Não encontrado"},
                {status: 404}
            )
        }

        return NextResponse.json(materia, { status: 200 });
    } catch(error){
        console.error("Erro ao buscar materia:", error);
        return NextResponse.json(
        { error: "Erro ao buscar materia" },
        { status: 500 }
        );
    }
}

export async function PUT(request: NextRequest, props: {params: Promise<{id: string}>}){
    const params = await props.params;

    try{
        const session = await auth();

        if(!session || session.user?.id){
            return NextResponse.json(
                {error: "Não Autorizado"},
                {status: 401}
            )
        }

        const materiaExistente = await prisma.materia.findFirst({
            where: {
                id: params.id,
                userId: session.user.id,
            },
        })

        if(!materiaExistente){
            return NextResponse.json(
                {error: "Essa prova não existe"},
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
}