import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

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
        
    } catch(error){

    }
}